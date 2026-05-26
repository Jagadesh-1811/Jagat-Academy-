import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true, // Emoji or Lucide icon string
    },
    rarity: {
      type: String,
      enum: ['Common', 'Rare', 'Epic', 'Legendary'],
      default: 'Common',
    },
    category: {
      type: String,
      enum: ['Onboarding', 'Consistency', 'Performance', 'Social', 'Milestones'],
      required: true,
    },
    criteria: {
      type: {
        type: String, // 'streak', 'course_count', 'watch_time', 'quiz_perfect', 'doubts_solved', 'profile_complete', 'gift_badge', 'level_milestone', 'badge_count', 'following_count', 'followers_count', 'assignments_count', 'courses_completed'
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
    },
    xpReward: {
      type: Number,
      default: 0,
    },
    coinsReward: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Badge = mongoose.model('Badge', badgeSchema);
export default Badge;
