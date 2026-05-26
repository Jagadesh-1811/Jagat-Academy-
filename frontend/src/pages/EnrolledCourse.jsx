import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeftLong } from 'react-icons/fa6';
import MonthlyQuiz from '../components/MonthlyQuiz';
import StreakCounter from '../components/StreakCounter';
import { toast } from 'react-toastify';

// Sub-component to manage each course's unique progress and attendance
const EnrolledCourseCard = ({ course, token, navigate }) => {
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCertModal, setShowCertModal] = useState(false);
  const [certLink, setCertLink] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/attendance/student/${course._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttendanceRate(res.data.attendanceRate || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [course._id, token]);

  const handleApplyCertificate = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/certification/link`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCertLink(res.data.link);
      setShowCertModal(true);
    } catch (err) {
      console.error(err);
      toast.info('No certification link has been set by the educator yet.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border w-[320px] text-black">
      <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
      <div className="p-4 space-y-3">
        <div>
          <h2 className="text-lg font-bold text-black leading-tight line-clamp-1">{course.title}</h2>
          <p className="text-xs text-gray-500">{course.category} • {course.level}</p>
        </div>

        {/* Attendance stats log */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-1">
          <div className="flex justify-between items-center text-xs font-bold">
            <span>Attendance Rate</span>
            <span>{loading ? '...' : `${attendanceRate}%`}</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-black h-full" style={{ width: `${attendanceRate}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <button 
            onClick={() => navigate(`/viewlecture/${course._id}`)} 
            className="w-full py-2.5 border-2 border-black bg-black text-white font-extrabold hover:bg-gray-800 transition-none"
          >
            Watch Now
          </button>
          <button 
            onClick={() => navigate(`/attendance/${course._id}`)} 
            className="w-full py-2.5 border-2 border-black bg-white text-black font-extrabold hover:bg-gray-50 transition-none"
          >
            Attendance Logs
          </button>
          <button 
            onClick={() => navigate(`/course-discussion/${course._id}`)} 
            className="w-full py-2.5 border-2 border-black bg-white text-black font-extrabold hover:bg-gray-50 transition-none"
          >
            Class Chat
          </button>
        </div>

        {/* Certificate Eligibility Button */}
        <div>
          {attendanceRate >= 75 ? (
            <button
              onClick={handleApplyCertificate}
              className="w-full py-2 border-2 border-black bg-black text-white text-xs font-extrabold hover:bg-gray-800 transition-none uppercase tracking-wider"
            >
              Apply Certificate
            </button>
          ) : (
            <div className="w-full py-2 border border-dashed border-gray-400 text-center text-[10px] text-gray-500 font-extrabold uppercase">
              Locked Certificate ({attendanceRate}% / 75%)
            </div>
          )}
        </div>
      </div>

      {/* Certification Modal */}
      {showCertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 border-4 border-black text-black">
            <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
              <h2 className="text-xl font-black uppercase">Apply for Certification</h2>
              <button onClick={() => setShowCertModal(false)} className="text-2xl font-bold">×</button>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Congratulations! Your attendance ({attendanceRate}%) meets the minimum 75% requirement. Fill in the form below to receive your certificate.
            </p>
            {certLink && (
              <a
                href={certLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-black text-white font-bold py-3 px-4 text-center border-2 border-black hover:bg-gray-800 transition-none mb-3 uppercase text-sm"
              >
                Fill Certification Form →
              </a>
            )}
            <button
              onClick={() => setShowCertModal(false)}
              className="w-full border-2 border-black text-black font-bold py-2 px-4 hover:bg-gray-100 transition-none text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function EnrolledCourse() {
  const navigate = useNavigate();
  const [averageGrade, setAverageGrade] = useState(null);
  const { userData, token } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchAverageGrade = async () => {
      if (userData?._id) {
        try {
          const result = await axios.get(`${serverUrl}/api/grade/average`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setAverageGrade(result.data.averageGrade);
        } catch (error) {
          console.error('Error fetching average grade:', error);
        }
      }
    };
    fetchAverageGrade();
  }, [userData?._id, token]);

  return (
    <div className="min-h-screen w-full px-4 py-9 bg-gray-50 text-black">
      <FaArrowLeftLong
        className="absolute top-[3%] md:top-[6%] left-[5%] w-[22px] h-[22px] cursor-pointer"
        onClick={() => navigate('/')}
      />
      <h1 className="text-3xl text-center font-bold text-black mb-6">
        My Enrolled Courses
      </h1>
      
      <div className="flex justify-center mb-6">
        <StreakCounter />
      </div>

      <MonthlyQuiz />

      {averageGrade !== null && (
        <div className="bg-black p-4 rounded-lg shadow-md mb-6 text-center max-w-md mx-auto">
          <p className="text-xl font-semibold text-white">Your Average Grade: {averageGrade}</p>
        </div>
      )}

      {userData.enrolledCourses.length === 0 ? (
        <p className="text-gray-500 text-center w-full">You haven’t enrolled in any course yet.</p>
      ) : (
        <div className="flex items-center justify-center flex-wrap gap-[30px] mt-8">
          {userData.enrolledCourses.map((course) => (
            <EnrolledCourseCard
              key={course?._id || `enrolled-course-${course.title}-${Math.random()}`}
              course={course}
              token={token}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EnrolledCourse;
