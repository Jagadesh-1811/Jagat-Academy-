import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'educator', 'parent', 'admin'],
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false
  },
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
    required: false
  },
  action: {
    type: String,
    enum: [
      'login',
      'logout',
      'lecture_start',
      'lecture_progress',
      'video_rewind',
      'video_dropoff',
      'quiz_attempt',
      'assignment_submit',
      'study_goal_achieved'
    ],
    required: true
  },
  duration: {
    type: Number,
    default: 0 // Duration in seconds (e.g. for watch time or session length)
  },
  metadata: {
    videoProgressPercent: { type: Number }, // 0 to 100
    quizScore: { type: Number },
    assignmentId: { type: mongoose.Schema.Types.ObjectId },
    coordinates: {
      lat: Number,
      lng: Number
    },
    device: { type: String }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add index on user and action to make aggregated student statistics extremely fast
activityLogSchema.index({ user: 1, action: 1, timestamp: -1 });
activityLogSchema.index({ course: 1, action: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
