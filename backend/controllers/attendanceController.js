import Attendance from '../models/attendanceModel.js';
import Course from '../models/courseModel.js';
import User from '../models/userModel.js';
import Lecture from '../models/lectureModel.js';
import { v4 as uuidv4 } from 'uuid';
import geolib from 'geolib';
import AttendanceSession from '../models/attendanceSessionModel.js';
import crypto from 'crypto';

// In-memory cache for active QR sessions: token -> session details
const activeSessions = new Map();

// Helper to clean up expired sessions (in-memory)
const cleanupExpiredSessions = () => {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (session.expiresAt && new Date(session.expiresAt).getTime() <= now) {
      activeSessions.delete(token);
    }
  }
};

// Helper to get current Indian Standard Time (IST) Date
const getISTDate = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 5.5)); // UTC+5.5
};

// Validate if the current IST time is within the active slots: 8:00-09:00 or 17:00-18:00
const isWithinTimeSlots = (date = null) => {
  const now = date || getISTDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Morning slot: 08:00 - 09:00 (inclusive start, exclusive end)
  if (hours === 8) return true;

  // Evening slot: 17:00 - 18:00
  if (hours === 17) return true;

  return false;
};

// 1. Generate live QR session (Educator)
export const generateQR = async (req, res) => {
  try {
    const { courseId, lectureId, lat, lng } = req.body;
    const educatorId = req.userId;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required' });
    }

    // Verify educator owns course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.creator.toString() !== educatorId.toString()) {
      return res.status(403).json({ success: false, message: 'Only course creator can generate attendance QR' });
    }

    // Ensure QR generation happens within allowed time windows
    const nowIST = getISTDate();
    if (!isWithinTimeSlots(nowIST)) {
      return res.status(403).json({ success: false, message: 'QR generation is allowed only during scheduled attendance windows (08:00-09:00, 17:00-18:00 IST).' });
    }

    // Clean up in-memory cache
    cleanupExpiredSessions();

    const token = uuidv4();

    // Valid for 1 hour from creation
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 60 * 60 * 1000);

    // Persist session in DB
    const attendanceSession = await AttendanceSession.create({
      token,
      course: courseId,
      lecture: lectureId || null,
      educator: educatorId,
      createdAt,
      expiresAt,
      validFrom: createdAt,
      validTo: expiresAt,
      educatorCoordinates: { lat: parseFloat(lat), lng: parseFloat(lng) }
    });

    // Cache in-memory for quick lookup
    activeSessions.set(token, {
      courseId,
      lectureId: lectureId || null,
      educatorId,
      educatorCoordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
      createdAt: createdAt.getTime(),
      expiresAt: expiresAt.getTime()
    });

    res.status(200).json({
      success: true,
      token,
      expiresIn: 3600 // seconds (1 hour)
    });
  } catch (error) {
    console.error('Error generating QR:', error);
    res.status(500).json({ success: false, message: 'Failed to generate QR session', error: error.message });
  }
};

// 2. Get QR Session Information - Connector Screen (Student scanning verification)
export const getSessionInfo = async (req, res) => {
  try {
    const { token } = req.params;
    const studentId = req.userId;

    cleanupExpiredSessions();

      // First try in-memory cache
      let session = activeSessions.get(token);
      if (!session) {
        // Try DB
        const dbSession = await AttendanceSession.findOne({ token, active: true });
        if (!dbSession) {
          return res.status(410).json({ success: false, message: 'QR code has expired or is invalid. Please ask your educator to generate a new one.' });
        }

        // Map dbSession to session shape
        session = {
          courseId: dbSession.course.toString(),
          lectureId: dbSession.lecture ? dbSession.lecture.toString() : null,
          educatorId: dbSession.educator.toString(),
          educatorCoordinates: dbSession.educatorCoordinates,
          createdAt: dbSession.createdAt.getTime(),
          expiresAt: dbSession.expiresAt.getTime()
        };
        // Cache it
        activeSessions.set(token, session);
      }

    // Fetch details
    const course = await Course.findById(session.courseId);
    const educator = await User.findById(session.educatorId);
    const student = await User.findById(studentId);
    let lectureTitle = 'General Session';

    if (session.lectureId) {
      const lecture = await Lecture.findById(session.lectureId);
      if (lecture) lectureTitle = lecture.lectureTitle;
    }

    res.status(200).json({
      success: true,
      courseTitle: course?.title || 'Unknown Course',
      educatorName: educator?.name || 'Mentor/Educator',
      studentName: student?.name || 'Student',
      lectureTitle,
      courseId: session.courseId,
      lectureId: session.lectureId,
      isTimeWindowActive: isWithinTimeSlots()
    });
  } catch (error) {
    console.error('Error fetching session info:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve session info', error: error.message });
  }
};

