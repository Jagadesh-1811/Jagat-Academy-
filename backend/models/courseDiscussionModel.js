import mongoose from 'mongoose';

const courseDiscussionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    unique: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastMessage: {
    type: String,
    default: '',
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

courseDiscussionSchema.index({ course: 1 }, { unique: true });

const courseDiscussionMessageSchema = new mongoose.Schema({
  discussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseDiscussion',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderRole: {
    type: String,
    enum: ['student', 'educator', 'parent', 'admin'],
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

courseDiscussionMessageSchema.index({ discussion: 1, createdAt: 1 });

const CourseDiscussion = mongoose.model('CourseDiscussion', courseDiscussionSchema);
const CourseDiscussionMessage = mongoose.model('CourseDiscussionMessage', courseDiscussionMessageSchema);

export { CourseDiscussion, CourseDiscussionMessage };