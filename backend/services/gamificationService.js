import UserGameProfile from '../models/userGameProfileModel.js';
import Badge from '../models/badgeModel.js';
import User from '../models/userModel.js';
import { emitUserEvent } from '../configs/socket.js';
import redisWrapper from '../configs/redis.js';

// Closed-form mathematical level calculations
// xpRequiredForLevel L (where L >= 2): 25 * (L - 1)^2 + 75 * (L - 1)
export const getXpRequiredForLevel = (level) => {
  if (level <= 1) return 0;
  return 25 * (level - 1) * (level - 1) + 75 * (level - 1);
};

export const getLevelFromXp = (xp) => {
  if (xp < 100) return 1;
  // Solving: 25*x^2 + 75*x - xp = 0
  // x = (-75 + sqrt(5625 + 100*xp)) / 50
  // level = Math.floor(x) + 1
  return Math.floor(1 + (-75 + Math.sqrt(5625 + 100 * xp)) / 50);
};

/**
 * Shared Level Up Logic Helper (prevents duplicate triggers and loops)
 */
export const checkLevelUp = (profile, oldLevel) => {
  const newLevel = getLevelFromXp(profile.xp);
  
  if (newLevel > oldLevel) {
    profile.level = newLevel;
    
    // Auto-award level-up Jagat Coins (50 per level)
    profile.coins += (newLevel - oldLevel) * 50;

    // Evaluate level-based unlocks
    let unlockedFeatures = [];
    if (newLevel >= 5) unlockedFeatures.push('Custom Avatar Pack 1');
    if (newLevel >= 10) unlockedFeatures.push('Custom Avatar Pack 2');
    if (newLevel >= 15) unlockedFeatures.push('Neo-Brutalist Card Borders');
    if (newLevel >= 20) unlockedFeatures.push('Elite Avatar Pack 3');
    if (newLevel >= 25) {
      profile.earlyAccess = true;
      unlockedFeatures.push('Early Course Access');
    }
    if (newLevel >= 30) unlockedFeatures.push('Retro Console Dashboard Theme');
    if (newLevel >= 50) unlockedFeatures.push('Legendary Avatar Pack 4');
    if (newLevel >= 60) unlockedFeatures.push('Dark Mode Premium Border');

    // Trigger socket notification
    emitUserEvent(profile.user.toString(), 'level:up', {
      level: newLevel,
      xp: profile.xp,
      coinsAwarded: (newLevel - oldLevel) * 50,
      unlockedFeatures,
      reason: `Reached level ${newLevel}!`,
    });

    return { leveledUp: true, unlockedFeatures };
  }
  return { leveledUp: false, unlockedFeatures: [] };
};

/**
 * Fetch or initialize UserGameProfile
 */
export const getOrCreateGameProfile = async (userId) => {
  let profile = await UserGameProfile.findOne({ user: userId }).populate('badges.badge');
  
  if (!profile) {
    profile = await UserGameProfile.create({
      user: userId,
      xp: 0,
      level: 1,
      coins: 100, // Starting bonus
      badges: [],
      showcaseBadges: [],
      currentStreak: 0,
      longestStreak: 0,
    });
    // Trigger onboarding badges check
    await checkAndAwardBadges(userId, 'Onboarding');
  }
  return profile;
};

/**
 * Award XP to a user, checking for level-up thresholds
 */
export const awardXP = async (userId, amount, reason) => {
  try {
    const profile = await getOrCreateGameProfile(userId);
    const oldLevel = profile.level;
    
    // Add XP
    profile.xp += Number(amount);
    
    // Run level checks (modifies profile fields in-place if level ascends)
    const levelStatus = checkLevelUp(profile, oldLevel);

    await profile.save();

    // Sync score on Global and Resettable leaderboards in Redis cache
    await redisWrapper.zadd('leaderboard:global', profile.xp, userId);
    await redisWrapper.zadd('leaderboard:weekly', profile.xp, userId);
    await redisWrapper.zadd('leaderboard:monthly', profile.xp, userId);

    // Trigger milestone and performance checks sequentially (ensuring DB is saved first)
    await checkAndAwardBadges(userId, 'Milestones');
    await checkAndAwardBadges(userId, 'Performance');

    return {
      xp: profile.xp,
      level: profile.level,
      leveledUp: levelStatus.leveledUp,
      unlockedFeatures: levelStatus.unlockedFeatures,
    };
  } catch (error) {
    console.error('Error in awardXP service:', error);
    throw error;
  }
};

/**
 * Award Jagat Coins
 */
export const awardCoins = async (userId, amount, reason) => {
  const profile = await getOrCreateGameProfile(userId);
  profile.coins += Number(amount);
  await profile.save();

  emitUserEvent(userId, 'coins:earned', {
    coins: profile.coins,
    amountAdded: Number(amount),
    reason,
  });

  return profile.coins;
};

/**
 * Daily login streak evaluations
 */
