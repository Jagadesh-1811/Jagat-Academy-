import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { FaUserGraduate, FaChartLine, FaBell, FaEnvelope } from 'react-icons/fa';
import ArrowBackLongIcon from '@mui/icons-material/ArrowBack';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [linkingEmail, setLinkingEmail] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${serverUrl}/api/parent/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboard(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkStudent = async (e) => {
    e.preventDefault();
    if (!linkingEmail.trim()) return;
    setIsLinking(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${serverUrl}/api/parent/link-student`, {
        studentEmailOrCode: linkingEmail
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message || 'Student linked successfully!');
      setLinkingEmail('');
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to link student');
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Nav />

      <div className="flex-grow w-full max-w-7xl mx-auto px-4 py-12 pt-32">
        {/* Header Section */}
        <div className="border-b-4 border-black pb-6 mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex items-start gap-4">
            <ArrowBackLongIcon className='w-6 h-6 cursor-pointer text-black hover:-translate-x-1 transition-transform mt-2' onClick={() => navigate(-1)} />
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black leading-none">Parent Portal</h1>
              <p className="text-gray-500 text-sm font-bold mt-2 tracking-wide uppercase">Command Center for your child's education</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/parent/messages"
              className="group relative bg-white border-2 border-black px-6 py-3 font-black uppercase text-xs tracking-wider hover:bg-black hover:text-white transition-all overflow-hidden flex items-center gap-2"
            >
              <FaEnvelope className="text-lg group-hover:animate-bounce" />
              <span>Messages</span>
            </Link>
            <Link
              to="/parent/analytics"
              className="group relative bg-black text-white border-2 border-black px-6 py-3 font-black uppercase text-xs tracking-wider hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
            >
              View Analytics & Reports →
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <ClipLoader size={50} color="#000" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border-4 border-red-600 p-8 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]">
            <p className="text-red-700 font-black text-center text-xl uppercase tracking-wider">{error}</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-black p-3 rounded-none">
                    <FaUserGraduate className="text-white text-xl" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-gray-500">Linked Students</span>
                </div>
                <p className="text-5xl font-black text-black tracking-tighter">{dashboard?.childrenCount || 0}</p>
              </div>

              <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-black p-3 rounded-none">
                    <FaChartLine className="text-white text-xl" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-gray-500">Active Enrollments</span>
                </div>
                <p className="text-5xl font-black text-black tracking-tighter">{dashboard?.activeCourses || 0}</p>
              </div>

              <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-black p-3 rounded-none relative">
                    <FaBell className="text-white text-xl" />
                    {(dashboard?.notifications?.length || 0) > 0 && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 rounded-full animate-pulse border-2 border-white"></span>
                    )}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-gray-500">Notifications</span>
                </div>
                <p className="text-5xl font-black text-black tracking-tighter">{dashboard?.notifications?.length || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Linked Children Column */}
              <div className="lg:col-span-2">
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <div className="bg-black px-8 py-5 border-b-4 border-black flex justify-between items-center">
                    <h2 className="text-white font-black uppercase tracking-widest text-sm">Linked Children Profile</h2>
                    <span className="text-gray-400 text-xs font-bold uppercase">{dashboard?.children?.length || 0} Total</span>
                  </div>

                  {/* Link Student Form */}
                  <form onSubmit={handleLinkStudent} className="p-6 border-b-4 border-black bg-gray-50 flex flex-col sm:flex-row gap-4 items-center">
                    <input 
                      type="email" 
                      placeholder="Enter student email to link..." 
                      value={linkingEmail}
                      onChange={(e) => setLinkingEmail(e.target.value)}
                      className="flex-1 w-full border-2 border-black p-3 text-sm font-bold focus:outline-none"
                    />
                    <button 
                      type="submit" 
                      disabled={isLinking || !linkingEmail.trim()}
                      className="w-full sm:w-auto whitespace-nowrap bg-black text-white px-6 py-3 font-black uppercase text-xs hover:bg-gray-800 disabled:opacity-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                    >
                      {isLinking ? 'Linking...' : 'Link Student'}
                    </button>
                  </form>
                  
                  {(!dashboard?.children || dashboard.children.length === 0) ? (
                    <div className="p-12 text-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                      <div className="w-20 h-20 bg-white border-4 border-black flex items-center justify-center mx-auto mb-4 rotate-12">
                        <FaUserGraduate className="text-3xl text-gray-300" />
                      </div>
                      <p className="text-black font-black text-xl uppercase tracking-wider">No Profiles Linked</p>
                      <p className="text-gray-500 text-sm mt-2 font-bold max-w-md mx-auto">Your child needs to link your email address from their Parent Settings dashboard.</p>
                    </div>
                  ) : (
                    <div className="divide-y-4 divide-black">
                      {dashboard.children.map((child) => (
                        <div key={child._id} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50 transition-colors group">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-black border-2 border-black flex items-center justify-center text-white font-black text-2xl group-hover:scale-110 transition-transform shadow-[4px_4px_0px_0px_rgba(209,213,219,1)]">
                              {child.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-black text-black text-xl uppercase tracking-wider">{child.name}</p>
                              <p className="text-gray-500 text-sm font-bold tracking-wide">{child.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-3">
                            <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest border-2 ${
                              child.status === 'active'
                                ? 'bg-[#C6F6D5] border-[#22543D] text-[#22543D]'
                                : 'bg-gray-200 border-gray-500 text-gray-600'
                            }`}>
                              {child.status || 'Active'} Profile
                            </span>
                            <Link to={`/parent/analytics`} className="text-xs font-black uppercase text-blue-600 hover:text-blue-800 hover:underline underline-offset-4">
                              View Analytics →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Feed Column */}
              <div className="lg:col-span-1">
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-full">
                  <div className="bg-black px-6 py-5 border-b-4 border-black">
                    <h2 className="text-white font-black uppercase tracking-widest text-sm">Live Activity Feed</h2>
                  </div>
                  
                  {dashboard?.recentActivity && dashboard.recentActivity.length > 0 ? (
                    <div className="divide-y-2 divide-gray-200 p-4">
                      {dashboard.recentActivity.map((activity, index) => (
                        <div key={index} className="py-4 px-2 group">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 w-2 h-2 rounded-full bg-black group-hover:scale-150 transition-transform"></div>
                            <div>
                              <p className="font-bold text-black text-sm leading-snug">{activity.description}</p>
                              <p className="text-gray-500 text-[10px] font-black uppercase tracking-wider mt-2">
                                {activity.childName} • {new Date(activity.time || activity.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                      <div className="w-16 h-16 bg-gray-100 border-4 border-gray-300 flex items-center justify-center mb-4 rotate-12">
                         <span className="text-2xl text-gray-400">🕒</span>
                      </div>
                      <p className="text-gray-500 font-black uppercase text-sm tracking-wider">No Recent Activity</p>
                      <p className="text-gray-400 text-xs font-bold mt-2 max-w-[200px] mx-auto">Activities like course progress or new assignments will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ParentDashboard;
