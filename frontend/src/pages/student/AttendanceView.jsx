import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import ArrowBackLongIcon from '@mui/icons-material/ArrowBack';

const AttendanceView = () => {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });
  const [activeSessions, setActiveSessions] = useState([]);
  const [marking, setMarking] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const [attendanceRes, sessionsRes] = await Promise.all([
        axios.get(`${serverUrl}/api/attendance/my-attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${serverUrl}/api/attendance/sessions/active`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const data = attendanceRes.data.attendance || [];
      setAttendance(data);
      setActiveSessions(sessionsRes.data.sessions || []);
      
      const present = data.filter(a => a.status === 'present').length;
      const absent = data.filter(a => a.status === 'absent').length;
      setStats({ present, absent, total: data.length });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (sessionToken, courseId, lectureId) => {
    setMarking(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${serverUrl}/api/attendance/mark`, {
        checkInMethod: 'qr',
        token: sessionToken,
        courseId,
        lectureId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Attendance marked successfully!');
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <div className="max-w-5xl mx-auto px-4 py-12 pt-32">
        {/* Header */}
        <div className="border-b-4 border-black pb-4 mb-8">
          <ArrowBackLongIcon className='w-5 h-5 cursor-pointer text-black hover:opacity-70 mb-2' onClick={() => navigate(-1)} />
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black">
            Attendance
          </h1>
          <p className="text-gray-500 text-sm font-bold mt-1">View your attendance record</p>
        </div>

        {/* Active Sessions Section */}
        {activeSessions.length > 0 && (
          <div className="bg-yellow-50 border-4 border-yellow-400 p-6 shadow-[8px_8px_0px_0px_rgba(250,204,21,1)] mb-8">
            <h2 className="text-xl font-black uppercase text-yellow-900 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              Live Attendance Sessions
            </h2>
            <div className="space-y-4">
              {activeSessions.map((session, idx) => (
                <div key={idx} className="bg-white border-2 border-black p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-black text-lg">{session.courseTitle}</h3>
                      <p className="text-gray-600 text-sm font-bold">Session: {session.lectureTitle}</p>
                      <p className="text-xs font-black text-gray-400 mt-1 uppercase tracking-wider">
                        Expires in: {Math.floor(session.expiresIn / 60)}:{(session.expiresIn % 60).toString().padStart(2, '0')}
                      </p>

                      {/* Scan button - opens scan page with token */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => navigate(`/attendance/scan?token=${session.token}`)}
                          className="bg-black text-white px-4 py-2 font-black uppercase text-xs tracking-wider hover:bg-gray-800 transition-colors"
                        >
                          Open Scan Form
                        </button>
                        <button
                          onClick={() => handleMarkAttendance(session.token, session.courseId, session.lectureId)}
                          disabled={marking}
                          className="bg-white text-black border-2 border-black px-4 py-2 font-black uppercase text-xs tracking-wider hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          {marking ? 'Marking...' : 'Quick Mark'}
                        </button>
                      </div>
                    </div>

                    {/* QR Code for scanning */}
                    {session.scanUrl && (
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="bg-white border-2 border-black p-2">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(session.scanUrl)}`}
                            alt="Scan to mark attendance"
                            className="w-28 h-28 object-contain"
                          />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-gray-500 mt-1">
                          Scan to Attend
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Total Sessions</p>
            <p className="text-4xl font-black text-black">{stats.total}</p>
          </div>
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Present</p>
            <p className="text-4xl font-black text-green-600">{stats.present}</p>
          </div>
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Absent</p>
            <p className="text-4xl font-black text-red-600">{stats.absent}</p>
          </div>
        </div>

        {/* Attendance percentage bar */}
        {stats.total > 0 && (
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-black">Attendance Rate</span>
              <span className="text-lg font-black text-black">
                {Math.round((stats.present / stats.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 border-2 border-black h-6">
              <div
                className="bg-black h-full transition-all duration-500"
                style={{ width: `${(stats.present / stats.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Attendance list */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="border-b-4 border-black bg-black px-6 py-3">
            <h2 className="text-white font-black uppercase tracking-wider text-sm">Records</h2>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-600 font-bold">{error}</p>
            </div>
          ) : attendance.length === 0 ? (
            <div className="p-12 text-center border-2 border-black m-4 bg-gray-50">
              <p className="text-gray-500 font-bold">No attendance records found.</p>
            </div>
          ) : (
            <div className="divide-y-2 divide-black">
              {attendance.map((record, index) => (
                <div key={record._id || index} className="flex items-center justify-between px-6 py-4 hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-bold text-black text-sm">
                      {new Date(record.date || record.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-500 text-xs font-medium">{record.session || 'Regular Session'}</p>
                  </div>
                  <span className={`px-4 py-1 text-xs font-black uppercase tracking-wider border-2 ${
                    record.status === 'present'
                      ? 'bg-green-100 border-green-600 text-green-700'
                      : 'bg-red-100 border-red-600 text-red-700'
                  }`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AttendanceView;
