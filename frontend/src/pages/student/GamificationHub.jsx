import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { serverUrl } from '../../App';
import CelebrationModal from '../../components/CelebrationModal';
import { getBadgeIcon } from '../../utils/gamificationHelpers';

// Icon imports
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const rewardCatalog = [
  {
    id: 'discount_coupon',
    title: '10% Course Discount Coupon',
    description: 'Get 10% off any upcoming course enrollment on the LMS catalog.',
    cost: 500,
    badge: 'DISCOUNT',
  },
  {
    id: 'extended_access',
    title: '1-Month Course Extension',
    description: 'Extend access validity of any currently enrolled course by 30 days.',
    cost: 1000,
    badge: 'EXTENSION',
  },
  {
    id: 'exclusive_content',
    title: 'Exclusive Tutor Lecture Key',
    description: 'Unlock 1 premium, high-tier bonus project-driven tutorial lesson.',
    cost: 750,
    badge: 'EXCLUSIVE',
  },
  {
    id: 'merchandise',
    title: 'Academy Print T-Shirt / merch',
    description: 'Physical printed academy t-shirt delivered to your home! (Home address required).',
    cost: 5000,
    badge: 'MERCHANDISE',
  },
];

const GamificationHub = () => {
  const navigate = useNavigate();
  const { userData, token } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hub'); // 'hub', 'badges', 'leaderboard', 'challenges', 'shop'
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [leaderboardType, setLeaderboardType] = useState('global'); // 'global', 'weekly', 'monthly', 'friends', 'course'
  const [leaderboard, setLeaderboard] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  // Follow/Gifting states
  const [giftTarget, setGiftTarget] = useState('');
  const [giftBadgeId, setGiftBadgeId] = useState('');

  // Celebration Modal trigger state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState('badge');

  // Filters for Badges Grid
  const [badgeFilter, setBadgeFilter] = useState('all'); // 'all', 'unlocked', 'locked'
  const [badgeCategory, setBadgeCategory] = useState('all');

  const fetchHubData = async () => {
    if (!userData?._id || !token) return;
    try {
      setLoading(true);
      
      // 1. Fetch user game profile
      const profRes = await axios.get(`${serverUrl}/api/gamification/profile/${userData._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profRes.data.success) {
        setProfile(profRes.data.profile);
      }

      // 2. Fetch badges list
      const badgesRes = await axios.get(`${serverUrl}/api/gamification/badges`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (badgesRes.data.success) {
        setBadges(badgesRes.data.badges);
      }

      // 3. Fetch challenges
      const chalRes = await axios.get(`${serverUrl}/api/gamification/challenges`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (chalRes.data.success) {
        setChallenges(chalRes.data.challenges);
      }

      // 4. Fetch redeemed vouchers
      const redemptionRes = await axios.get(`${serverUrl}/api/gamification/redemptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (redemptionRes.data.success) {
        setRedemptions(redemptionRes.data.redemptions);
      }

      // 5. Fetch initial leaderboard
      fetchLeaderboard(leaderboardType);

    } catch (error) {
      console.error('Error fetching gamification data:', error);
      toast.error('Failed to load gamification engine.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (type) => {
    try {
      let url = `${serverUrl}/api/gamification/leaderboard/${type}`;
      if (type === 'course' && selectedCourseId) {
        url += `?courseId=${selectedCourseId}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setLeaderboard(res.data.rankings);
      }
    } catch (error) {
      console.error('Leaderboard query failed:', error);
    }
  };

  useEffect(() => {
    fetchHubData();
  }, [userData?._id, token]);

  useEffect(() => {
    if (token) {
      fetchLeaderboard(leaderboardType);
    }
  }, [leaderboardType, selectedCourseId]);

  const handlePurchase = async (item) => {
    try {
      const res = await axios.post(
        `${serverUrl}/api/gamification/redeem`,
        { item },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`Purchased ${item.replace('_', ' ')} successfully! Voucher issued.`);
        fetchHubData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to redeem reward.');
    }
  };

  const handleGiftBadge = async (e) => {
    e.preventDefault();
    if (!giftTarget || !giftBadgeId) {
      toast.warning('Please select a classmate and a badge copy.');
      return;
    }
    try {
      const res = await axios.post(
        `${serverUrl}/api/gamification/gift-badge`,
        { targetUserId: giftTarget, badgeId: giftBadgeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setGiftTarget('');
        setGiftBadgeId('');
        fetchHubData(); // Reload profile coins and tally
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gifting badge failed.');
    }
  };

  const handleFollowToggle = async (targetId) => {
    try {
      const res = await axios.post(
        `${serverUrl}/api/gamification/follow/${targetId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.info(res.data.message);
        fetchHubData();
      }
    } catch (error) {
      toast.error('Failed to update follow relations.');
    }
  };

  const handlePrestigeTrigger = async () => {
    const ok = window.confirm(
      '⚠️ WARNING: Ascending through Prestige will reset your levels back to 1 and clear your XP total. In exchange, you will earn a permanent, prestigious Legendary Prestige star emblem! Continue?'
    );
    if (!ok) return;

    try {
      const res = await axios.post(
        `${serverUrl}/api/gamification/prestige`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setModalType('badge');
        setModalData({
          badge: {
            name: `Prestige Tier ${res.data.profile.prestige}`,
            description: `Successfully reset level 100 to enter Prestige Tier ${res.data.profile.prestige}!`,
            icon: '⚜️',
            rarity: 'Legendary',
          },
          xpReward: 0,
          coinsReward: 0,
        });
        setModalOpen(true);
        fetchHubData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Prestige ascension failed.');
    }
  };

  const handleTogglePrivacy = async () => {
    try {
      const res = await axios.post(
        `${serverUrl}/api/gamification/toggle-privacy`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.info(res.data.message);
        fetchHubData();
      }
    } catch (error) {
      toast.error('Failed to update privacy settings.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Coupon copied to clipboard!');
  };

  // Helper XP calculations for progress bar
  const getXpBoundaries = (lvl) => {
    const minXp = lvl <= 1 ? 0 : 25 * (lvl - 1) * (lvl - 1) + 75 * (lvl - 1);
    const maxXp = 25 * lvl * lvl + 75 * lvl;
    return { minXp, maxXp };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <ClipLoader size={45} color="#000" />
        <span className="mt-4 font-black uppercase text-xs tracking-widest text-black">
          Booting Gamification Engine...
        </span>
      </div>
    );
  }

  const currentLvl = profile?.level || 1;
  const currentXp = profile?.xp || 0;
  const bounds = getXpBoundaries(currentLvl);
  const xpInCurrentLvl = currentXp - bounds.minXp;
  const xpNeededForNextLvl = bounds.maxXp - bounds.minXp;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLvl / xpNeededForNextLvl) * 100));

  // Filter badges
  const filteredBadges = badges.filter((b) => {
    const isUnlocked = profile?.badges.some((ub) => ub.badge?._id?.toString() === b._id?.toString() || ub.badge?.toString() === b._id?.toString());
    if (badgeFilter === 'unlocked' && !isUnlocked) return false;
    if (badgeFilter === 'locked' && isUnlocked) return false;
    if (badgeCategory !== 'all' && b.category !== badgeCategory) return false;
    return true;
  });

  const unlockedOwnedBadges = badges.filter((b) =>
    profile?.badges.some((ub) => ub.badge?._id?.toString() === b._id?.toString() || ub.badge?.toString() === b._id?.toString())
  );

  return (
    <div className="min-h-screen bg-white text-black p-6 font-sans border-t-8 border-black">
      
      {/* Celebration Modal trigger */}
      <CelebrationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={modalData}
        type={modalType}
      />

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation and Top Header */}
        <div className="border-b-4 border-black pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs font-bold border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-none cursor-pointer flex items-center gap-2"
            >
              <ArrowBackIcon fontSize="small" /> Back to LMS Dashboard
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight mt-4 uppercase">
              Jagat Gamification Hub
            </h1>
            <p className="text-gray-500 font-semibold uppercase text-xs tracking-wider">
              Level up, earn Jagat Coins, and unlock community accolades
            </p>
          </div>

          {/* Quick profile indicators */}
          <div className="flex flex-wrap gap-3">
            <span className="border-2 border-black bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-wider">
              🔥 {profile?.currentStreak || 0} Day Streak
            </span>
            <span className="border-2 border-black bg-white text-black px-4 py-2 text-xs font-black uppercase tracking-wider">
              🪙 {profile?.coins || 0} JC
            </span>
            {profile?.prestige > 0 && (
              <span className="border-2 border-amber-600 bg-amber-50 text-amber-700 px-4 py-2 text-xs font-black uppercase tracking-wider animate-pulse">
                ⚜️ Prestige Tier {profile.prestige}
              </span>
            )}
          </div>
        </div>

        {/* Tab Buttons menu (Neo-Brutalist) */}
        <div className="flex flex-wrap border-4 border-black font-black uppercase text-xs tracking-widest divide-y-2 md:divide-y-0 md:divide-x-4 divide-black bg-gray-50">
          {[
            { id: 'hub', label: 'Overview Hub', icon: <StarIcon fontSize="small" /> },
            { id: 'badges', label: 'Badge Showcase', icon: <WorkspacePremiumIcon fontSize="small" /> },
            { id: 'leaderboard', label: 'Rankings Board', icon: <EmojiEventsIcon fontSize="small" /> },
            { id: 'challenges', label: 'Active Quests', icon: <FlashOnIcon fontSize="small" /> },
            { id: 'shop', label: 'Redeem Store', icon: <LocalMallIcon fontSize="small" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-center hover:bg-black hover:text-white transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === tab.id ? 'bg-black text-white' : ''
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="mt-8">
          
          {/* TAB 1: HUB OVERVIEW */}
          {activeTab === 'hub' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Level Progress Panel */}
              <div className="lg:col-span-2 border-4 border-black p-6 space-y-6 bg-gray-50">
                <div className="flex justify-between items-center border-b-2 border-black pb-3">
                  <div>
                    <h2 className="text-xl font-extrabold uppercase tracking-tight">Level Ascension Status</h2>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Track cumulative academic XP points</p>
                  </div>
                  <div className="w-14 h-14 bg-black text-white flex items-center justify-center text-xl font-black shadow-[4px_4px_0px_#000]">
                    {currentLvl}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between font-mono text-xs font-black uppercase">
                    <span>⚡ {currentXp} TOTAL XP</span>
                    <span>{progressPercent}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 h-6 border-4 border-black">
                    <div 
                      className="bg-black h-full transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                    <span>Level {currentLvl} ({bounds.minXp} XP)</span>
                    <span>Level {currentLvl + 1} ({bounds.maxXp} XP)</span>
                  </div>
                </div>

                {/* Prestige system activator */}
                {currentLvl >= 100 && (
                  <div className="border-4 border-dashed border-amber-600 bg-amber-50 p-6 space-y-3">
                    <h3 className="font-extrabold text-amber-700 uppercase text-sm">🌌 Level 100 Reached! Ready for Ascension</h3>
                    <p className="text-xs text-amber-600 font-semibold leading-relaxed">
                      You have reached the maximum level. Triggering a Prestige reset allows you to start climbing level ranks again from level 1. You will retain all your currency, followed members, and earned badges, and permanently claim a legendary Prestige Star Emblem!
                    </p>
                    <button
                      onClick={handlePrestigeTrigger}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase px-4 py-2 border-2 border-black cursor-pointer shadow-[4px_4px_0px_#000]"
                    >
                      🔮 Enter Prestige Tier {profile?.prestige + 1}
                    </button>
                  </div>
                )}

                {/* Quick stats drawer */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-300 font-mono">
                  <div className="border-2 border-black p-3 bg-white text-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">XP Earned</span>
                    <span className="text-xl font-black">{currentXp}</span>
                  </div>
                  <div className="border-2 border-black p-3 bg-white text-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Daily Streak</span>
                    <span className="text-xl font-black">🔥 {profile?.currentStreak}d</span>
                  </div>
                  <div className="border-2 border-black p-3 bg-white text-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Badges Owned</span>
                    <span className="text-xl font-black">🏅 {profile?.badges.length}</span>
                  </div>
                  <div className="border-2 border-black p-3 bg-white text-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Video Watched</span>
                    <span className="text-xl font-black">🎬 {Math.round(profile?.totalVideoDurationWatched / 3600)}h</span>
                  </div>
                </div>
              </div>

              {/* Showcase Cabinet */}
              <div className="border-4 border-black p-6 space-y-4 bg-white flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-extrabold uppercase tracking-tight">Showcase Cabinet</h2>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Badges displayed on public profile</p>
                  
                  <div className="grid grid-cols-5 gap-2 mt-6">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const badge = profile?.showcaseBadges[i];
                      const rarityBorders = {
                        Common: 'border-gray-400 bg-gray-50',
                        Rare: 'border-blue-500 bg-blue-50 text-blue-600',
                        Epic: 'border-purple-500 bg-purple-50 text-purple-600',
                        Legendary: 'border-amber-600 bg-amber-50 text-amber-700 animate-pulse',
                      };

                      return (
                        <div
                          key={i}
                          className={`aspect-square border-2 border-black flex items-center justify-center relative ${
                            badge ? rarityBorders[badge.rarity] : 'border-dashed border-gray-300 text-gray-300'
                          }`}
                          title={badge ? `${badge.name}: ${badge.description}` : 'Empty Showcase Slot'}
                        >
                          {badge ? (
                            <div className="w-10 h-10 flex items-center justify-center text-current">
                              {getBadgeIcon(badge.icon, 'w-8 h-8 text-current')}
                            </div>
                          ) : '?'}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500 font-semibold uppercase block mb-2 leading-relaxed">
                    Choose and feature your rarest achievements inside the **Badge Showcase** tab to show off in study forums.
                  </span>
                  <button
                    onClick={() => setActiveTab('badges')}
                    className="w-full py-2 bg-black hover:bg-gray-800 text-white font-black text-xs uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_#000] cursor-pointer"
                  >
                    Adjust Showcase Grid
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: BADGES GRID */}
          {activeTab === 'badges' && (
            <div className="space-y-6">
              
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b-2 border-black pb-4">
                <div className="flex flex-wrap gap-2 text-xs font-black uppercase">
                  {['all', 'unlocked', 'locked'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setBadgeFilter(f)}
                      className={`px-3 py-1.5 border-2 border-black cursor-pointer ${
                        badgeFilter === f ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1 text-[10px] font-black uppercase">
                  {['all', 'Onboarding', 'Consistency', 'Performance', 'Social', 'Milestones'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setBadgeCategory(cat)}
                      className={`px-2.5 py-1 border border-black cursor-pointer ${
                        badgeCategory === cat ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid representation */}
              {filteredBadges.length === 0 ? (
                <div className="text-center py-16 text-gray-400 border-4 border-dashed border-gray-200 font-bold uppercase text-xs">
                  No achievement badges found matching filters.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {filteredBadges.map((badge) => {
                    const isUnlocked = profile?.badges.some(
                      (ub) => ub.badge?._id?.toString() === badge._id?.toString() || ub.badge?.toString() === badge._id?.toString()
                    );
                    const isShowcased = profile?.showcaseBadges.some((sb) => sb._id?.toString() === badge._id?.toString());

                    const rarityStyles = {
                      Common: 'border-gray-300 bg-gray-50 text-gray-400',
                      Rare: 'border-blue-500 bg-blue-50/50 text-blue-600',
                      Epic: 'border-purple-500 bg-purple-50/50 text-purple-600 shadow-[2px_2px_0px_rgba(139,92,246,0.2)]',
                      Legendary: 'border-amber-600 bg-amber-50 text-amber-700 shadow-[4px_4px_0px_#d97706]',
                    };

                    const handleBadgeClick = async () => {
                      if (!isUnlocked) return;
                      // Toggle showcase badge
                      try {
                        let newShowcase = [...profile.showcaseBadges];
                        const index = newShowcase.findIndex((sb) => sb._id?.toString() === badge._id?.toString());
                        
                        if (index !== -1) {
                          newShowcase.splice(index, 1);
                        } else {
                          if (newShowcase.length >= 5) {
                            toast.warning('Maximum 5 featured slots filled in public showcase drawer.');
                            return;
                          }
                          newShowcase.push(badge);
                        }

                        const res = await axios.post(
                          `${serverUrl}/api/user/updateprofile`,
                          { showcaseBadges: newShowcase.map((b) => b._id) },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        toast.success(index !== -1 ? 'Removed from profile showcase cabinet.' : 'Added to featured showcase cabinet!');
                        fetchHubData();
                      } catch {}
                    };

                    return (
                      <motion.div
                        whileHover={{ scale: isUnlocked ? 1.05 : 1, rotate: isUnlocked ? [0, -2, 2, 0] : 0 }}
                        key={badge._id}
                        onClick={handleBadgeClick}
                        className={`border-2 p-3 text-center flex flex-col items-center justify-between cursor-pointer relative duration-150 ${
                          isUnlocked ? `${rarityStyles[badge.rarity]} border-black` : 'border-dashed border-gray-200 bg-white opacity-40'
                        }`}
                        title={`${badge.name}: ${badge.description} (${badge.rarity})`}
                      >
                        {isShowcased && (
                          <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[8px] font-black border border-white px-1 py-0.5 select-none">
                            SHOW
                          </span>
                        )}
                        <div className={`flex items-center justify-center w-12 h-12 mb-1 ${!isUnlocked && 'grayscale opacity-30 text-gray-300'}`}>
                          {getBadgeIcon(badge.icon, 'w-10 h-10 text-current')}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-[10px] font-black uppercase truncate max-w-full leading-tight">{badge.name}</h4>
                          <span className="text-[8px] font-bold uppercase text-gray-400 block">{badge.category}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: RANKINGS LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Leaderboard tables */}
              <div className="lg:col-span-2 border-4 border-black p-6 space-y-6 bg-white">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-black pb-3 gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold uppercase tracking-tight">Academy Rankings</h2>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Updated in real-time from active study metrics</p>
                  </div>

                  {/* Leaderboard sub-tabs */}
                  <div className="flex flex-wrap gap-1 text-[10px] font-black uppercase">
                    {['global', 'weekly', 'monthly', 'friends', 'course'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setLeaderboardType(t)}
                        className={`px-2 py-1 border border-black cursor-pointer ${
                          leaderboardType === t ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Course ID select if type === course */}
                {leaderboardType === 'course' && (
                  <div className="flex gap-2">
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="border-2 border-black p-2 text-xs font-mono w-full"
                    >
                      <option value="">-- Choose Course to View Leaderboard --</option>
                      {userData?.enrolledCourses?.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Leaderboard listings */}
                {leaderboard.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 uppercase font-bold text-xs">
                    No active leaderboard entries populated. {leaderboardType === 'course' && 'Ensure a course is selected above.'}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {leaderboard.map((row) => {
                      const isSelf = row.userId?.toString() === userData?._id?.toString();
                      const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };

                      return (
                        <div
                          key={row.userId}
                          className={`border-2 border-black p-3 flex justify-between items-center ${
                            isSelf ? 'bg-black text-white' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-black text-sm w-6">
                              {medals[row.rank] || `${row.rank}.`}
                            </span>
                            {row.photoUrl ? (
                              <img
                                src={row.photoUrl}
                                alt=""
                                className={`w-8 h-8 rounded-full border border-black object-cover ${
                                  !isSelf && 'grayscale'
                                }`}
                              />
                            ) : (
                              <div className={`w-8 h-8 rounded-full border border-black flex items-center justify-center font-bold text-xs ${
                                isSelf ? 'bg-white text-black' : 'bg-black text-white'
                              }`}>
                                {row.name?.slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <span className="text-xs font-black uppercase block leading-tight">{row.name}</span>
                              {row.level && (
                                <span className={`text-[8px] font-bold uppercase ${isSelf ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Level {row.level}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right font-mono font-black text-xs uppercase">
                            {row.progress !== undefined ? `${row.progress}% Progress` : `⚡ ${row.xp} XP`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Privacy settings and following board */}
              <div className="border-4 border-black p-6 bg-gray-50 space-y-6">
                <div>
                  <h2 className="text-base font-extrabold uppercase tracking-tight">Leaderboard Settings</h2>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Configure privacy and reputation values</p>
                  
                  <div className="mt-4 border-2 border-black p-4 bg-white flex justify-between items-center">
                    <span className="text-xs font-black uppercase">Participate in Board</span>
                    <button
                      onClick={handleTogglePrivacy}
                      className={`text-xs font-black uppercase px-3 py-1.5 border-2 border-black cursor-pointer ${
                        profile?.optOutLeaderboard ? 'bg-red-500 text-white' : 'bg-black text-white'
                      }`}
                    >
                      {profile?.optOutLeaderboard ? 'OPTED OUT' : 'OPTED IN'}
                    </button>
                  </div>
                </div>

                {/* Social Network / Following List */}
                <div className="space-y-3">
                  <h2 className="text-base font-extrabold uppercase tracking-tight">My Followings ({profile?.followedUsers?.length || 0})</h2>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {profile?.followedUsers?.length === 0 ? (
                      <span className="text-[10px] text-gray-400 font-bold uppercase italic block">
                        No peers followed yet.
                      </span>
                    ) : (
                      profile?.followedUsers?.map((friend) => (
                        <div key={friend._id} className="border border-black p-2 bg-white flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {friend.photoUrl ? (
                              <img src={friend.photoUrl} alt="" className="w-6 h-6 rounded-full border border-black grayscale" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                                {friend.name?.slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <span className="text-[10px] font-black uppercase truncate max-w-[120px]">{friend.name}</span>
                          </div>
                          <button
                            onClick={() => handleFollowToggle(friend._id)}
                            className="text-[8px] font-black uppercase border border-black px-2 py-1 bg-gray-100 hover:bg-black hover:text-white cursor-pointer"
                          >
                            Unfollow
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: ACTIVE CHALLENGES / QUESTS */}
          {activeTab === 'challenges' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Quests Board */}
              <div className="lg:col-span-2 border-4 border-black p-6 space-y-6 bg-white">
                <div>
                  <h2 className="text-xl font-extrabold uppercase tracking-tight">Quest log & Challenges</h2>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Complete targets daily for custom cash/XP boosts</p>
                </div>

                <div className="space-y-4">
                  {challenges.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 p-6 bg-gray-50 text-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">
                        No active quests are published right now.
                      </span>
                    </div>
                  ) : challenges.map((c) => {
                    // Check progress from user stats
                    let currentVal = 0;
                    if (c.targetType === 'login') currentVal = profile?.currentStreak >= 1 ? 1 : 0;
                    else if (c.targetType === 'watch_video') currentVal = profile?.totalVideoDurationWatched || 0;
                    else if (c.targetType === 'help_peer') currentVal = profile?.solvedDoubtCount || 0;
                    else if (c.targetType === 'gift_badge') currentVal = profile?.giftedBadgeCount || 0;
                    
                    const isDone = currentVal >= c.targetQuantity;
                    const displayProgress = Math.min(100, Math.round((currentVal / c.targetQuantity) * 100));

                    return (
                      <div
                        key={c._id}
                        className={`border-4 border-black p-4 space-y-3 bg-gray-50 flex flex-col justify-between ${
                          isDone && 'border-green-600 bg-green-50/30'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-mono bg-black text-white px-2 py-0.5 uppercase tracking-widest font-bold">
                              ⚡ {c.type.toUpperCase()} QUEST
                            </span>
                            <h3 className="font-extrabold text-sm uppercase mt-1 leading-tight">{c.title}</h3>
                            <p className="text-[10px] text-gray-500 font-semibold leading-normal mt-0.5">{c.description}</p>
                          </div>

                          <div className="flex gap-2">
                            {c.xpReward > 0 && (
                              <span className="border border-black px-2 py-0.5 text-[8px] font-black bg-black text-white">
                                +{c.xpReward} XP
                              </span>
                            )}
                            {c.coinsReward > 0 && (
                              <span className="border border-black px-2 py-0.5 text-[8px] font-black bg-white text-black">
                                +{c.coinsReward} JC
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quest Progress Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between font-mono text-[9px] font-black uppercase text-gray-400">
                            <span>PROGRESS</span>
                            <span className={isDone ? 'text-green-600 font-black' : ''}>
                              {isDone ? '🏁 COMPLETED' : `${currentVal} / ${c.targetQuantity}`}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 border border-black">
                            <div 
                              className={`h-full transition-all duration-300 ${isDone ? 'bg-green-600' : 'bg-black'}`}
                              style={{ width: `${displayProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Social badge gifting form */}
              <div className="border-4 border-black p-6 bg-gray-50 space-y-6">
                <div>
                  <h2 className="text-base font-extrabold uppercase tracking-tight">Gift Accolades to Peers</h2>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Spend 50 coins to copy a badge to friend cabinet</p>
                </div>

                <form onSubmit={handleGiftBadge} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase block text-gray-400">SELECT CLASSMATE</label>
                    <select
                      value={giftTarget}
                      onChange={(e) => setGiftTarget(e.target.value)}
                      className="border-2 border-black p-2 text-xs font-mono w-full bg-white"
                      required
                    >
                      <option value="">-- Choose followed friend --</option>
                      {profile?.followedUsers?.map((friend) => (
                        <option key={friend._id} value={friend._id}>
                          {friend.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase block text-gray-400">SELECT UNLOCKED BADGE</label>
                    <select
                      value={giftBadgeId}
                      onChange={(e) => setGiftBadgeId(e.target.value)}
                      className="border-2 border-black p-2 text-xs font-mono w-full bg-white"
                      required
                    >
                      <option value="">-- Choose owned badge copy --</option>
                      {unlockedOwnedBadges.map((badge) => (
                        <option key={badge._id} value={badge._id}>
                          {badge.icon} {badge.name} ({badge.rarity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-black hover:bg-gray-800 text-white font-black text-xs uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_#000] cursor-pointer"
                  >
                    🎁 Send Gift copy (50 JC)
                  </button>
                </form>

                <div className="border border-dashed border-gray-300 p-3 bg-white space-y-1.5">
                  <h3 className="text-[10px] font-black uppercase tracking-wider block">Gifting Rules:</h3>
                  <span className="text-[9px] font-semibold text-gray-500 uppercase block">• Friend receives badge instantly in cabinet.</span>
                  <span className="text-[9px] font-semibold text-gray-500 uppercase block">• Retains XP and coins but deducts 50 JC from you.</span>
                  <span className="text-[9px] font-semibold text-gray-500 uppercase block">• Unlocks "Generous Heart" social accolades!</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: REDEEM REWARD STORE */}
          {activeTab === 'shop' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Product list catalog */}
              <div className="lg:col-span-2 border-4 border-black p-6 space-y-6 bg-white">
                <div>
                  <h2 className="text-xl font-extrabold uppercase tracking-tight">Reward Catalog</h2>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Redeem hard-earned Jagat Coins for exclusive perks</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    {
                      id: 'discount_coupon',
                      title: '10% Course Discount Coupon',
                      description: 'Get 10% off any upcoming course enrollment on the LMS catalog.',
                      cost: 500,
                      badge: '🏷️ DISCOUNT',
                    },
                    {
                      id: 'extended_access',
                      title: '1-Month Course Extension',
                      description: 'Extend access validity of any currently enrolled course by 30 days.',
                      cost: 1000,
                      badge: '⏱️ EXTENSION',
                    },
                    {
                      id: 'exclusive_content',
                      title: 'Exclusive Tutor Lecture Key',
                      description: 'Unlock 1 premium, high-tier bonus project-driven tutorial lesson.',
                      cost: 750,
                      badge: '🔒 EXCLUSIVE',
                    },
                    {
                      id: 'merchandise',
                      title: 'Academy Print T-Shirt / merch',
                      description: 'Physical printed academy t-shirt delivered to your home! (Home address required).',
                      cost: 5000,
                      badge: '📦 MERCHANDISE',
                    },
                  ].map((p) => {
                    const canAfford = profile?.coins >= p.cost;
                    return (
                      <div
                        key={p.id}
                        className="border-2 border-black p-4 space-y-4 bg-gray-50 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <span className="text-[8px] font-black bg-black text-white px-2 py-0.5 uppercase tracking-widest block w-max">
                            {p.badge}
                          </span>
                          <h3 className="font-extrabold text-sm uppercase leading-tight mt-1">{p.title}</h3>
                          <p className="text-[10px] text-gray-500 font-semibold leading-normal">{p.description}</p>
                        </div>

                        <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                          <span className="font-mono text-xs font-black uppercase text-amber-600">
                            🪙 {p.cost} JC
                          </span>

                          <button
                            onClick={() => handlePurchase(p.id)}
                            disabled={!canAfford}
                            className={`px-3 py-1.5 text-xs font-black uppercase border border-black cursor-pointer ${
                              canAfford
                                ? 'bg-black text-white hover:bg-gray-800'
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200'
                            }`}
                          >
                            Redeem
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Issued vouchers cabinet */}
              <div className="border-4 border-black p-6 bg-gray-50 space-y-6">
                <div>
                  <h2 className="text-base font-extrabold uppercase tracking-tight">My Redeemed Vouchers</h2>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Copy active voucher keys to clipboard</p>
                </div>

                <div className="space-y-3">
                  {redemptions.length === 0 ? (
                    <span className="text-[10px] text-gray-400 font-bold uppercase block italic">
                      No coupon transactions recorded.
                    </span>
                  ) : (
                    <RedemptionVoucherList redemptions={redemptions} copy={copyToClipboard} />
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

const RedemptionVoucherList = ({ redemptions, copy }) => {
  const getRewardTitle = (item) => {
    return rewardCatalog.find((reward) => reward.id === item)?.title || item.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {redemptions.map((redemption) => (
        <div
          key={redemption._id}
          className="border border-black p-3 bg-white flex justify-between items-center gap-3 font-mono text-[10px]"
        >
          <div className="min-w-0">
            <span className="font-black uppercase text-[8px] bg-black text-white px-1.5 py-0.5 block w-max mb-1">
              {redemption.status}
            </span>
            <span className="font-extrabold uppercase block truncate">
              {getRewardTitle(redemption.item)}
            </span>
            <span className="text-[9px] text-gray-500 font-bold uppercase block">
              {redemption.coinsCost} JC
            </span>
          </div>
          {redemption.code && (
            <button
              onClick={() => copy(redemption.code)}
              className="p-1 border border-black hover:bg-black hover:text-white cursor-pointer shrink-0"
              title={redemption.code}
            >
              <ContentCopyIcon fontSize="inherit" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default GamificationHub;