export const updateLoginStreak = async (userId) => {
  try {
    const profile = await getOrCreateGameProfile(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = profile.lastActiveDate ? new Date(profile.lastActiveDate) : null;
    let streakIncremented = false;

    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - lastActive.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Active yesterday, increment streak!
        profile.currentStreak += 1;
        streakIncremented = true;
      } else if (diffDays > 1) {
        // Missed a day, reset streak to 1
        profile.currentStreak = 1;
        streakIncremented = true;
      }
      // If diffDays === 0, already logged in today, leave streak unchanged
    } else {
      // First active day
      profile.currentStreak = 1;
      streakIncremented = true;
    }

    if (profile.currentStreak > profile.longestStreak) {
      profile.longestStreak = profile.currentStreak;
    }

    profile.lastActiveDate = today;
    await profile.save();

    if (streakIncremented) {
      // Award 5 XP for login
      await awardXP(userId, 5, 'Daily Login');
      // Trigger consistency badges check
      await checkAndAwardBadges(userId, 'Consistency');
    }

    return {
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
    };
  } catch (error) {
    console.error('Error updating login streak:', error);
    throw error;
  }
};

/**
 * Check and unlock achievements
 */
export const checkAndAwardBadges = async (userId, category, contextData = {}) => {
  try {
    // Query direct profile representation
    const profile = await UserGameProfile.findOne({ user: userId });
    if (!profile) return [];

    const user = await User.findById(userId);
    if (!user) return [];

    const query = category ? { category } : {};
    const availableBadges = await Badge.find(query);
    
    const newlyUnlocked = [];
    const oldLevel = profile.level;

    for (const badge of availableBadges) {
      const alreadyUnlocked = profile.badges.some((b) => b.badge.toString() === badge._id.toString());
      if (alreadyUnlocked) continue;

      let meetsCriteria = false;
      const { type, value } = badge.criteria;

      switch (type) {
        case 'streak':
          meetsCriteria = profile.currentStreak >= value;
          break;
        case 'course_count':
          meetsCriteria = user.enrolledCourses && user.enrolledCourses.length >= value;
          break;
        case 'watch_time':
          meetsCriteria = (profile.totalVideoDurationWatched / 3600) >= value;
          break;
        case 'quiz_perfect':
          if (contextData.isPerfectQuiz) {
            meetsCriteria = true;
          }
          break;
        case 'doubts_solved':
          meetsCriteria = profile.solvedDoubtCount >= value;
          break;
        case 'profile_complete':
          meetsCriteria = !!(user.name && user.description);
          break;
        case 'gift_badge':
          meetsCriteria = profile.giftedBadgeCount >= value;
          break;
        case 'level_milestone':
          meetsCriteria = profile.level >= value;
          break;
        default:
          break;
      }

      if (meetsCriteria) {
        // Unlock badge
        profile.badges.push({
          badge: badge._id,
          unlockedAt: new Date(),
        });

        // Add to showcase if there is space
        if (profile.showcaseBadges.length < 5) {
          profile.showcaseBadges.push(badge._id);
        }

        // Apply rewards directly IN-PLACE on profile model. No nested database calls.
        profile.xp += badge.xpReward;
        profile.coins += badge.coinsReward;

        newlyUnlocked.push(badge);

        // Notify socket
        emitUserEvent(userId, 'badge:unlocked', {
          badge,
          xpReward: badge.xpReward,
          coinsReward: badge.coinsReward,
        });
      }
    }

    if (newlyUnlocked.length > 0) {
      // Evaluate if in-place XP modifications unlocked new levels
      checkLevelUp(profile, oldLevel);
      
      await profile.save();

      // Sync updated ranking score in Redis Sorted Set
      await redisWrapper.zadd('leaderboard:global', profile.xp, userId);
      await redisWrapper.zadd('leaderboard:weekly', profile.xp, userId);
      await redisWrapper.zadd('leaderboard:monthly', profile.xp, userId);
    }

    return newlyUnlocked;
  } catch (error) {
    console.error('Error checking badges:', error);
    return [];
  }
};

/**
 * Handle video lecture watch duration
 */
export const trackVideoWatchTime = async (userId, secondsWatched) => {
  try {
    const profile = await getOrCreateGameProfile(userId);
    
    const previousTotalMins = Math.floor(profile.totalVideoDurationWatched / 600); // block of 10m
    profile.totalVideoDurationWatched += Number(secondsWatched);
    const newTotalMins = Math.floor(profile.totalVideoDurationWatched / 600);

    await profile.save();

    const newBlocksEarned = newTotalMins - previousTotalMins;
    if (newBlocksEarned > 0) {
      // Award 10 XP per 10 minutes
      const xpEarned = newBlocksEarned * 10;
      await awardXP(userId, xpEarned, `Watched video for ${newBlocksEarned * 10} minutes`);
    }

    // Check watch time milestones
    await checkAndAwardBadges(userId, 'Milestones');
  } catch (error) {
    console.error('Error tracking video watch time:', error);
  }
};
