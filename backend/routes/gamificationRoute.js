import express from 'express';
import isAuth from '../middlewares/isAuth.js';
import {
  getProfile,
  awardXpAdmin,
  unlockBadgeAdmin,
  getLeaderboard,
  getChallenges,
  redeemReward,
  getRedemptions,
  getBadges,
  togglePrivacy,
  followUser,
  giftBadge,
  triggerPrestige
} from '../controllers/gamificationController.js';

const router = express.Router();

// Student routes protected by auth
router.get('/profile/:userId', isAuth, getProfile);
router.get('/leaderboard/:type', isAuth, getLeaderboard);
router.get('/challenges', isAuth, getChallenges);
router.post('/redeem', isAuth, redeemReward);
router.get('/redemptions', isAuth, getRedemptions);
router.get('/badges', isAuth, getBadges);
router.post('/toggle-privacy', isAuth, togglePrivacy);
router.post('/follow/:userId', isAuth, followUser);
router.post('/gift-badge', isAuth, giftBadge);
router.post('/prestige', isAuth, triggerPrestige);

// Administrative / Internal secure triggers
router.post('/award-xp', isAuth, awardXpAdmin);
router.post('/unlock-badge', isAuth, unlockBadgeAdmin);

export default router;
