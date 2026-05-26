import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { getBadgeIcon } from '../../utils/gamificationHelpers';
import {
  FaTrophy, FaStar, FaMedal, FaFire, FaLevelUpAlt, FaGem,
  FaCrown, FaArrowLeft, FaCertificate, FaDownload,
  FaRegCalendarCheck, FaCoins, FaUserPlus, FaUserCheck,
  FaLock, FaUnlock, FaEye, FaEyeSlash, FaGift, FaShoppingCart
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const LEVEL_XP_FORMULA = (level) => {
  if (level <= 1) return 0;
  return 25 * (level - 1) * (level - 1) + 75 * (level - 1);
};

const GamificationHub = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardType, setLeaderboardType] = useState('global');
  const [certificates, setCertificates] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('badges');
  const [showConfetti, setShowConfetti] = useState(false);
  const [newBadge, setNewBadge] = useState(null);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [following, setFollowing] = useState({}); // userId -> boolean

  const { width, height } = useWindowSize();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchGamificationData();
    fetchCertificates();
    fetchChallenges();
    fetchRedemptions();

    const socket = io(serverUrl, { auth: { token } });

    socket.on('badge:unlocked', (data) => {
      triggerCelebration();
      setNewBadge(data.badge);
      toast.success(`🏅 ${data.badge.name} unlocked!`);
      fetchGamificationData();
    });

    socket.on('level:up', (data) => {
      triggerCelebration();
      toast.success(`🚀 Level UP! You reached Level ${data.level}!`);
      fetchGamificationData();
    });

    socket.on('coins:earned', (data) => {
      toast.success(`🪙 +${data.amountAdded} Jagat Coins — ${data.reason}`);
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
      setProfile(profileRes.data.profile);
      setLeaderboard(leaderboardRes.data.rankings || []);
      setAllBadges(badgesRes.data.badges || []);
    } catch (err) {
      console.error('Failed to fetch gamification data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboardByType = async (type) => {
    setLeaderboardType(type);
    try {
      const res = await axios.get(`${serverUrl}/api/gamification/leaderboard/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaderboard(res.data.rankings || []);
    } catch (err) {
      toast.error('Failed to load leaderboard');
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/progress/student/${user._id}/certificates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCertificates(res.data.certificates || []);
    } catch (err) {
      // silent — certificates endpoint may not exist
    }
  };

  const fetchChallenges = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/gamification/challenges`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChallenges(res.data.challenges || []);
    } catch (err) {
      // silent
    }
  };

  const fetchRedemptions = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/gamification/redemptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRedemptions(res.data.redemptions || []);
    } catch (err) {
      // silent
    }
  };

  const togglePrivacy = async () => {
    setPrivacyLoading(true);
    try {
      const res = await axios.post(`${serverUrl}/api/gamification/toggle-privacy`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(prev => ({ ...prev, optOutLeaderboard: res.data.optOutLeaderboard }));
      toast.success(res.data.message);
    } catch (err) {
      toast.error('Failed to toggle privacy');
    } finally {
      setPrivacyLoading(false);
    }
  };

  const redeemReward = async (item) => {
    try {
      const res = await axios.post(`${serverUrl}/api/gamification/redeem`, { item }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message);
      fetchGamificationData();
      fetchRedemptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Redemption failed');
    }
  };

  // XP Progress Bar calculations
  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const currentLevelXp = LEVEL_XP_FORMULA(level);
  const nextLevelXp = LEVEL_XP_FORMULA(level + 1);
  const xpProgress = nextLevelXp > currentLevelXp
    ? Math.min(100, ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
    : 100;
  const xpToNext = Math.max(0, nextLevelXp - xp);

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

  const rewardCatalog = [
    { id: 'discount_coupon', label: 'Discount Coupon', cost: 500, icon: <FaGem className="text-blue-500" />, desc: 'Get 20% off any course' },
    { id: 'extended_access', label: 'Extended Access', cost: 1000, icon: <FaCertificate className="text-purple-500" />, desc: 'Extra 30 days course access' },
    { id: 'exclusive_content', label: 'Exclusive Content', cost: 750, icon: <FaStar className="text-yellow-500" />, desc: 'Unlock premium materials' },
    { id: 'merchandise', label: 'Jagat Merchandise', cost: 5000, icon: <FaTrophy className="text-amber-500" />, desc: 'Official Jagat Academy merch' },
  ];

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

      {/* New Badge Modal */}
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
              <p className="text-gray-500 text-sm font-bold">Earn XP, collect badges & unlock rewards</p>
            </div>
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
                <p className="text-3xl font-black text-black">{xp}</p>
              </motion.div>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <FaLevelUpAlt className="text-blue-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Level</span>
                </div>
                <p className="text-3xl font-black text-black">{level}</p>
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
                  <FaCoins className="text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Jagat Coins</span>
                </div>
                <p className="text-3xl font-black text-black">{profile?.coins || 0}</p>
              </motion.div>
            </div>

            {/* XP Progress Bar */}
            <div className="bg-white border-4 border-black p-5 mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-gray-500">Progress to Level {level + 1}</span>
                <span className="text-xs font-black text-gray-500">{xpToNext.toLocaleString()} XP remaining</span>
              </div>
              <div className="w-full h-4 bg-gray-200 border-2 border-black">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-black transition-all"
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs font-bold text-gray-400">Lv {level}</span>
                <span className="text-xs font-bold text-gray-400">Lv {level + 1}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap border-4 border-black mb-8">
              <button onClick={() => setActiveTab('badges')}
                className={`flex-1 min-w-[100px] py-4 font-black uppercase text-sm tracking-wider transition-all ${activeTab === 'badges' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}>
                Badges ({allBadges.filter(b => profile?.badges?.some(pb => pb.badge?._id === b._id)).length}/{allBadges.length})
              </button>
              <button onClick={() => setActiveTab('leaderboard')}
                className={`flex-1 min-w-[100px] py-4 font-black uppercase text-sm tracking-wider transition-all border-l-4 border-black ${activeTab === 'leaderboard' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}>
                Leaderboard
              </button>
              <button onClick={() => setActiveTab('challenges')}
                className={`flex-1 min-w-[100px] py-4 font-black uppercase text-sm tracking-wider transition-all border-l-4 border-black ${activeTab === 'challenges' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}>
                Challenges
              </button>
              <button onClick={() => setActiveTab('rewards')}
                className={`flex-1 min-w-[100px] py-4 font-black uppercase text-sm tracking-wider transition-all border-l-4 border-black ${activeTab === 'rewards' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}>
                Reward Store
              </button>
              <button onClick={() => setActiveTab('certifications')}
                className={`flex-1 min-w-[100px] py-4 font-black uppercase text-sm tracking-wider transition-all border-l-4 border-black ${activeTab === 'certifications' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}>
                Certifications
              </button>
            </div>

            {/* === BADGES TAB === */}
            {activeTab === 'badges' && (
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                {/* Badge Categories Filter */}
                <div className="flex flex-wrap gap-2 mb-6 border-b-2 border-black pb-4">
                  {['Onboarding', 'Consistency', 'Performance', 'Social', 'Milestones'].map(cat => {
                    const total = allBadges.filter(b => b.category === cat).length;
                    const earned = allBadges.filter(b =>
                      b.category === cat && profile?.badges?.some(pb => pb.badge?._id === b._id)
                    ).length;
                    return (
                      <div key={cat} className="border-2 border-black px-3 py-2 text-center">
                        <p className="text-xs font-black uppercase">{cat}</p>
                        <p className="text-sm font-black">{earned}/{total}</p>
                      </div>
                    );
                  })}
                </div>

                {allBadges.length > 0 ? (
                  <motion.div variants={containerVariants} initial="hidden" animate="show"
                    className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {allBadges.map((badge, index) => {
                      const isUnlocked = profile?.badges?.some(b => b.badge && b.badge._id === badge._id);
                      return (
                        <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} key={index}
                          className={`border-2 border-black p-4 text-center transition-colors cursor-pointer group relative ${isUnlocked ? 'hover:bg-gray-50 bg-white' : 'bg-gray-100 opacity-75'}`}>
                          <div className={`w-14 h-14 mx-auto mb-2 flex items-center justify-center ${isUnlocked ? getLevelColor(1, badge.rarity) : 'bg-gray-300 border-gray-400 text-gray-500'} border-2 border-black rounded-full`}>
                            {getBadgeIcon(badge.icon, 'w-7 h-7')}
                          </div>
                          <p className="text-xs font-bold uppercase truncate">{badge.name}</p>
                          <p className={`text-[10px] font-bold uppercase mt-1 ${isUnlocked ? 'text-yellow-600' : 'text-gray-500'}`}>
                            {isUnlocked ? badge.rarity : '🔒 Locked'}
                          </p>
                          <p className="text-[9px] text-gray-500 mt-1 leading-tight line-clamp-2">{badge.description}</p>
                          {!isUnlocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                              <FaLock className="text-white text-2xl" />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <div className="border-2 border-black bg-gray-50 p-12 text-center">
                    <p className="text-gray-500 font-bold text-lg">No badges available yet. Start learning!</p>
                  </div>
                )}
              </div>
            )}

            {/* === LEADERBOARD TAB === */}
            {activeTab === 'leaderboard' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                {/* Leaderboard Type Toggle */}
                <div className="flex border-b-4 border-black">
                  {['global', 'weekly', 'monthly'].map(type => (
                    <button key={type} onClick={() => fetchLeaderboardByType(type)}
                      className={`flex-1 py-3 font-black uppercase text-xs tracking-wider transition-all ${leaderboardType === type ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}>
                      {type}
                    </button>
                  ))}
                </div>
                {/* Privacy Toggle */}
                <div className="bg-gray-50 px-6 py-2 flex items-center justify-between border-b-2 border-black">
                  <span className="text-xs font-bold text-gray-500">
                    {profile?.optOutLeaderboard ? 'You are hidden from leaderboards' : 'You are visible on leaderboards'}
                  </span>
                  <button onClick={togglePrivacy} disabled={privacyLoading}
                    className="flex items-center gap-1 border border-black px-2 py-1 text-xs font-black hover:bg-black hover:text-white transition-colors">
                    {profile?.optOutLeaderboard ? <FaEye /> : <FaEyeSlash />}
                    {profile?.optOutLeaderboard ? ' Show Me' : ' Hide Me'}
                  </button>
                </div>
                {leaderboard.length > 0 ? (
                  <div className="divide-y-2 divide-black">
                    {leaderboard.map((entry, index) => (
                      <div key={entry.userId || index} className={`flex items-center justify-between px-6 py-4 hover:bg-gray-100 transition-colors ${entry.userId === user._id ? 'bg-yellow-50' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-black text-sm">
                            {getRankIcon(index) || <span>{index + 1}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {entry.photoUrl && (
                              <img src={entry.photoUrl} alt="" className="w-8 h-8 rounded-full border-2 border-black object-cover" />
                            )}
                            <div>
                              <p className="font-bold text-black text-sm">
                                {entry.name || 'Student'}
                                {entry.userId === user._id && <span className="text-yellow-600 ml-1 font-black">(You)</span>}
                              </p>
                              <p className="text-gray-500 text-xs">Level {entry.level || 1}</p>
                            </div>
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
                    <p className="text-gray-400 text-sm mt-2">Complete courses and earn XP to climb the ranks!</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* === CHALLENGES TAB === */}
            {activeTab === 'challenges' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                <h2 className="text-lg font-black uppercase mb-6 border-b-4 border-black pb-2 inline-block">Active Quests</h2>
                {challenges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {challenges.map((challenge, idx) => (
                      <div key={idx} className="border-4 border-black p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className={`text-[10px] font-black uppercase px-2 py-1 border-2 border-black ${challenge.type === 'daily' ? 'bg-blue-100 text-blue-700' : challenge.type === 'weekly' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {challenge.type}
                            </span>
                            <h3 className="text-base font-black mt-2">{challenge.title}</h3>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 font-bold mb-3">{challenge.description}</p>
                        <div className="flex items-center gap-3 border-t-2 border-black pt-3 mt-3">
                          {challenge.xpReward > 0 && (
                            <span className="text-xs font-black bg-black text-white px-2 py-1">⚡ +{challenge.xpReward} XP</span>
                          )}
                          {challenge.coinsReward > 0 && (
                            <span className="text-xs font-black border-2 border-black px-2 py-1">🪙 +{challenge.coinsReward} JC</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-black bg-gray-50 p-12 text-center">
                    <FaRegCalendarCheck className="text-5xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold text-lg">No active challenges right now.</p>
                    <p className="text-gray-400 text-sm mt-2">Check back soon for new daily and weekly quests!</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* === REWARD STORE TAB === */}
            {activeTab === 'rewards' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
                  <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-3">
                    <h2 className="text-lg font-black uppercase">Reward Catalog</h2>
                    <div className="flex items-center gap-2 border-2 border-black px-3 py-1">
                      <FaCoins className="text-amber-500" />
                      <span className="font-black">{profile?.coins || 0} JC</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rewardCatalog.map((item) => (
                      <div key={item.id} className="border-4 border-black p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-black flex items-center justify-center text-xl text-white">
                            {item.icon}
                          </div>
                          <div>
                            <h3 className="font-black text-sm uppercase">{item.label}</h3>
                            <p className="text-xs text-gray-500 font-bold">{item.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t-2 border-black pt-3">
                          <span className="flex items-center gap-1 text-sm font-black">
                            <FaCoins className="text-amber-500" /> {item.cost} JC
                          </span>
                          <button
                            onClick={() => redeemReward(item.id)}
                            disabled={(profile?.coins || 0) < item.cost}
                            className={`px-4 py-2 font-black uppercase text-xs border-2 border-black transition-all flex items-center gap-2 ${(profile?.coins || 0) >= item.cost
                              ? 'bg-black text-white hover:bg-gray-800'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                          >
                            <FaShoppingCart /> {profile?.coins >= item.cost ? 'Redeem' : 'Need More'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Redemption History */}
                {redemptions.length > 0 && (
                  <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                    <h2 className="text-lg font-black uppercase mb-4 border-b-4 border-black pb-2 inline-block">Redemption History</h2>
                    <div className="divide-y-2 divide-black">
                      {redemptions.slice(0, 5).map((r, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm uppercase">{r.item.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-2 py-1 border-2 border-black ${r.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {r.status}
                            </span>
                            {r.code && <span className="text-[10px] font-mono font-black text-gray-500">{r.code}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* === CERTIFICATIONS TAB === */}
            {activeTab === 'certifications' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                <h2 className="text-lg font-black uppercase mb-6 border-b-4 border-black pb-2 inline-block">My Certificates</h2>
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
                        <a href={cert.url || '#'} target="_blank" rel="noopener noreferrer"
                          className="bg-black text-white px-4 py-2 font-black uppercase text-xs hover:bg-gray-800 flex items-center gap-2">
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
