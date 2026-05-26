import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  ipfsHash: {
    type: String,
    required: true
  },
  blockchainTxHash: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'revoked'],
    default: 'active'
  },
  level: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze'
  }
}, {
  timestamps: true
});

certificateSchema.index({ studentId: 1, courseId: 1 });

const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;
