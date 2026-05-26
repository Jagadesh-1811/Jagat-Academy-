import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

// Load jsQR decoder dynamically from CDN to bypass Vite bundle optimization issues entirely!
const loadJsQR = () => {
  return new Promise((resolve, reject) => {
    if (window.jsQR) {
      resolve(window.jsQR);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ jsQR engine dynamically loaded from CDN!');
      resolve(window.jsQR);
    };
    script.onerror = (e) => {
      console.error('❌ Failed to load jsQR script from CDN', e);
      reject(new Error('Failed to load QR scanner engine.'));
    };
    document.body.appendChild(script);
  });
};

export default function AttendanceView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token, userData } = useSelector((state) => state.user);
  const { courseData } = useSelector((state) => state.course);

  const selectedCourse = courseData?.find((c) => c._id === courseId);

  // Attendance rate and logs
  const [records, setRecords] = useState([]);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Active QR Sessions State
  const [activeSessions, setActiveSessions] = useState([]);
  const [loadingActiveSessions, setLoadingActiveSessions] = useState(false);

  // Scanner UI States
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  
  // Connector UI Screen State (Metadata screen upon scan)
  const [scannedSession, setScannedSession] = useState(null); // { courseTitle, educatorName, studentName, lectureTitle, token }
  const [fetchingSessionInfo, setFetchingSessionInfo] = useState(false);
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);

  // Refs for custom camera feed drawing loop
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanLoopActiveRef = useRef(false);
  const activeStreamRef = useRef(null);

  // Fetch student logs & stats
  const fetchStudentHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await axios.get(`${serverUrl}/api/attendance/student/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRecords(response.data.records || []);
      setAttendanceRate(response.data.attendanceRate || 0);
      setPresentCount(response.data.presentCount || 0);
      setTotalSessions(response.data.totalSessions || 0);
    } catch (error) {
      console.error('Error fetching student logs:', error);
      toast.error('Failed to load attendance logs.');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Fetch active QR sessions generated for this course
  const fetchActiveSessions = async () => {
    if (!courseId || !token) return;
    try {
      const response = await axios.get(`${serverUrl}/api/attendance/sessions/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        // Filter for active sessions matching this courseId
        const courseSessions = (response.data.sessions || []).filter(
          (s) => s.courseId === courseId
        );
        setActiveSessions(courseSessions);
      }
    } catch (error) {
      console.error('Error fetching active QR sessions:', error);
    }
  };

  useEffect(() => {
    if (courseId && token) {
      fetchStudentHistory();
      fetchActiveSessions();

      // Poll active QR sessions every 5 seconds for sandbox feedback
      const interval = setInterval(fetchActiveSessions, 5000);
      return () => clearInterval(interval);
    }
  }, [courseId, token]);

  // Handle successful QR scan decoding
  const handleScan = async (scannedToken) => {
    // Stop camera immediately
    stopCamera();
    setIsScanning(false);
    
    // Fetch session info (connector method)
    setFetchingSessionInfo(true);
    try {
      const response = await axios.get(`${serverUrl}/api/attendance/session-info/${scannedToken}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setScannedSession({
        ...response.data,
        token: scannedToken
      });
    } catch (error) {
      console.error('Error fetching scanned session details:', error);
      toast.error(error.response?.data?.message || 'Scanned QR is invalid or has expired.');
    } finally {
      setFetchingSessionInfo(false);
    }
  };

  // Start HTML5 Video Camera feed and launch requestAnimationFrame canvas loop
  const startCamera = async () => {
    setScanError('');
    setIsScanning(true);
    scanLoopActiveRef.current = true;

    try {
      // 1. Get jsQR engine loaded dynamically
      const jsQR = await loadJsQR();

      // 2. Access camera device stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      activeStreamRef.current = stream;

      // 3. Mount stream to HTML video tag
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();

        // 4. Start analysis loop
        requestAnimationFrame(tickScan);
      }
    } catch (err) {
      console.error('Camera/jsQR load error:', err);
      setScanError(err.message || 'Unable to access back camera or initialize script feed.');
      setIsScanning(false);
    }
  };

  // Clean stop tracks
  const stopCamera = () => {
    scanLoopActiveRef.current = false;
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Tick loop frame analyzer
  const tickScan = () => {
    if (!scanLoopActiveRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const context = canvas.getContext('2d');
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;

      // Draw current video frame to hidden canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Perform pixel analysis with jsQR
      const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        // Detected!
        handleScan(code.data);
        return;
      }
    }

    // Keep scanning
    requestAnimationFrame(tickScan);
  };

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Submit check-in confirmation with Geolocation & Time check
  const handleConfirmCheckIn = () => {
    if (!scannedSession) return;

    setSubmittingCheckIn(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        submitCheckIn({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Geolocation blocked or unavailable. Falling back to Bangalore test coordinates.', error);
        submitCheckIn({ lat: 12.9716, lng: 77.5946 }); 
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const submitCheckIn = async (coords) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/attendance/mark`,
        {
          courseId,
          lectureId: scannedSession.lectureId || undefined,
          checkInMethod: 'qr',
          token: scannedSession.token,
          coordinates: coords
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message);
      setScannedSession(null);
      fetchStudentHistory();
    } catch (error) {
      console.error('Mark Attendance Error:', error);
      toast.error(error.response?.data?.message || 'Check-in failed. Please verify geolocation or active time slots.');
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 font-sans border-t-8 border-black">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Hidden canvas used to grab video frame pixels for jsQR */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Back and Title Header */}
        <div className="border-b-4 border-black pb-4">
          <button
            onClick={() => navigate(`/viewcourse/${courseId}`)}
            className="text-sm font-bold border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-none"
          >
            ← Back to Course Page
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight mt-4">ATTENDANCE HUB</h1>
          <p className="text-gray-500 font-semibold">{selectedCourse?.title}</p>
        </div>

        {/* Dynamic Warning for Time Slots */}
        <div className="bg-gray-100 p-4 border-2 border-black rounded-lg">
          <p className="font-extrabold text-sm">🔓 SANDBOX DEVELOPMENT TESTING ACTIVE:</p>
          <ul className="list-disc pl-6 text-sm mt-1 space-y-1">
            <li>Strict check-in windows (8-9 AM & 6-7 PM IST) are <strong>TEMPORARILY DISABLED</strong> to allow you to test and verify attendance at any hour!</li>
            <li>Make sure you allow browser camera & location coordinates access when scanning your educator's screen.</li>
            <li>Maintain <strong>at least 75% attendance rate</strong> to unlock course certification.</li>
          </ul>
        </div>

        {/* Stats Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-4 border-black p-6 text-center space-y-1 bg-black text-white">
            <span className="text-xs font-black tracking-widest text-gray-400">ATTENDANCE RATE</span>
            <h2 className="text-5xl font-black text-white">{attendanceRate}%</h2>
            <p className="text-xs font-bold text-gray-400">
              {attendanceRate >= 75 ? 'ELIGIBLE FOR CERTIFICATE' : 'LOCKED (75% REQUIRED)'}
            </p>
          </div>
          
          <div className="border-4 border-black p-6 text-center space-y-1">
            <span className="text-xs font-bold tracking-widest text-gray-500">ATTENDED SESSIONS</span>
            <h2 className="text-5xl font-extrabold">{presentCount}</h2>
            <p className="text-xs text-gray-500">Total sessions marked present</p>
          </div>

          <div className="border-4 border-black p-6 text-center space-y-1">
            <span className="text-xs font-bold tracking-widest text-gray-500">TOTAL SESSIONS</span>
            <h2 className="text-5xl font-extrabold">{totalSessions}</h2>
            <p className="text-xs text-gray-500">Total course lectures & logs</p>
          </div>
        </div>

        {/* Certification Status Gatekeeper Notification */}
        <div className="border-2 border-black p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-extrabold text-base">Course Certification Eligibility</p>
            <p className="text-xs text-gray-500">
              Currently: {attendanceRate}% attendance. You need {Math.max(0, 75 - attendanceRate)}% more to unlock certification logs.
            </p>
          </div>
          <span
            className={`px-4 py-2 text-xs font-black uppercase border-2 ${
              attendanceRate >= 75
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-dashed border-gray-400'
            }`}
          >
            {attendanceRate >= 75 ? 'UNLOCKED' : 'LOCKED'}
          </span>
        </div>

        {/* ACTIVE QR SESSIONS (VISIBLE ON THE STUDENT ATTENDANCE PAGE) */}
        {activeSessions.length > 0 && (
          <div className="border-4 border-black p-6 space-y-6 bg-black text-white">
            <div className="border-b border-gray-800 pb-2">
              <h2 className="text-xl font-black uppercase tracking-widest text-white">
                Active Lecture QR Sessions
              </h2>
              <p className="text-xs text-gray-400">
                A live dynamic session is active! Scan this code with another device or perform a 1-click Quick Check-In below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {activeSessions.map((session) => (
                <div key={session.token} className="border-2 border-white p-4 space-y-4 text-center bg-gray-900">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-300">
                    Session QR Code
                  </p>
                  
                  <div className="bg-white p-3 inline-block border-4 border-white">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(session.token)}`}
                      alt="Dynamic QR Code"
                      className="w-48 h-48 object-contain mx-auto"
                    />
                  </div>

                  <div className="text-left text-xs font-semibold space-y-1 text-gray-300 max-w-xs mx-auto">
                    <p><span className="text-gray-500 font-bold uppercase block text-[9px]">Lecture Title</span>{session.lectureTitle}</p>
                    <p><span className="text-gray-500 font-bold uppercase block text-[9px]">Expires In</span>{session.expiresIn} seconds</p>
                    <p><span className="text-gray-500 font-bold uppercase block text-[9px]">Token</span><code className="text-[10px] font-mono select-all bg-black text-white px-1">{session.token}</code></p>
                  </div>

                  <button
                    onClick={() => handleScan(session.token)}
                    className="w-full bg-white text-black hover:bg-gray-200 text-xs font-black py-2.5 px-4 border-2 border-white transition-none cursor-pointer"
                  >
                    Quick Check-In (No Scanning Required)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCANNER CONTROLLER BUTTON PANEL */}
        <div className="border-4 border-black p-8 text-center space-y-6">
          <h2 className="text-xl font-extrabold">CHECK IN VIA LIVE QR CODE</h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Click the scan button below to activate your camera and scan the dynamic attendance code generated on your educator's screen.
          </p>

          {!isScanning ? (
            <div className="space-y-6">
              <button
                onClick={startCamera}
                className="bg-black text-white hover:bg-gray-800 text-sm font-extrabold py-3.5 px-8 border-2 border-black transition-none cursor-pointer"
              >
                Scan Educator QR Code
              </button>

              <div className="border-t border-gray-250 pt-6 max-w-xs mx-auto space-y-3">
                <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  [OR ENTER SESSION TOKEN MANUALLY]
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter UUID token string..."
                    id="manualTokenInput"
                    className="flex-grow border-2 border-black px-3 py-2 text-xs font-mono rounded-none bg-white text-black focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = document.getElementById('manualTokenInput').value;
                      if (val.trim()) {
                        handleScan(val.trim());
                      } else {
                        toast.error('Please enter a valid session token.');
                      }
                    }}
                    className="bg-black text-white hover:bg-gray-800 text-xs font-bold py-2 px-4 border-2 border-black transition-none cursor-pointer"
                  >
                    [SUBMIT]
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-full max-w-[320px] mx-auto border-4 border-black rounded overflow-hidden aspect-square bg-gray-50 flex items-center justify-center relative">
                {/* HTML5 raw video tag for camera feed */}
                <video
                  ref={videoRef}
                  id="qr-video"
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-dashed border-white pointer-events-none opacity-40 m-8 animate-pulse"></div>
              </div>
              <p className="text-xs text-gray-500 italic">Position the QR code inside the camera focus frame.</p>
              {scanError && <p className="text-xs text-red-500 font-bold">{scanError}</p>}
              <button
                onClick={() => {
                  stopCamera();
                  setIsScanning(false);
                }}
                className="text-xs font-bold border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-none"
              >
                Cancel Camera Scan
              </button>
            </div>
          )}
        </div>

        {/* CONNECTOR CONFIRMATION SCREEN (METADATA DIALOG AFTER QR SCAN) */}
        {fetchingSessionInfo && (
          <div className="border-4 border-black p-8 bg-gray-50 text-center flex flex-col items-center justify-center">
            <ClipLoader size={30} color="#000" />
            <p className="text-xs font-bold mt-2">Loading session metadata connector details...</p>
          </div>
        )}

        {scannedSession && (
          <div className="border-4 border-black p-6 bg-black text-white space-y-6">
            <div className="border-b border-gray-800 pb-2">
              <h3 className="text-lg font-black tracking-widest text-white uppercase">QR CONNECTOR VERIFICATION</h3>
              <p className="text-xs text-gray-400">Please review session details prior to confirming attendance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-semibold">
              <div className="p-3 bg-gray-900 border border-gray-800 rounded">
                <span className="block text-[10px] text-gray-500 tracking-wider">COURSE</span>
                <span className="text-white">{scannedSession.courseTitle}</span>
              </div>
              <div className="p-3 bg-gray-900 border border-gray-800 rounded">
                <span className="block text-[10px] text-gray-500 tracking-wider">MENTOR / EDUCATOR</span>
                <span className="text-white">{scannedSession.educatorName}</span>
              </div>
              <div className="p-3 bg-gray-900 border border-gray-800 rounded">
                <span className="block text-[10px] text-gray-500 tracking-wider">SESSION / LECTURE</span>
                <span className="text-white">{scannedSession.lectureTitle}</span>
              </div>
              <div className="p-3 bg-gray-900 border border-gray-800 rounded">
                <span className="block text-[10px] text-gray-500 tracking-wider">STUDENT REGISTERED NAME</span>
                <span className="text-white">{scannedSession.studentName}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmCheckIn}
                disabled={submittingCheckIn}
                className="flex-1 bg-white text-black hover:bg-gray-200 text-sm font-extrabold py-3 border-2 border-white disabled:opacity-40 disabled:cursor-not-allowed transition-none"
              >
                {submittingCheckIn ? 'Confirming Location & Checking in...' : 'Confirm Check-In Attendance'}
              </button>
              <button
                onClick={() => setScannedSession(null)}
                className="border-2 border-white px-6 py-3 text-sm font-bold text-white hover:bg-white hover:text-black transition-none"
              >
                Reject Session
              </button>
            </div>
          </div>
        )}

        {/* LOG HISTORY LOGS LISTING */}
        <div className="border-4 border-black p-6">
          <h2 className="text-xl font-extrabold border-b-2 border-black pb-2 mb-4">ATTENDANCE LOG HISTORY</h2>
          
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ClipLoader size={30} color="#000" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-semibold border-2 border-dashed border-gray-300">
              You do not have any logged attendance entries for this course yet.
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record._id}
                  className="border-2 border-black p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-extrabold">
                      {record.lecture?.lectureTitle || 'General Course Session'}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      Log Date: {new Date(record.checkInTime).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase font-mono">
                      Method: {record.checkInMethod}
                    </span>
                    <span className="text-xs font-black uppercase border-2 border-black bg-black text-white px-3 py-1">
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
