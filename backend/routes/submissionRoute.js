
import express from 'express';
import { getSubmissions, submitAssignment, getStudentSubmissions } from '../controllers/submissionController.js';
import isAuth from '../middlewares/isAuth.js';

const router = express.Router();

router.post('/submit', isAuth, submitAssignment);
router.get('/student/my-submissions', isAuth, getStudentSubmissions);
router.get('/:assignmentId', isAuth, getSubmissions);

export default router;
