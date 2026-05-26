import express from 'express';
import {
  getStudentParentPortal,
  approveParent,
  rejectParent,
  updateParentPrivacy
} from '../controllers/studentPortalController.js';
import isAuth from '../middlewares/isAuth.js';

const router = express.Router();

router.get('/parent-portal', isAuth, getStudentParentPortal);
router.post('/approve-parent', isAuth, approveParent);
router.post('/reject-parent', isAuth, rejectParent);
router.put('/parent-privacy', isAuth, updateParentPrivacy);

export default router;
