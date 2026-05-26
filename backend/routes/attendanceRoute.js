import express from 'express';
import {
  generateQR,
  getSessionInfo,
  markAttendance,
  getStudentHistory,
  getCourseHistory,
  manualBulkMark,
  getActiveSessions,
  getMyAttendance
} from '../controllers/attendanceController.js';
import isAuth from '../middlewares/isAuth.js';

const router = express.Router();

// Retrieve all active QR sessions (Student helper / sandbox)
router.get('/sessions/active', isAuth, getActiveSessions);

// Generate live QR session (Educator)
router.post('/qr/generate', isAuth, generateQR);

// Retrieve QR scan session details (Student connector screen)
router.get('/session-info/:token', isAuth, getSessionInfo);

// Mark attendance (Student / Auto watch trigger)
router.post('/mark', isAuth, markAttendance);

// Retrieve all attendance history for current student globally
router.get('/my-attendance', isAuth, getMyAttendance);

// Retrieve student history for a specific course
router.get('/student/:courseId', isAuth, getStudentHistory);

// Retrieve all course logs (Educator)
router.get('/course/:courseId', isAuth, getCourseHistory);

// Manual bulk overrides (Educator)
router.post('/manual-bulk', isAuth, manualBulkMark);

export default router;
