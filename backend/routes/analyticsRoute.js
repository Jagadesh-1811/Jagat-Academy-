import express from 'express';
import {
  logActivity,
  getStudentAnalytics,
  getEducatorAnalytics,
  getParentAnalytics,
  getAdminAnalytics,
  generateCustomReport,
  exportData
} from '../controllers/analyticsController.js';
import isAuth from '../middlewares/isAuth.js';

const router = express.Router();

// 1. Log real-time activity and watch progress (Learners/router calls)
router.post('/log', isAuth, logActivity);

// 2. Fetch specific student performance, AI revised recommend, streaks, and forecasts
router.get('/student/:id', isAuth, getStudentAnalytics);

// 3. Fetch educator analytics (lecture watch curves, quiz common mistakes, revenues)
router.get('/educator/:id', isAuth, getEducatorAnalytics);

// 4. Fetch parent comparative peer dashboards
router.get('/parent/:id', isAuth, getParentAnalytics);

// 5. Fetch platform admin system-wide analytics, geo user rates, response speeds
router.get('/admin', isAuth, getAdminAnalytics);

// 6. Custom report drag-and-drop compilation trigger
router.post('/report/generate', isAuth, generateCustomReport);

// 7. Export aggregated logs download stream
router.get('/export/:type', isAuth, exportData);

export default router;
