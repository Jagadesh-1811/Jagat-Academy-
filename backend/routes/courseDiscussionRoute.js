import express from 'express';
import isAuth from '../middlewares/isAuth.js';
import {
  getOrCreateDiscussion,
  getDiscussionMessages,
  sendDiscussionMessage,
} from '../controllers/courseDiscussionController.js';

const router = express.Router();

router.use(isAuth);

router.get('/:courseId', getOrCreateDiscussion);
router.get('/:courseId/messages', getDiscussionMessages);
router.post('/:courseId/messages', sendDiscussionMessage);

export default router;