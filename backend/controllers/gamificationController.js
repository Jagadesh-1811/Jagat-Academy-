import UserGameProfile from '../models/userGameProfileModel.js';
import Badge from '../models/badgeModel.js';
import Challenge from '../models/challengeModel.js';
import Redemption from '../models/redemptionModel.js';
import StudyGroup from '../models/studyGroupModel.js';
import User from '../models/userModel.js';
import Progress from '../models/progressModel.js';
import * as gamificationService from '../services/gamificationService.js';
import redisWrapper from '../configs/redis.js';
import { emitUserEvent } from '../configs/socket.js';

/**
 * GET /api/gamification/profile/:userId
 */
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await gamificationService.getOrCreateGameProfile(userId);
    const populatedProfile = await UserGameProfile.findOne({ user: userId })
      .populate('user', 'name email photoUrl role description')
      .populate('badges.badge')
      .populate('showcaseBadges')
      .populate('followedUsers', 'name photoUrl email')
      .populate('followers', 'name photoUrl email');

    res.status(200).json({ success: true, profile: populatedProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/gamification/award-xp
 * Secured Internal or Administrative XP awards
 */
export const awardXpAdmin = async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;
    if (!userId || !amount) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const result = await gamificationService.awardXP(userId, Number(amount), reason || 'Admin Reward');
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/gamification/unlock-badge
 * Manual administrative badge unlocks
 */
export const unlockBadgeAdmin = async (req, res) => {
  try {
    const { userId, badgeId } = req.body;
    if (!userId || !badgeId) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const badge = await Badge.findById(badgeId);
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }

    const profile = await gamificationService.getOrCreateGameProfile(userId);
    const alreadyUnlocked = profile.badges.some((b) => b.badge.toString() === badgeId.toString());

    if (alreadyUnlocked) {
      return res.status(400).json({ success: false, message: 'Badge already unlocked' });
    }

    profile.badges.push({ badge: badgeId, unlockedAt: new Date() });
    
    // Add to showcase if there is space
    if (profile.showcaseBadges.length < 5) {
      profile.showcaseBadges.push(badgeId);
    }
    
    profile.coins += badge.coinsReward;
    await profile.save();

    // Award XP
    if (badge.xpReward > 0) {
      await gamificationService.awardXP(userId, badge.xpReward, `Unlocked Badge: ${badge.name}`);
    }

    // Trigger celebration event
    emitUserEvent(userId, 'badge:unlocked', {
      badge,
      xpReward: badge.xpReward,
      coinsReward: badge.coinsReward,
    });

    res.status(200).json({ success: true, message: 'Badge unlocked successfully', badge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/gamification/leaderboard/:type
 * Returns rankings. Cache accelerated by Redis sorted sets.
 */
export const getLeaderboard = async (req, res) => {
  try {
    const { type } = req.params; // 'global', 'weekly', 'monthly', 'friends', 'course'
    const courseId = req.query.courseId;
    const userId = req.userId;

    if (type === 'friends') {
      const profile = await gamificationService.getOrCreateGameProfile(userId);
      const friendsList = profile.followedUsers.map((id) => id.toString());
      friendsList.push(userId.toString()); // Include user themselves

      const rankings = await UserGameProfile.find({
        user: { $in: friendsList },
        optOutLeaderboard: false,
      })
        .populate('user', 'name photoUrl email')
        .sort({ xp: -1 })
        .limit(20);

      const formatted = rankings.map((r, i) => ({
        userId: r.user._id,
        name: r.user.name,
        photoUrl: r.user.photoUrl,
        xp: r.xp,
        level: r.level,
        rank: i + 1,
      }));

      return res.status(200).json({ success: true, rankings: formatted });
    }

    if (type === 'course' && courseId) {
      // Find course progress and sort by progressPercentage
      const records = await Progress.find({ course: courseId })
        .populate('student', 'name photoUrl email')
        .sort({ progressPercentage: -1 })
        .limit(50);

      const formatted = records
        .filter((r) => r.student) // Ignore deleted users
        .map((r, i) => ({
          userId: r.student._id,
          name: r.student.name,
          photoUrl: r.student.photoUrl,
          progress: r.progressPercentage,
          rank: i + 1,
        }));

      return res.status(200).json({ success: true, rankings: formatted });
    }

    // Default: 'global', 'weekly', 'monthly' -> fetch from Redis cache or fallback aggregation
    const cacheKey = `leaderboard:${type}`;
    let sortedSetMembers = [];
    
    // Fetch cached rankings from Redis (zrevrange WITHSCORES)
    sortedSetMembers = await redisWrapper.zrevrange(cacheKey, 0, 49, 'WITHSCORES');

    if (sortedSetMembers.length > 0) {
      const rankings = [];
      for (let i = 0; i < sortedSetMembers.length; i += 2) {
        const uId = sortedSetMembers[i];
        const score = Number(sortedSetMembers[i + 1]);
        const user = await User.findById(uId).select('name photoUrl email');
        const gameProfile = await UserGameProfile.findOne({ user: uId }).select('level optOutLeaderboard');
        
        if (user && gameProfile && !gameProfile.optOutLeaderboard) {
          rankings.push({
            userId: uId,
            name: user.name,
            photoUrl: user.photoUrl,
            xp: score,
            level: gameProfile.level,
          });
        }
      }

      // Add ranks
      const formatted = rankings.map((r, i) => ({ ...r, rank: i + 1 }));
      return res.status(200).json({ success: true, rankings: formatted });
    }

    // Cache miss / fallback database aggregation query
    const rankings = await UserGameProfile.find({ optOutLeaderboard: false })
      .populate('user', 'name photoUrl email')
      .sort({ xp: -1 })
      .limit(50);

    const formatted = rankings
      .filter((r) => r.user)
      .map((r, i) => {
        // Hydrate redis cache asynchronously
        redisWrapper.zadd(cacheKey, r.xp, r.user._id.toString());

        return {
          userId: r.user._id,
          name: r.user.name,
          photoUrl: r.user.photoUrl,
          xp: r.xp,
          level: r.level,
          rank: i + 1,
        };
      });

    res.status(200).json({ success: true, rankings: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/gamification/challenges
 * Retrieve active daily and weekly quests
 */
export const getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({
      $or: [
        { endDate: { $gte: new Date() } },
        { endDate: null }
      ]
    }).sort({ endDate: 1, createdAt: -1 });

    res.status(200).json({ success: true, challenges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/gamification/redeem
 * Virtual Jagat Coins rewards catalog store checkout
 */
export const redeemReward = async (req, res) => {
  try {
    const { item } = req.body;
    const userId = req.userId;

    const catalogCost = {
      discount_coupon: 500,
      extended_access: 1000,
      exclusive_content: 750,
      merchandise: 5000,
    };

    const cost = catalogCost[item];
    if (!cost) {
      return res.status(400).json({ success: false, message: 'Invalid reward item selected' });
    }

    const profile = await gamificationService.getOrCreateGameProfile(userId);
    if (profile.coins < cost) {
      return res.status(400).json({ success: false, message: `Insufficient Jagat Coins. Need ${cost} JC.` });
    }

    // Generate unique alpha-numeric coupon or delivery voucher key
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = `JAGT-${item.slice(0, 4).toUpperCase()}-`;
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    profile.coins -= cost;
    await profile.save();

    const redemption = await Redemption.create({
      user: userId,
      item,
      coinsCost: cost,
      status: item === 'merchandise' ? 'pending' : 'delivered',
      code,
    });

    res.status(201).json({
      success: true,
      message: 'Redemption successful!',
      redemption,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/gamification/redemptions
 * List current user's reward redemptions
 */
export const getRedemptions = async (req, res) => {
  try {
    const redemptions = await Redemption.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, redemptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/gamification/badges
 * List all available achievement definitions
 */
export const getBadges = async (req, res) => {
  try {
    const badges = await Badge.find().sort({ rarity: 1, name: 1 });
    res.status(200).json({ success: true, badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/gamification/toggle-privacy
 */
export const togglePrivacy = async (req, res) => {
  try {
    const userId = req.userId;
    const profile = await gamificationService.getOrCreateGameProfile(userId);
    profile.optOutLeaderboard = !profile.optOutLeaderboard;
    await profile.save();

    // If opting out, clear scores from Redis sets
    if (profile.optOutLeaderboard) {
      await redisWrapper.del(`leaderboard:global:${userId}`);
    }

    res.status(200).json({
      success: true,
      message: `Privacy settings updated. You are now ${profile.optOutLeaderboard ? 'hidden from' : 'visible on'} leaderboards.`,
      optOutLeaderboard: profile.optOutLeaderboard,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/gamification/follow/:userId
 * Follow/unfollow other students
 */
export const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const currentProfile = await gamificationService.getOrCreateGameProfile(currentUserId);
    const targetProfile = await gamificationService.getOrCreateGameProfile(targetUserId);

    const isFollowing = currentProfile.followedUsers.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentProfile.followedUsers = currentProfile.followedUsers.filter((id) => id.toString() !== targetUserId);
      targetProfile.followers = targetProfile.followers.filter((id) => id.toString() !== currentUserId);
      await currentProfile.save();
      await targetProfile.save();

      return res.status(200).json({ success: true, message: 'Unfollowed user successfully', isFollowing: false });
    } else {
      // Follow
      currentProfile.followedUsers.push(targetUserId);
      targetProfile.followers.push(currentUserId);
      await currentProfile.save();
      await targetProfile.save();

      // Trigger standard peer check
      await gamificationService.checkAndAwardBadges(currentUserId, 'Social');

      return res.status(200).json({ success: true, message: 'Followed user successfully', isFollowing: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/gamification/gift-badge
 * Gift a copy of unlocked badge to followed friend
 */
export const giftBadge = async (req, res) => {
  try {
    const { targetUserId, badgeId } = req.body;
    const senderUserId = req.userId;

    if (targetUserId === senderUserId) {
      return res.status(400).json({ success: false, message: 'Cannot gift to yourself' });
    }

    const senderProfile = await gamificationService.getOrCreateGameProfile(senderUserId);
    const targetProfile = await gamificationService.getOrCreateGameProfile(targetUserId);

    // Verify coin balance for gifting cost (50 Jagat Coins)
    if (senderProfile.coins < 50) {
      return res.status(400).json({ success: false, message: 'Gifting a badge costs 50 Jagat Coins.' });
    }

    // Verify sender owns the badge
    const ownsBadge = senderProfile.badges.some((b) => b.badge._id.toString() === badgeId.toString() || b.badge.toString() === badgeId.toString());
    if (!ownsBadge) {
      return res.status(400).json({ success: false, message: 'You must own this badge before gifting a copy!' });
    }

    // Verify recipient does not already own the badge
    const recipientOwns = targetProfile.badges.some((b) => b.badge._id.toString() === badgeId.toString() || b.badge.toString() === badgeId.toString());
    if (recipientOwns) {
      return res.status(400).json({ success: false, message: 'Recipient already unlocked this badge.' });
    }

    const badge = await Badge.findById(badgeId);

    // Deduct coins & increment gift tally
    senderProfile.coins -= 50;
    senderProfile.giftedBadgeCount += 1;
    await senderProfile.save();

    // Reward recipient
    targetProfile.badges.push({ badge: badgeId, unlockedAt: new Date() });
    await targetProfile.save();

    // Emit celebration and alert Recipient
    emitUserEvent(targetUserId, 'badge:unlocked', {
      badge,
      xpReward: 0,
      coinsReward: 0,
      giftedBy: senderUserId,
      reason: `Received a gift from a friend!`,
    });

    // Check Social badges
    await gamificationService.checkAndAwardBadges(senderUserId, 'Social');

    res.status(200).json({
      success: true,
      message: `Successfully gifted ${badge.name} to friend!`,
      coinsBalance: senderProfile.coins,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/gamification/prestige
 * Reset levels for high status legendary badges
 */
export const triggerPrestige = async (req, res) => {
  try {
    const userId = req.userId;
    const profile = await gamificationService.getOrCreateGameProfile(userId);

    if (profile.level < 100) {
      return res.status(400).json({ success: false, message: 'You must reach Level 100 to trigger Prestige reset!' });
    }

    profile.prestige += 1;
    profile.level = 1;
    profile.xp = 0;
    await profile.save();

    // Seed prestige badge
    const badgeName = `Prestige Tier ${profile.prestige === 1 ? 'I' : 'II'}`;
    const prestigeBadge = await Badge.findOne({ name: badgeName });
    if (prestigeBadge) {
      profile.badges.push({ badge: prestigeBadge._id, unlockedAt: new Date() });
      await profile.save();

      emitUserEvent(userId, 'badge:unlocked', {
        badge: prestigeBadge,
        xpReward: 0,
        coinsReward: 0,
      });
    }

    res.status(200).json({
      success: true,
      message: `CONGRATULATIONS! You have ascended to Prestige Tier ${profile.prestige}! Your levels have reset to 1.`,
      profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
