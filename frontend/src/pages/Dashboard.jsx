import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import axios from 'axios'
import { serverUrl } from '../App'
import { FaArrowLeftLong } from 'react-icons/fa6'
import { FaUserGraduate, FaBookOpen, FaTrophy, FaCertificate, FaChartBar, FaComments, FaCheckCircle, FaStar, FaArrowRight, FaClock, FaEnvelope, FaBell, FaCalendarAlt } from 'react-icons/fa'

function Dashboard() {
  const { userData, token } = useSelector(state => state.user)
  const navigate = useNavigate()
  const [greeting, setGreeting] = useState('')
  const [recentActivities, setRecentActivities] = useState([])
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes] = await Promise.all([
          axios.get(`${serverUrl}/api/student/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
        ])
        setRecentActivities(progressRes.data.recentActivities || [])

        if (userData?._id) {
          const certRes = await axios.get(`${serverUrl}/api/certification/user/${userData._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setCertificates(certRes.data || [])
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    if (token && userData?._id) fetchData()
  }, [token, userData?._id])

  const quickActions = [
    { label: 'My Courses', icon: <FaBookOpen className="w-5 h-5" />, path: '/enrolledcourses', color: 'bg-black' },
    { label: 'Attendance', icon: <FaCheckCircle className="w-5 h-5" />, path: '/attendance', color: 'bg-black' },
    { label: 'Resume Gen', icon: <FaCertificate className="w-5 h-5" />, path: '/resume-generator', color: 'bg-black' },
    { label: 'Gamification', icon: <FaTrophy className="w-5 h-5" />, path: '/gamification', color: 'bg-black' },
    { label: 'Analytics', icon: <FaChartBar className="w-5 h-5" />, path: '/student/analytics', color: 'bg-black' },
    { label: 'Profile', icon: <FaUserGraduate className="w-5 h-5" />, path: '/profile', color: 'bg-black' },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Nav />

      <div className="flex-grow">
        {/* Header */}
        <div className="bg-black border-t-4 border-b-4 border-white px-6 py-10">
          <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="text-white hover:text-gray-300 transition-none">
                <FaArrowLeftLong className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">{greeting}, {userData?.name || 'Student'}!</h1>
                <p className="text-gray-400 text-sm font-bold mt-1">Student Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/profile')} className="border-2 border-white bg-white text-black font-black text-xs uppercase tracking-wider px-4 py-2 hover:bg-gray-200 transition-none">
                My Profile
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border-2 border-white bg-white/10 p-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
              <div className="text-2xl font-black text-white">{userData?.enrolledCourses?.length || 0}</div>
              <div className="text-xs font-black text-gray-400 uppercase tracking-wider mt-1">Enrolled Courses</div>
            </div>
            <div className="border-2 border-white bg-white/10 p-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
              <div className="text-2xl font-black text-white">{recentActivities.length}</div>
              <div className="text-xs font-black text-gray-400 uppercase tracking-wider mt-1">Recent Activities</div>
            </div>
            <div className="border-2 border-white bg-white/10 p-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
              <div className="text-2xl font-black text-white">{certificates.length}</div>
              <div className="text-xs font-black text-gray-400 uppercase tracking-wider mt-1">Certificates</div>
            </div>
            <div className="border-2 border-white bg-white/10 p-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
              <div className="text-2xl font-black text-white">{userData?.streak || 0}</div>
              <div className="text-xs font-black text-gray-400 uppercase tracking-wider mt-1">Day Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="border-b-4 border-black py-10 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-black text-black uppercase tracking-tight mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="border-4 border-black bg-white p-6 flex flex-col items-center gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-none"
              >
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center">{action.icon}</div>
                <span className="text-xs font-black text-black uppercase tracking-wider text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-10 px-6 bg-white border-b-4 border-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-black text-black uppercase tracking-tight mb-6">Recent Activity</h2>
          {loading ? (
            <div className="border-4 border-black p-8 text-center">
              <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin mx-auto"></div>
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="border-4 border-black p-10 text-center">
              <FaClock className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">No recent activity yet.</p>
              <p className="text-gray-400 text-sm font-bold mt-1">Start learning to see your activity here!</p>
              <button
                onClick={() => navigate('/enrolledcourses')}
                className="mt-4 px-6 py-3 bg-black text-white font-black uppercase text-xs tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-none"
              >
                Go to Courses
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="border-2 border-black p-4 flex items-center gap-4 bg-gray-50">
                  <div className="w-10 h-10 border-2 border-black bg-black text-white flex items-center justify-center flex-shrink-0">
                    {activity.type === 'lecture' ? <FaBookOpen className="w-4 h-4" /> :
                     activity.type === 'certificate' ? <FaCertificate className="w-4 h-4" /> :
                     activity.type === 'quiz' ? <FaStar className="w-4 h-4" /> :
                     activity.type === 'attendance' ? <FaCheckCircle className="w-4 h-4" /> :
                     <FaClock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-black truncate">{activity.message || activity.description || 'Activity'}</p>
                    <p className="text-xs font-bold text-gray-500 mt-1">
                      {activity.courseName || activity.course?.title || ''}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-gray-400 whitespace-nowrap">
                    {activity.date ? new Date(activity.date).toLocaleDateString() : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* My Certifications */}
      <section className="py-10 px-6 bg-gray-50 border-b-4 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">My Certifications</h2>
          </div>
          {loading ? (
            <div className="border-4 border-black p-8 text-center bg-white">
              <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin mx-auto"></div>
            </div>
          ) : certificates.length === 0 ? (
            <div className="border-4 border-black bg-white p-10 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <FaCertificate className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">No certificates claimed yet.</p>
              <p className="text-gray-400 text-sm font-bold mt-1">Complete a course to earn your first certificate!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div key={cert._id} className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px] transition-none flex flex-col">
                  <div className="w-12 h-12 bg-yellow-400 border-2 border-black flex items-center justify-center mb-4">
                    <FaCertificate className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-lg font-black text-black uppercase tracking-tight mb-2 line-clamp-2">
                    {cert.courseId?.title || 'Course Certificate'}
                  </h3>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                    Issued: {new Date(cert.issueDate || cert.createdAt).toLocaleDateString()}
                  </div>
                  <div className="mt-auto pt-4 border-t-2 border-black flex items-center justify-between">
                    <span className="text-xs font-black bg-black text-white px-2 py-1 uppercase">{cert.level || 'Gold'} Level</span>
                    {cert.pdfUrl && (
                      <a 
                        href={cert.pdfUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-black text-black uppercase hover:underline flex items-center gap-1"
                      >
                        View PDF <FaArrowRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Educator Dashboard Link */}
      {userData?.role === 'educator' && (
        <section className="py-10 px-6 bg-gray-50 border-b-4 border-black">
          <div className="max-w-6xl mx-auto">
            <div className="border-4 border-black bg-white p-8 flex items-center justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <h2 className="text-xl font-black text-black uppercase tracking-tight">Educator Dashboard</h2>
                <p className="text-gray-500 font-bold text-sm mt-1">Manage your courses, assignments, and students</p>
              </div>
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="px-6 py-3 bg-black text-white font-black uppercase text-xs tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-none"
              >
                <span className="flex items-center gap-2">Go to Educator <FaArrowRight className="w-3 h-3" /></span>
              </button>
            </div>
          </div>
        </section>
      )}

      </div>
      <Footer />
    </div>
  )
}

export default Dashboard
