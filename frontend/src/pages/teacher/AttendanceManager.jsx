import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

export default function AttendanceManager() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token, userData } = useSelector((state) => state.user);
  const { creatorCourseData } = useSelector((state) => state.course);

  const selectedCourse = creatorCourseData?.find((c) => c._id === courseId);

  // GPS State
  const [coordinates, setCoordinates] = useState({ lat: 12.9716, lng: 77.5946 }); // Default coordinates set for sandbox ease
  const [fetchingGPS, setFetchingGPS] = useState(false);

  // Active Session QR State
  const [qrToken, setQrToken] = useState('');
  const [generatingQR, setGeneratingQR] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Students list and bulk state
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Selected lecture for marking
  const [selectedLectureId, setSelectedLectureId] = useState('');

  // Fetch student lists and past logs
  const fetchLogsAndStudents = async () => {
    try {
      setLoadingHistory(true);
      const response = await axios.get(`${serverUrl}/api/attendance/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStudents(response.data.enrolledStudents || []);
      setAttendanceRecords(response.data.records || []);
    } catch (error) {
      console.error('Error fetching course attendance:', error);
      toast.error('Failed to retrieve students and attendance history');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (courseId && token) {
      fetchLogsAndStudents();
    }
  }, [courseId, token]);

  // Request Educator Location
  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setFetchingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setFetchingGPS(false);
        toast.success('Educator coordinates successfully updated.');
      },
      (error) => {
        console.error('GPS error:', error);
        setCoordinates({ lat: 12.9716, lng: 77.5946 }); // Default fallback coordinates
        setFetchingGPS(false);
        toast.info('Fallback coordinates set (GPS blocked).');
      },
      { enableHighAccuracy: true }
    );
  };

  // Generate dynamic QR code
  const handleGenerateQR = async () => {
    if (!coordinates) {
      toast.error('Please configure educator coordinates first before generating live QR sessions.');
      return;
    }

    setGeneratingQR(true);
    try {
      const response = await axios.post(
        `${serverUrl}/api/attendance/qr/generate`,
        {
          courseId,
          lectureId: selectedLectureId || undefined,
          lat: coordinates.lat,
          lng: coordinates.lng
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQrToken(response.data.token);
      setTimeLeft(response.data.expiresIn); // 300 seconds
      toast.success('Live attendance QR code generated!');
    } catch (error) {
      console.error('QR Generate Error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate QR code.');
    } finally {
      setGeneratingQR(false);
    }
  };

  // Countdown timer logic
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setQrToken('');
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // State for manual toggle records: studentId -> status
  const [manualStatuses, setManualStatuses] = useState({});

  const handleManualStatusChange = (studentId, status) => {
    setManualStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  // Save manual/bulk attendance records
  const handleSaveBulkAttendance = async () => {
    const payloadRecords = Object.entries(manualStatuses).map(([studentId, status]) => ({
      studentId,
      status
    }));

    if (payloadRecords.length === 0) {
      toast.error('No manual toggles selected yet.');
      return;
    }

    setSavingAttendance(true);
    try {
      const response = await axios.post(
        `${serverUrl}/api/attendance/manual-bulk`,
        {
          courseId,
          lectureId: selectedLectureId || undefined,
          records: payloadRecords
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message);
      setManualStatuses({});
      fetchLogsAndStudents();
    } catch (error) {
      console.error('Bulk override error:', error);
      toast.error(error.response?.data?.message || 'Failed to process bulk override.');
    } finally {
      setSavingAttendance(false);
    }
  };

  // Natively export attendance data to CSV file
  const handleExportCSV = () => {
    if (attendanceRecords.length === 0) {
      toast.info('No attendance records available to export.');
      return;
    }

    const headers = ['Student Name', 'Student Email', 'Lecture Title', 'Status', 'Check-In Method', 'Check-In Time', 'Overridden'];
    const rows = attendanceRecords.map((r) => [
      r.student?.name || 'Unknown',
      r.student?.email || 'N/A',
      r.lecture?.lectureTitle || 'General Session',
      r.status,
      r.checkInMethod,
      new Date(r.checkInTime).toLocaleString(),
      r.isOverridden ? 'Yes' : 'No'
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedCourse?.title || 'Course'}_Attendance_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 font-sans border-t-8 border-black">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Back and Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b-4 border-black pb-4 gap-4">
          <div>
            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="text-sm font-bold border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-none"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight mt-3">ATTENDANCE MANAGEMENT</h1>
            <p className="text-gray-500 font-semibold">{selectedCourse?.title}</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-black text-white hover:bg-gray-800 text-sm font-extrabold py-3 px-6 border-2 border-black transition-none"
            >
              Export CSV Report
            </button>
          </div>
        </div>

        {/* Dynamic Warning for Time Slots */}
        <div className="bg-gray-100 p-4 border-2 border-black rounded-lg">
          <p className="font-extrabold text-sm">🔓 SANDBOX DEVELOPMENT TESTING ACTIVE:</p>
          <ul className="list-disc pl-6 text-sm mt-1 space-y-1">
            <li>Strict daily active windows (8-9 AM & 6-7 PM IST) are <strong>TEMPORARILY DISABLED</strong> to allow you to generate sessions and verify logs at any hour!</li>
            <li>Geo-fencing coordinates restrictions are <strong>BYPASSED</strong> to ensure instant check-ins from any geographic location!</li>
            <li>The generated live QR code automatically expires in 5 minutes.</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: Live Session QR Generator */}
          <div className="border-4 border-black p-6 space-y-6">
            <h2 className="text-xl font-extrabold border-b-2 border-black pb-2">LIVE SESSION GENERATOR</h2>

            {/* Lecture Selector */}
            <div className="space-y-3">
              <span className="block text-sm font-bold">1. Link Attendance Session to specific lecture (Optional)</span>
              <select
                className="w-full border-2 border-black p-3 bg-white text-sm"
                value={selectedLectureId}
                onChange={(e) => setSelectedLectureId(e.target.value)}
              >
                <option value="">General Course Attendance Session</option>
                {selectedCourse?.lectures?.map((lecture) => (
                  <option key={lecture._id} value={lecture._id}>
                    Lecture: {lecture.lectureTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Live Session QR Button */}
            <div className="space-y-3 pt-3">
              <span className="block text-sm font-bold">2. Launch Session QR Code</span>
              <button
                onClick={handleGenerateQR}
                disabled={generatingQR}
                className="w-full bg-black text-white hover:bg-gray-800 text-base font-extrabold py-4 border-2 border-black disabled:opacity-40 disabled:cursor-not-allowed transition-none"
              >
                {generatingQR ? 'Initializing dynamic session...' : 'Generate 5-Minute Live QR Code'}
              </button>
            </div>

            {/* Rendered Live QR Code using public QR Code generator API */}
            {qrToken && (
              <div className="bg-black text-white p-6 rounded-lg text-center space-y-4">
                <p className="text-sm font-extrabold tracking-widest text-white">LIVE SESSION ACTIVE</p>
                <div className="bg-gray-900 border border-neutral-800 p-2 rounded font-mono text-[10px] break-all text-gray-300 select-all">
                  Token: {qrToken}
                </div>
                <div className="flex justify-center bg-white p-4 inline-block mx-auto rounded border-4 border-black">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrToken)}`}
                    alt="Live Check-in QR"
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-black text-white">
                    Expires in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </p>
                  <p className="text-xs text-gray-400">Tokens refresh or expire continuously to protect session authenticity.</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Manual Overrides & Bulk Actions */}
          <div className="border-4 border-black p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
                <h2 className="text-xl font-extrabold">STUDENT ATTENDANCE OVERRIDE</h2>
                <span className="text-xs bg-black text-white font-extrabold px-3 py-1">BULK MARKING</span>
              </div>

              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ClipLoader size={30} color="#000" />
                  <span className="text-xs text-gray-500 font-bold mt-2">Loading students roster...</span>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-semibold border-2 border-dashed border-gray-300">
                  No students are currently enrolled in this course.
                </div>
              ) : (
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                  {students.map((student) => {
                    const activeManual = manualStatuses[student._id];
                    
                    const isAlreadyPresent = attendanceRecords.some(
                      (r) => r.student?._id === student._id && 
                      (selectedLectureId ? r.lecture?._id === selectedLectureId : !r.lecture) && 
                      (r.status === 'present' || r.status === 'late')
                    );

                    return (
                      <div
                        key={student._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-2 border-black gap-2"
                      >
                        <div>
                          <p className="text-sm font-extrabold">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                          {isAlreadyPresent && (
                            <span className="text-[10px] bg-black text-white font-bold px-2 py-0.5 rounded mt-1 inline-block">
                              Present in Logs
                            </span>
                          )}
                        </div>

                        {/* Status Select Toggles */}
                        <div className="flex gap-1">
                          {['present', 'absent', 'late', 'excused'].map((statusOption) => (
                            <button
                              key={statusOption}
                              onClick={() => handleManualStatusChange(student._id, statusOption)}
                              className={`text-[10px] uppercase font-bold py-1.5 px-2 border border-black transition-none ${
                                activeManual === statusOption
                                  ? 'bg-black text-white'
                                  : 'bg-white text-black hover:bg-gray-100'
                              }`}
                            >
                              {statusOption}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={handleSaveBulkAttendance}
              disabled={savingAttendance || Object.keys(manualStatuses).length === 0}
              className="w-full bg-black text-white hover:bg-gray-800 text-sm font-extrabold py-3.5 border-2 border-black disabled:opacity-40 disabled:cursor-not-allowed mt-6 transition-none"
            >
              {savingAttendance ? 'Applying manual overrides...' : 'Apply Manual Override Log'}
            </button>
          </div>
        </div>

        {/* BOTTOM: Past Sessions Attendance Logs Table */}
        <div className="border-4 border-black p-6">
          <h2 className="text-xl font-extrabold border-b-2 border-black pb-2 mb-4">ATTENDANCE LOG HISTORY</h2>
          
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ClipLoader size={30} color="#000" />
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-semibold border-2 border-dashed border-gray-300">
              No check-in log records have been tagged for this course yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-black bg-gray-50">
                    <th className="p-3 font-bold">Student</th>
                    <th className="p-3 font-bold">Email</th>
                    <th className="p-3 font-bold">Linked Lecture</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold">Check-In Method</th>
                    <th className="p-3 font-bold">Check-In Time</th>
                    <th className="p-3 font-bold">Overridden</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3 font-semibold">{record.student?.name || 'Unknown'}</td>
                      <td className="p-3 text-xs text-gray-600">{record.student?.email || 'N/A'}</td>
                      <td className="p-3 text-xs font-semibold">{record.lecture?.lectureTitle || 'General Session'}</td>
                      <td className="p-3">
                        <span className="text-[10px] font-black uppercase border border-black px-2 py-0.5 inline-block">
                          {record.status}
                        </span>
                      </td>
                      <td className="p-3 uppercase text-xs font-mono">{record.checkInMethod}</td>
                      <td className="p-3 text-xs text-gray-600">{new Date(record.checkInTime).toLocaleString()}</td>
                      <td className="p-3 text-xs font-semibold">{record.isOverridden ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
