import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['daily', 'weekly', 'special'],
      required: true,
    },
    targetType: {
      type: String,
      enum: ['watch_video', 'complete_assignment', 'perfect_quiz', 'login', 'help_peer'],
      required: true,
    },
    targetQuantity: {
      type: Number,
      required: true,
      default: 1,
    },
    coinsReward: {
      type: Number,
      default: 0,
    },
    xpReward: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Challenge = mongoose.model('Challenge', challengeSchema);
export default Challenge;
