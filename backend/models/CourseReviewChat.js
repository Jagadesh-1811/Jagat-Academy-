import mongoose from "mongoose";

const courseReviewChatSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MultiAgentCourse',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderModel: {
    type: String,
    enum: ['student', 'educator'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('CourseReviewChat', courseReviewChatSchema);