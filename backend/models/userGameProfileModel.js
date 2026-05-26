import mongoose from 'mongoose';

const userGameProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    coins: {
      type: Number,
      default: 0, // Jagat Coins
    },
    badges: [
      {
        badge: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Badge',
        },
        unlockedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    showcaseBadges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge',
      },
    ],
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
    },
    prestige: {
      type: Number,
      default: 0,
    },
    optOutLeaderboard: {
      type: Boolean,
      default: false,
    },
    customAvatar: {
      type: String,
      default: '',
    },
    customTheme: {
      type: String,
      default: 'B&W', // 'B&W', 'Electric', 'Aura', 'Legendary'
    },
    earlyAccess: {
      type: Boolean,
      default: false,
    },
    totalVideoDurationWatched: {
      type: Number,
      default: 0, // in seconds
    },
    solvedDoubtCount: {
      type: Number,
      default: 0,
    },
    giftedBadgeCount: {
      type: Number,
      default: 0,
    },
    followedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const UserGameProfile = mongoose.model('UserGameProfile', userGameProfileSchema);
export default UserGameProfile;
