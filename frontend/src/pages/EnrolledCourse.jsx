import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import MonthlyQuiz from '../components/MonthlyQuiz';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
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
    // Route directly to the beautiful new React Generator for the demo!
    navigate(`/certificate-generator?course=${encodeURIComponent(course.title)}`);
  };

  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-[320px] text-black">
      <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover border-b-4 border-black" />
      <div className="p-4 space-y-3">
        <div>
          <h2 className="text-lg font-black text-black leading-tight truncate uppercase tracking-tight">{course.title}</h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{course.category} • {course.level}</p>
        </div>

        {/* Attendance stats */}
        <div className="p-3 bg-gray-50 border-2 border-black">
          <div className="flex justify-between items-center text-xs font-black uppercase">
            <span>Attendance Rate</span>
            <span>{loading ? '...' : `${attendanceRate}%`}</span>
          </div>
          <div className="w-full bg-gray-200 h-2 mt-2 border border-black">
            <div className="bg-black h-full" style={{ width: `${attendanceRate}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <button 
            onClick={() => navigate(`/viewlecture/${course._id}`)} 
            className="py-2.5 border-2 border-black bg-black text-white font-extrabold uppercase tracking-wider"
          >
            Watch Now
          </button>
          <button 
            onClick={() => navigate(`/attendance/${course._id}`)} 
            className="py-2.5 border-2 border-black bg-white text-black font-extrabold uppercase tracking-wider hover:bg-gray-50 transition-none"
          >
            Attendance
          </button>
          <button 
            onClick={() => navigate(`/course-discussion/${course._id}`)} 
            className="py-2.5 border-2 border-black bg-white text-black font-extrabold uppercase tracking-wider hover:bg-gray-50 transition-none"
          >
            Chat
          </button>
        </div>

        {/* Certificate Eligibility Button */}
        <div>
          {attendanceRate >= 75 ? (
            <button
              onClick={handleApplyCertificate}
              className="w-full py-2 border-2 border-black bg-black text-white text-xs font-extrabold uppercase tracking-wider hover:bg-gray-800 transition-none"
            >
              Apply Certificate
            </button>
          ) : (
            <div className="w-full py-2 border-2 border-dashed border-gray-400 text-center text-[10px] text-gray-500 font-black uppercase">
              Locked ({attendanceRate}% / 75%)
            </div>
          )}
        </div>
      </div>

      {/* Certification Modal */}
      {showCertModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-black w-full max-w-md p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black">
            <div className="flex justify-between items-center mb-4 border-b-4 border-black pb-2">
              <h2 className="text-xl font-black uppercase tracking-tight">Apply for Certification</h2>
              <button onClick={() => setShowCertModal(false)} className="w-8 h-8 border-2 border-black flex items-center justify-center font-black hover:bg-black hover:text-white transition-none">×</button>
            </div>
            <p className="text-sm font-bold text-gray-600 mb-6 leading-relaxed">
              Congratulations! Your attendance ({attendanceRate}%) meets the minimum 75% requirement. Fill in the form below to receive your certificate.
            </p>
            {certLink && (
              <a
                href={certLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-black text-white font-black py-3 px-4 text-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-none mb-3 uppercase text-sm tracking-wider"
              >
                Fill Certification Form →
              </a>
            )}
            <button
              onClick={() => setShowCertModal(false)}
              className="w-full border-2 border-black text-black font-black py-2 px-4 hover:bg-gray-100 transition-none text-sm uppercase tracking-wider"
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
            headers: { Authorization: `Bearer ${token}` }
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
    <div className="min-h-screen flex flex-col bg-gray-50 text-black">
      <Nav />
      <div className="flex-grow w-full px-4 py-9">
      <h1 className="text-3xl text-center font-black text-black uppercase tracking-tight mb-6">
        My Enrolled Courses
      </h1>
      
      <div className="flex justify-center mb-6">
        <StreakCounter />
      </div>

      <MonthlyQuiz />

      {averageGrade !== null && (
        <div className="bg-black border-4 border-black p-4 mb-6 text-center max-w-md mx-auto shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
          <p className="text-xl font-black text-white uppercase tracking-tight">Your Average Grade: {averageGrade}</p>
        </div>
      )}

      {userData.enrolledCourses.length === 0 ? (
        <div className="border-4 border-black p-12 text-center max-w-md mx-auto bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-gray-500 font-black uppercase tracking-wider">You haven't enrolled in any course yet.</p>
          <button
            onClick={() => navigate('/allcourses')}
            className="mt-4 px-6 py-3 bg-black text-white font-black uppercase text-xs tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-none"
          >
            Browse Courses
          </button>
        </div>
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
      <Footer />
    </div>
  );
}

export default EnrolledCourse;
