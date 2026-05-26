import mongoose from 'mongoose';

const customReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['educator', 'admin'],
    required: true
  },
  selectedMetrics: [{
    type: String // List of keys (e.g. 'learning_time', 'quiz_percentiles', 'drop_offs', 'revenue')
  }],
  schedule: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },
  recipients: [{
    type: String // Array of email addresses
  }],
  lastGenerated: {
    type: Date
  }
}, { timestamps: true });

const CustomReport = mongoose.model('CustomReport', customReportSchema);
export default CustomReport;