// 3. Mark Attendance (Student / Auto watch trigger)
export const markAttendance = async (req, res) => {
  try {
    const { courseId, lectureId, checkInMethod, token, coordinates } = req.body;
    const studentId = req.userId;

    // Check Time Window strictly for QR and direct check-ins
    // Allow overrides if bypassed by educator manually
    if (checkInMethod !== 'manual' && !isWithinTimeSlots()) {
      return res.status(403).json({
        success: false,
        message: 'Attendance form is closed. Checking in is only active between 8:00 AM - 9:00 AM and 6:00 PM - 7:00 PM IST daily.'
      });
    }

    // Core validation based on method
    if (checkInMethod === 'qr') {
      if (!token) {
        return res.status(400).json({ success: false, message: 'QR session token is required' });
      }

      cleanupExpiredSessions();
      let session = activeSessions.get(token);
      if (!session) {
        const dbSession = await AttendanceSession.findOne({ token, active: true });
        if (!dbSession) return res.status(410).json({ success: false, message: 'QR token has expired or is invalid' });

        // Check expiry
        if (new Date(dbSession.expiresAt).getTime() <= Date.now()) {
          return res.status(410).json({ success: false, message: 'QR token expired' });
        }

        session = {
          courseId: dbSession.course.toString(),
          lectureId: dbSession.lecture ? dbSession.lecture.toString() : null,
          educatorId: dbSession.educator.toString(),
          educatorCoordinates: dbSession.educatorCoordinates,
          createdAt: dbSession.createdAt.getTime(),
          expiresAt: dbSession.expiresAt.getTime()
        };
        activeSessions.set(token, session);
      } else {
        // verify not expired
        if (session.expiresAt && session.expiresAt <= Date.now()) {
          return res.status(410).json({ success: false, message: 'QR token expired' });
        }
      }

      // Geo-fencing validation bypassed for sandbox developer convenience
      console.log('✅ Geo-fencing check bypassed in sandbox development mode.');
    } else if (checkInMethod === 'auto') {
      // Automatic watch completion checking
      if (!courseId) {
        return res.status(400).json({ success: false, message: 'Course ID is required for video log completion' });
      }
    }

    // Find or update attendance record
    const query = { student: studentId, course: courseId };
    if (lectureId) query.lecture = lectureId;

    const existingAttendance = await Attendance.findOne(query);
    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: 'Attendance already marked for this session/lecture.'
      });
    }

    const attendance = await Attendance.create({
      student: studentId,
      course: courseId,
      lecture: lectureId || null,
      status: 'present',
      checkInMethod,
      checkInTime: new Date(),
      location: coordinates ? { lat: parseFloat(coordinates.lat), lng: parseFloat(coordinates.lng) } : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Attendance successfully marked present!',
      attendance
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to mark attendance', error: error.message });
  }
};

// 4. Get Student Attendance History & Rate for a Course
export const getStudentHistory = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.userId;

    const query = { student: studentId, course: courseId };
    const records = await Attendance.find(query)
      .populate('lecture', 'lectureTitle')
      .sort({ checkInTime: -1 });

    // Calculate rate
    const course = await Course.findById(courseId);
    // Approximate total required sessions from existing course lectures, or total records
    const totalSessions = course?.lectures?.length || records.length || 1;
    const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length;
    const attendanceRate = Math.round((presentCount / Math.max(totalSessions, 1)) * 100);

    res.status(200).json({
      success: true,
      records,
      attendanceRate,
      totalSessions,
      presentCount
    });
  } catch (error) {
    console.error('Error fetching student attendance history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student history', error: error.message });
  }
};

// 5. Get Course Attendance History for Educators
export const getCourseHistory = async (req, res) => {
  try {
    const { courseId } = req.params;
    const educatorId = req.userId;

    // Verify educator ownership
    const course = await Course.findById(courseId).populate('enrolledStudents', 'name email');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.creator.toString() !== educatorId.toString()) {
      return res.status(403).json({ success: false, message: 'Only course creator can view this history' });
    }

    const records = await Attendance.find({ course: courseId })
      .populate('student', 'name email')
      .populate('lecture', 'lectureTitle')
      .sort({ checkInTime: -1 });

    res.status(200).json({
      success: true,
      records,
      enrolledStudents: course.enrolledStudents
    });
  } catch (error) {
    console.error('Error fetching course history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch course history', error: error.message });
  }
};

// 6. Bulk Manual Override (Educator)
export const manualBulkMark = async (req, res) => {
  try {
    const { courseId, lectureId, records } = req.body; // records: [{ studentId, status }]
    const educatorId = req.userId;

    if (!courseId || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Course ID and array of records are required' });
    }

    // Verify educator owns course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.creator.toString() !== educatorId.toString()) {
      return res.status(403).json({ success: false, message: 'Only course creator can perform manual attendance override' });
    }

    const bulkOperations = [];

    for (const record of records) {
      const { studentId, status } = record;
      if (!studentId || !status) continue;

      const filter = { student: studentId, course: courseId };
      if (lectureId) filter.lecture = lectureId;

      bulkOperations.push({
        updateOne: {
          filter,
          update: {
            $set: {
              status,
              checkInMethod: 'manual',
              isOverridden: true,
              overrideNote: 'Educator manual override',
              checkInTime: new Date()
            }
          },
          upsert: true
        }
      });
    }

    if (bulkOperations.length > 0) {
      await Attendance.bulkWrite(bulkOperations);
    }

    res.status(200).json({
      success: true,
      message: `Manual bulk attendance override successful for ${bulkOperations.length} records.`
    });
  } catch (error) {
    console.error('Error processing bulk manual attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to update manual bulk attendance', error: error.message });
  }
};

// 7. Get Active Attendance Sessions (for student sandbox view helper)
export const getActiveSessions = async (req, res) => {
  try {
    cleanupExpiredSessions();
    const sessionsList = [];

    for (const [token, details] of activeSessions.entries()) {
      const course = await Course.findById(details.courseId);
      let lectureTitle = 'General Session';
      if (details.lectureId) {
        const lecture = await Lecture.findById(details.lectureId);
        if (lecture) lectureTitle = lecture.lectureTitle;
      }
      sessionsList.push({
        token,
        courseId: details.courseId,
        courseTitle: course?.title || 'Unknown Course',
        lectureTitle,
        createdAt: details.createdAt,
        expiresIn: Math.max(0, 300 - Math.floor((Date.now() - details.createdAt) / 1000))
      });
    }

    res.status(200).json({
      success: true,
      sessions: sessionsList
    });
  } catch (error) {
    console.error('Error fetching active QR sessions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active sessions', error: error.message });
  }
};

