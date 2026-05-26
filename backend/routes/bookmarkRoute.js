import express from 'express';
import isAuth from '../middlewares/isAuth.js';
import { 
  createBookmark, 
  getBookmarksByLecture, 
  getBookmarksForUser, 
  createDoubtForBookmark,
  updateBookmark,
  shareBookmark,
  exportStudyGuide
} from '../controllers/bookmarkController.js';

const router = express.Router();

router.post('/', isAuth, createBookmark);
router.get('/lecture/:lectureId', isAuth, getBookmarksByLecture);
router.get('/user', isAuth, getBookmarksForUser);
router.post('/:bookmarkId/doubt', isAuth, createDoubtForBookmark);
router.put('/:bookmarkId', isAuth, updateBookmark);
router.post('/:bookmarkId/share', isAuth, shareBookmark);
router.get('/export/:courseId', isAuth, exportStudyGuide);

export default router;
