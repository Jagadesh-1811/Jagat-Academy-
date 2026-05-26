import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
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
      ref: 'Lecture',
      required: true,
    },
    timestamp: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      default: ''
    },
    linkedDoubt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doubt'
    },
    folder: {
      type: String,
      default: 'General'
    },
    highlight: {
      text: { type: String },
      color: { type: String, default: 'yellow' },
      startIndex: { type: Number },
      endIndex: { type: Number },
      pdfPage: { type: Number }
    },
    stickyNotes: [{
      page: { type: Number },
      content: { type: String },
      position: {
        x: { type: Number },
        y: { type: Number }
      }
    }],
    sharedWith: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  { timestamps: true }
);

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
export default Bookmark;
