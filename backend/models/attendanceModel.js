import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
    required: false
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true,
    default: 'present'
  },
  checkInMethod: {
    type: String,
    enum: ['qr', 'gps', 'manual', 'auto'],
    required: true
  },
  checkInTime: {
    type: Date,
    default: Date.now
  },
  checkOutTime: {
    type: Date
  },
  location: {
    lat: Number,
    lng: Number
  },
  isOverridden: {
    type: Boolean,
    default: false
  },
  overrideNote: {
    type: String,
    default: ""
  }
}, { timestamps: true });

// Ensure unique record per student per course per lecture
attendanceSchema.index({ student: 1, course: 1, lecture: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
