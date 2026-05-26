import mongoose from 'mongoose';

const studyGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    activeQuest: {
      description: {
        type: String,
        default: 'Collaborative Study Session: watch 20 hours combined lectures!',
      },
      progress: {
        type: Number,
        default: 0,
      },
      target: {
        type: Number,
        default: 72000, // 20 hours in seconds
      },
      rewardCoins: {
        type: Number,
        default: 500,
      },
    },
  },
  { timestamps: true }
);

const StudyGroup = mongoose.model('StudyGroup', studyGroupSchema);
export default StudyGroup;
