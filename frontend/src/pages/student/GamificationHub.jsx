import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { FaTrophy, FaStar, FaMedal, FaFire, FaLevelUpAlt, FaGem, FaCrown, FaArrowLeft, FaCertificate, FaDownload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const GamificationHub = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('badges');
  const [showConfetti, setShowConfetti] = useState(false);
  const [newBadge, setNewBadge] = useState(null); // For custom animated modal
  
  const { width, height } = useWindowSize();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchGamificationData();
    fetchCertificates();
    
    // Connect Socket.io for Real-time celebrations
    const socket = io(serverUrl, { auth: { token } });
    
    socket.on('badge:unlocked', (data) => {
      console.log('New Badge Unlocked!', data);
      triggerCelebration();
      setNewBadge(data.badge);
      toast.success(`🎉 You earned a new badge: ${data.badge.name}!`);
      // Refresh profile data to show new badge
      fetchGamificationData();
    });

    socket.on('level:up', (data) => {
      console.log('Level Up!', data);
      triggerCelebration();
      toast.success(`🚀 Level UP! You reached Level ${data.level}!`);
      fetchGamificationData();
    });

    return () => socket.disconnect();
  }, []);

  const triggerCelebration = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 6000);
  };

  const fetchGamificationData = async () => {
    try {
      const [profileRes, leaderboardRes, badgesRes] = await Promise.all([
        axios.get(`${serverUrl}/api/gamification/profile/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${serverUrl}/api/gamification/leaderboard/global`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${serverUrl}/api/gamification/badges`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setProfile(profileRes.data.profile || { points: 0, level: 1, streak: 0, badges: [] });
      setLeaderboard(leaderboardRes.data.rankings || []);
      setAllBadges(badgesRes.data.badges || []);
    } catch (err) {
      console.error('Failed to fetch gamification data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/progress/student/${user._id}/certificates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCertificates(res.data.certificates || []);
    } catch (err) {
      console.log('No certificates API yet or failed:', err);
    }
  };

  const getLevelColor = (level, rarity) => {
    if (rarity === 'Legendary') return 'bg-yellow-400 border-yellow-600 text-yellow-900 shadow-[0_0_15px_rgba(250,204,21,0.8)]';
    if (rarity === 'Epic') return 'bg-purple-400 border-purple-600 text-purple-900 shadow-[0_0_10px_rgba(192,132,252,0.8)]';
    if (rarity === 'Rare') return 'bg-blue-400 border-blue-600 text-blue-900';
    if (level >= 10) return 'bg-yellow-400 border-yellow-600 text-yellow-900';
    if (level >= 5) return 'bg-purple-400 border-purple-600 text-purple-900';
    return 'bg-gray-200 border-gray-600 text-gray-800';
  };

  const getRankIcon = (rank) => {
    if (rank === 0) return <FaCrown className="text-yellow-400 text-xl" />;
    if (rank === 1) return <FaMedal className="text-gray-400 text-xl" />;
    if (rank === 2) return <FaMedal className="text-orange-500 text-xl" />;
    return null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.8 },
    show: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300 } }
  };

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={500} recycle={false} />}
      
      {/* New Badge Modal Popup */}
      <AnimatePresence>
        {newBadge && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.5, y: -100 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.5, y: 100 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="bg-white border-8 border-black p-10 max-w-sm w-full text-center shadow-[16px_16px_0px_0px_rgba(255,204,0,1)] relative"
            >
              <button onClick={() => setNewBadge(null)} className="absolute top-2 right-4 text-2xl font-black">X</button>
              <h2 className="text-3xl font-black uppercase text-black mb-4">New Badge!</h2>
              <div className={`w-32 h-32 mx-auto mb-6 flex items-center justify-center text-6xl rounded-full border-8 border-black ${getLevelColor(1, newBadge.rarity)}`}>
                <FaMedal />
              </div>
              <h3 className="text-2xl font-black">{newBadge.name}</h3>
              <p className="text-gray-600 font-bold mt-2">{newBadge.description}</p>
              <p className="text-yellow-600 font-black mt-4 text-xl">+{newBadge.xpReward} XP</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 py-12 pt-32">
        {/* Header */}
        <div className="border-b-4 border-black pb-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 border-2 border-black px-4 py-2 font-black uppercase text-xs tracking-wider mb-4 hover:bg-black hover:text-white transition-colors"
          >
            <FaArrowLeft /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black flex items-center justify-center">
              <FaTrophy className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black">
                Gamification Hub
              </h1>
              <p className="text-gray-500 text-sm font-bold">Earn points, badges & climb the leaderboard</p>
            </div>
            <button onClick={triggerCelebration} className="ml-auto bg-yellow-400 text-black border-2 border-black font-black uppercase px-4 py-2 hover:bg-yellow-300">
              Test Confetti
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <FaStar className="text-yellow-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">XP Points</span>
                </div>
                <p className="text-3xl font-black text-black">{profile?.xp || 0}</p>
              </motion.div>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <FaLevelUpAlt className="text-blue-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Level</span>
                </div>
                <p className="text-3xl font-black text-black">{profile?.level || 1}</p>
              </motion.div>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <FaFire className="text-orange-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Streak</span>
                </div>
                <p className="text-3xl font-black text-black">{profile?.currentStreak || 0} days</p>
              </motion.div>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <FaGem className="text-purple-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Badges</span>
                </div>
                <p className="text-3xl font-black text-black">{profile?.badges?.length || 0}</p>
              </motion.div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap border-4 border-black mb-8">
              <button
                onClick={() => setActiveTab('badges')}
                className={`flex-1 min-w-[120px] py-4 font-black uppercase text-sm tracking-wider transition-all ${
                  activeTab === 'badges' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Badges
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`flex-1 min-w-[120px] py-4 font-black uppercase text-sm tracking-wider transition-all border-l-4 border-black ${
                  activeTab === 'leaderboard' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Leaderboard
              </button>
              <button
                onClick={() => setActiveTab('certifications')}
                className={`flex-1 min-w-[120px] py-4 font-black uppercase text-sm tracking-wider transition-all border-l-4 border-black ${
                  activeTab === 'certifications' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Certifications
              </button>
            </div>

            {/* Badges Tab */}
            {activeTab === 'badges' && (
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                {allBadges && allBadges.length > 0 ? (
                  <motion.div 
                    variants={containerVariants} initial="hidden" animate="show"
                    className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
                  >
                    {allBadges.map((badge, index) => {
                      const isUnlocked = profile?.badges?.some(b => b.badge && b.badge._id === badge._id);
                      return (
                        <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} key={index} className={`border-2 border-black p-4 text-center transition-colors cursor-pointer group ${isUnlocked ? 'hover:bg-gray-50 bg-white' : 'bg-gray-100 opacity-75'}`}>
                          <div className={`w-12 h-12 mx-auto mb-2 flex items-center justify-center text-2xl ${isUnlocked ? getLevelColor(1, badge.rarity) : 'bg-gray-300 border-gray-400 text-gray-500'} border-2 border-black rounded-full`}>
                            <FaMedal className="group-hover:rotate-12 transition-transform" />
                          </div>
                          <p className="text-xs font-bold uppercase text-black">{badge.name || 'Badge'}</p>
                          <p className={`text-[10px] font-bold uppercase mt-1 ${isUnlocked ? 'text-yellow-600' : 'text-gray-500'}`}>{isUnlocked ? badge.rarity : 'Locked'}</p>
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{badge.description}</p>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <div className="border-2 border-black bg-gray-50 p-12 text-center">
                    <p className="text-gray-500 font-bold text-lg">No badges available yet. Keep learning!</p>
                  </div>
                )}
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="bg-black px-6 py-3 border-b-4 border-black">
                  <h2 className="text-white font-black uppercase tracking-wider text-sm">Global Top Students</h2>
                </div>
                {leaderboard.length > 0 ? (
                  <div className="divide-y-2 divide-black">
                    {leaderboard.map((entry, index) => (
                      <div key={entry.userId || index} className={`flex items-center justify-between px-6 py-4 hover:bg-gray-100 transition-colors ${
                        entry.userId === user._id ? 'bg-yellow-50' : ''
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-black text-sm">
                            {getRankIcon(index) || <span>{index + 1}</span>}
                          </div>
                          <div>
                            <p className="font-bold text-black text-sm">
                              {entry.name || 'Student'}
                              {entry.userId === user._id && <span className="text-yellow-600 ml-1 font-black">(You)</span>}
                            </p>
                            <p className="text-gray-500 text-xs">Level {entry.level || 1}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-black">{entry.xp || 0} XP</span>
                          <FaStar className="text-yellow-500 text-sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center border-2 border-black m-4 bg-gray-50">
                    <p className="text-gray-500 font-bold">No leaderboard data available yet.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Certifications Tab */}
            {activeTab === 'certifications' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2 inline-block">My Certificates</h2>
                {certificates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map((cert, idx) => (
                      <div key={idx} className="border-4 border-black p-4 flex flex-col sm:flex-row items-center gap-4 hover:bg-gray-50">
                        <div className="w-16 h-16 bg-yellow-400 border-2 border-black flex items-center justify-center text-3xl">
                          <FaCertificate />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="font-black text-lg">{cert.courseTitle || 'Completed Course'}</h3>
                          <p className="text-sm text-gray-600 font-bold">Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                        </div>
                        <a href={cert.url || '#'} className="bg-black text-white px-4 py-2 font-black uppercase text-xs hover:bg-gray-800 flex items-center gap-2">
                          <FaDownload /> PDF
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-black bg-gray-50 p-12 text-center flex flex-col items-center">
                    <FaCertificate className="text-6xl text-gray-300 mb-4" />
                    <p className="text-gray-500 font-bold text-lg">No certificates earned yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Complete a course 100% to generate your first certificate!</p>
                  </div>
                )}
              </motion.div>
            )}

          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default GamificationHub;
