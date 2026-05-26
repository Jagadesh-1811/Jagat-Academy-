import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Badge from '../models/badgeModel.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const badgesToSeed = [
  // Onboarding
  { name: 'Profile Pioneer', description: 'Complete your profile setup.', rarity: 'Common', category: 'Onboarding', criteria: { type: 'profile_complete', value: 1 }, xpReward: 50, coinsReward: 20 },
  { name: 'First Steps', description: 'Enroll in your first course.', rarity: 'Common', category: 'Onboarding', criteria: { type: 'course_count', value: 1 }, xpReward: 50, coinsReward: 20 },
  { name: 'Initiation', description: 'Watch your first 10 minutes of a lecture.', rarity: 'Common', category: 'Onboarding', criteria: { type: 'watch_time', value: 0.16 }, xpReward: 50, coinsReward: 10 },
  { name: 'Hello World', description: 'Post your first doubt or comment.', rarity: 'Common', category: 'Onboarding', criteria: { type: 'doubts_solved', value: 1 }, xpReward: 50, coinsReward: 10 },
  
  // Consistency
  { name: '3-Day Streak', description: 'Log in for 3 consecutive days.', rarity: 'Common', category: 'Consistency', criteria: { type: 'streak', value: 3 }, xpReward: 100, coinsReward: 50 },
  { name: '7-Day Streak', description: 'Log in for 7 consecutive days.', rarity: 'Rare', category: 'Consistency', criteria: { type: 'streak', value: 7 }, xpReward: 250, coinsReward: 150 },
  { name: '14-Day Streak', description: 'Log in for 14 consecutive days.', rarity: 'Rare', category: 'Consistency', criteria: { type: 'streak', value: 14 }, xpReward: 500, coinsReward: 300 },
  { name: '30-Day Streak', description: 'Log in for 30 consecutive days.', rarity: 'Epic', category: 'Consistency', criteria: { type: 'streak', value: 30 }, xpReward: 1000, coinsReward: 600 },
  { name: '100-Day Streak', description: 'Log in for 100 consecutive days.', rarity: 'Legendary', category: 'Consistency', criteria: { type: 'streak', value: 100 }, xpReward: 5000, coinsReward: 2000 },
  { name: 'Early Bird', description: 'Submit an assignment 2 days before the deadline.', rarity: 'Rare', category: 'Consistency', criteria: { type: 'custom', value: 1 }, xpReward: 200, coinsReward: 100 },
  
  // Performance & Milestones
  { name: 'Perfect Score', description: 'Get a 100% on any quiz or assignment.', rarity: 'Rare', category: 'Performance', criteria: { type: 'quiz_perfect', value: 1 }, xpReward: 150, coinsReward: 100 },
  { name: 'Triple Threat', description: 'Get a 100% on 3 quizzes.', rarity: 'Epic', category: 'Performance', criteria: { type: 'quiz_perfect', value: 3 }, xpReward: 500, coinsReward: 300 },
  { name: 'Top 10%', description: 'Rank in the top 10% of your course leaderboard.', rarity: 'Epic', category: 'Performance', criteria: { type: 'custom', value: 1 }, xpReward: 1000, coinsReward: 500 },
  { name: 'Speed Demon', description: 'Finish a course 2x faster than the average time.', rarity: 'Legendary', category: 'Performance', criteria: { type: 'custom', value: 1 }, xpReward: 2000, coinsReward: 1000 },
  { name: 'Level 5 Novice', description: 'Reach Level 5.', rarity: 'Common', category: 'Milestones', criteria: { type: 'level_milestone', value: 5 }, xpReward: 200, coinsReward: 100 },
  { name: 'Level 10 Adept', description: 'Reach Level 10.', rarity: 'Rare', category: 'Milestones', criteria: { type: 'level_milestone', value: 10 }, xpReward: 500, coinsReward: 250 },
  { name: 'Level 25 Expert', description: 'Reach Level 25.', rarity: 'Epic', category: 'Milestones', criteria: { type: 'level_milestone', value: 25 }, xpReward: 1500, coinsReward: 750 },
  { name: 'Level 50 Master', description: 'Reach Level 50.', rarity: 'Legendary', category: 'Milestones', criteria: { type: 'level_milestone', value: 50 }, xpReward: 5000, coinsReward: 2500 },
  
  // Course Completions
  { name: 'First Graduate', description: 'Complete your first course and earn a certificate.', rarity: 'Rare', category: 'Milestones', criteria: { type: 'custom', value: 1 }, xpReward: 500, coinsReward: 200 },
  { name: '5 Courses Down', description: 'Complete 5 courses.', rarity: 'Epic', category: 'Milestones', criteria: { type: 'custom', value: 5 }, xpReward: 2000, coinsReward: 1000 },
  { name: '10 Courses Down', description: 'Complete 10 courses.', rarity: 'Legendary', category: 'Milestones', criteria: { type: 'custom', value: 10 }, xpReward: 5000, coinsReward: 3000 },
  
  // Watch Time
  { name: 'Dedicated Learner', description: 'Watch 10 hours of video content.', rarity: 'Rare', category: 'Milestones', criteria: { type: 'watch_time', value: 10 }, xpReward: 500, coinsReward: 250 },
  { name: 'Binge Watcher', description: 'Watch 24 hours of video content.', rarity: 'Epic', category: 'Milestones', criteria: { type: 'watch_time', value: 24 }, xpReward: 1500, coinsReward: 750 },
  { name: 'Century Scholar', description: 'Watch 100 hours of video content.', rarity: 'Legendary', category: 'Milestones', criteria: { type: 'watch_time', value: 100 }, xpReward: 5000, coinsReward: 2500 },
  
  // Social & Mentorship
  { name: 'Helper', description: 'Answer 5 doubts correctly.', rarity: 'Rare', category: 'Social', criteria: { type: 'doubts_solved', value: 5 }, xpReward: 250, coinsReward: 100 },
  { name: 'Mentor', description: 'Answer 25 doubts correctly.', rarity: 'Epic', category: 'Social', criteria: { type: 'doubts_solved', value: 25 }, xpReward: 1000, coinsReward: 500 },
  { name: 'Guru', description: 'Answer 100 doubts correctly.', rarity: 'Legendary', category: 'Social', criteria: { type: 'doubts_solved', value: 100 }, xpReward: 5000, coinsReward: 2500 },
  { name: 'Friendly Face', description: 'Follow 5 other students.', rarity: 'Common', category: 'Social', criteria: { type: 'custom', value: 5 }, xpReward: 100, coinsReward: 50 },
  { name: 'Generous Giver', description: 'Gift your first badge to a friend.', rarity: 'Rare', category: 'Social', criteria: { type: 'gift_badge', value: 1 }, xpReward: 200, coinsReward: 100 },
  { name: 'Santa Claus', description: 'Gift 10 badges to friends.', rarity: 'Epic', category: 'Social', criteria: { type: 'gift_badge', value: 10 }, xpReward: 1000, coinsReward: 500 },
  
  // Custom & Hidden
  { name: 'Night Owl', description: 'Complete a lecture between 12 AM and 4 AM.', rarity: 'Rare', category: 'Performance', criteria: { type: 'custom', value: 1 }, xpReward: 250, coinsReward: 150 },
  { name: 'Prestige Tier I', description: 'Reset your level after reaching Level 100.', rarity: 'Legendary', category: 'Milestones', criteria: { type: 'custom', value: 1 }, xpReward: 10000, coinsReward: 5000 },
  { name: 'Prestige Tier II', description: 'Reach Prestige Tier II.', rarity: 'Legendary', category: 'Milestones', criteria: { type: 'custom', value: 2 }, xpReward: 25000, coinsReward: 10000 },
  { name: 'Reviewer', description: 'Leave a review on a course.', rarity: 'Common', category: 'Social', criteria: { type: 'custom', value: 1 }, xpReward: 100, coinsReward: 50 }
];

// Add generic variations to reach ~50 badges
for (let i = 1; i <= 15; i++) {
   badgesToSeed.push({
      name: `Course Collector Tier ${i}`,
      description: `Enroll in ${i * 3} courses.`,
      rarity: i > 10 ? 'Legendary' : i > 5 ? 'Epic' : 'Rare',
      category: 'Milestones',
      criteria: { type: 'course_count', value: i * 3 },
      xpReward: i * 150,
      coinsReward: i * 50
   });
}

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/jagat_academy';
    await mongoose.connect(mongoUri);
    console.log('📦 Connected to MongoDB');

    // Optionally clear existing badges or just upsert
    console.log('Seeding badges...');
    for (const b of badgesToSeed) {
       await Badge.findOneAndUpdate({ name: b.name }, b, { upsert: true, new: true });
    }

    console.log(`✅ Successfully seeded ${badgesToSeed.length} gamification badges!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
