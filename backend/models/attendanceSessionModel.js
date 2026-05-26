import mongoose from 'mongoose';

const attendanceSessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
  educator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  validFrom: { type: Date },
  validTo: { type: Date },
  educatorCoordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);
export default AttendanceSession;
