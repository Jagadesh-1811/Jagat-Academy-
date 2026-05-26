import express from 'express';
import {
  registerParent,
  verifyParentEmail,
  loginParent,
  linkStudent,
  getLinkedStudents,
  getStudentProgress,
  getStudentGrades,
  getStudentAttendance,
  getStudentAssignments,
  getStudentOrders,
  messageEducator,
  getConversations
} from '../controllers/parentController.js';
import isAuth from '../middlewares/isAuth.js';

const router = express.Router();

router.post('/register', registerParent);
router.post('/verify-email', verifyParentEmail);
router.post('/login', loginParent);
router.post('/link-student', isAuth, linkStudent);
router.get('/students', isAuth, getLinkedStudents);
router.get('/student/:id/progress', isAuth, getStudentProgress);
router.get('/student/:id/grades', isAuth, getStudentGrades);
router.get('/student/:id/attendance', isAuth, getStudentAttendance);
router.get('/student/:id/assignments', isAuth, getStudentAssignments);
router.get('/student/:id/orders', isAuth, getStudentOrders);
router.post('/message-educator', isAuth, messageEducator);
router.get('/conversations', isAuth, getConversations);

export default router;
