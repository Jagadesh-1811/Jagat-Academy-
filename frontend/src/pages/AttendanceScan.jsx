import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { toast } from 'react-toastify';
import {
  FaQrcode, FaUserGraduate, FaBookOpen, FaChalkboardTeacher,
  FaCheckCircle, FaSpinner, FaArrowLeft
} from 'react-icons/fa';

const AttendanceScan = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyMarked, setAlreadyMarked] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirm, setConfirm] = useState(false);

  // Fetch session info on mount
  useEffect(() => {
    if (!token) {
      setError('No QR token found. Please scan a valid attendance QR code.');
      setLoading(false);
      return;
    }
    fetchSessionInfo();
  }, [token]);

  const fetchSessionInfo = async () => {
    try {
      const tokenBearer = localStorage.getItem('token');
      const res = await axios.get(`${serverUrl}/api/attendance/session-info/${token}`, {
        headers: { Authorization: `Bearer ${tokenBearer}` }
      });
      setSessionInfo(res.data);

      // Pre-fill form from user data
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setName(user.name || res.data.studentName || '');
      setEmail(user.email || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load session. The QR code may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter your email.');
      return;
    }
    if (!confirm) {
      toast.error('Please confirm your attendance by checking the box.');
      return;
    }

    setSubmitting(true);
    try {
      const tokenBearer = localStorage.getItem('token');
      await axios.post(`${serverUrl}/api/attendance/mark`, {
        checkInMethod: 'qr',
        token,
        courseId: sessionInfo.courseId,
        lectureId: sessionInfo.lectureId
      }, {
        headers: { Authorization: `Bearer ${tokenBearer}` }
      });

      setSubmitted(true);
      toast.success('✅ Attendance marked successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to mark attendance.';
      if (msg.includes('already marked')) {
        setSubmitted(true);
        setAlreadyMarked(true);
        toast.info('📋 You were already marked present for this session.');
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Error state
  if (error && !sessionInfo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
          <div className="w-16 h-16 bg-red-100 border-2 border-black flex items-center justify-center mx-auto mb-4">
            <FaQrcode className="text-2xl text-red-600" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight mb-2">Invalid or Expired QR</h1>
          <p className="text-gray-600 font-medium text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/attendance')}
            className="bg-black text-white px-6 py-3 font-black uppercase text-sm tracking-wider hover:bg-gray-800 transition-colors"
          >
            Go to Attendance
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-black mx-auto mb-4" />
          <p className="text-sm font-black uppercase tracking-wider">Loading Session...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
          <div className="w-16 h-16 bg-green-100 border-2 border-black flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-2xl text-green-600" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight mb-2">
            {alreadyMarked ? 'Already Marked!' : 'Attendance Marked!'}
          </h1>
          <div className={`px-3 py-2 mb-4 text-xs font-black uppercase tracking-wider border-2 ${
            alreadyMarked ? 'bg-yellow-100 border-yellow-600 text-yellow-800' : 'bg-green-100 border-green-600 text-green-800'
          }`}>
            {alreadyMarked ? 'You were already recorded for this session' : 'Your attendance has been recorded'}
          </div>
          {sessionInfo && (
            <>
              <p className="text-gray-600 font-medium text-sm mb-1">{sessionInfo.courseTitle}</p>
              <p className="text-gray-500 font-medium text-xs mb-6">{sessionInfo.lectureTitle}</p>
            </>
          )}
          <p className="text-gray-700 font-bold text-sm mb-6">
            You can close this page or view your full attendance record.
          </p>
          <button
            onClick={() => navigate('/attendance')}
            className="bg-black text-white px-6 py-3 font-black uppercase text-sm tracking-wider hover:bg-gray-800 transition-colors"
          >
            View My Attendance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header with logo area */}
        <div className="border-4 border-black p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-8 bg-white">
          {/* Session info banner */}
          <div className="bg-black text-white p-4 mb-6 -mx-6 -mt-6 border-b-4 border-black">
            <div className="flex items-center gap-2 mb-1">
              <FaQrcode className="text-yellow-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">QR Attendance Scan</span>
            </div>
            <h1 className="text-xl font-black uppercase tracking-tight">Confirm Your Attendance</h1>
          </div>

          {/* Session details */}
          {sessionInfo && (
            <div className="space-y-3 mb-6 pb-6 border-b-2 border-black">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black flex items-center justify-center flex-shrink-0">
                  <FaBookOpen className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Course</p>
                  <p className="font-black text-sm">{sessionInfo.courseTitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black flex items-center justify-center flex-shrink-0">
                  <FaChalkboardTeacher className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Educator</p>
                  <p className="font-black text-sm">{sessionInfo.educatorName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black flex items-center justify-center flex-shrink-0">
                  <FaUserGraduate className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Session</p>
                  <p className="font-black text-sm">{sessionInfo.lectureTitle}</p>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full border-2 border-black px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full border-2 border-black px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            {/* Confirm checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
                className="mt-0.5 w-5 h-5 border-2 border-black accent-black"
              />
              <span className="text-sm font-bold leading-relaxed text-gray-700 group-hover:text-black transition-colors">
                I confirm that I am present for this session and the information provided above is accurate.
              </span>
            </label>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-black text-white py-4 font-black uppercase text-sm tracking-wider
                hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Marking Attendance...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Confirm & Mark Attendance
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-[10px] text-gray-400 font-bold text-center mt-6">
            Powered by Jagat Academy • Integrated E-Learning Platform
          </p>
        </div>

        {/* Back link */}
        <button
          onClick={() => navigate('/attendance')}
          className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-black hover:text-gray-600 transition-colors mx-auto"
        >
          <FaArrowLeft /> Back to Attendance
        </button>
      </div>
    </div>
  );
};

export default AttendanceScan;
