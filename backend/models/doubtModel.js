import mongoose from 'mongoose';

const doubtSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lecture'
    },
    bookmark: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bookmark'
    },
    question: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'answered', 'closed'],
      default: 'open'
    },
    answer: {
      type: String
    }
  },
  { timestamps: true }
);

const Doubt = mongoose.model('Doubt', doubtSchema);
export default Doubt;
