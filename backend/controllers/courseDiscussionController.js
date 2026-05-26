import Course from '../models/courseModel.js';
import { CourseDiscussion, CourseDiscussionMessage } from '../models/courseDiscussionModel.js';
import { emitCourseDiscussionMessage } from '../configs/socket.js';

const getIdString = (value) => {
  if (!value) return '';
  if (typeof value === 'object' && value._id) return String(value._id);
  return String(value);
};

const hasDiscussionAccess = (course, userId) => {
  const userIdStr = String(userId);
  const isCreator = getIdString(course.creator) === userIdStr;
  const isEnrolled = (course.enrolledStudents || []).some((studentId) => studentId.toString() === userIdStr);
  return isCreator || isEnrolled;
};

export const getOrCreateDiscussion = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    const course = await Course.findById(courseId).select('title creator enrolledStudents thumbnail').populate('creator', 'name photoUrl');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!hasDiscussionAccess(course, userId)) {
      return res.status(403).json({ message: 'You must be enrolled in this course to join the discussion' });
    }

    let discussion = await CourseDiscussion.findOne({ course: courseId })
      .populate('course', 'title thumbnail')
      .populate('createdBy', 'name photoUrl');

    if (!discussion) {
      discussion = await CourseDiscussion.create({
        course: courseId,
        createdBy: course.creator?._id || course.creator,
      });

      discussion = await CourseDiscussion.findById(discussion._id)
        .populate('course', 'title thumbnail')
        .populate('createdBy', 'name photoUrl');
    }

    return res.status(200).json({ discussion, course });
  } catch (error) {
    console.error('Get or create discussion error:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const getDiscussionMessages = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    const course = await Course.findById(courseId).select('creator enrolledStudents');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!hasDiscussionAccess(course, userId)) {
      return res.status(403).json({ message: 'You must be enrolled in this course to view the discussion' });
    }

    const discussion = await CourseDiscussion.findOne({ course: courseId });
    if (!discussion) {
      return res.status(200).json({ messages: [] });
    }

    const messages = await CourseDiscussionMessage.find({ discussion: discussion._id })
      .sort({ createdAt: 1 })
      .populate('sender', 'name photoUrl role');

    return res.status(200).json({ messages });
  } catch (error) {
    console.error('Get discussion messages error:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const sendDiscussionMessage = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const course = await Course.findById(courseId).select('creator enrolledStudents');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!hasDiscussionAccess(course, userId)) {
      return res.status(403).json({ message: 'You must be enrolled in this course to send messages' });
    }

    let discussion = await CourseDiscussion.findOne({ course: courseId });
    if (!discussion) {
      discussion = await CourseDiscussion.create({
        course: courseId,
        createdBy: course.creator?._id || course.creator,
      });
    }

    const senderRole = course.creator?.toString() === String(userId) ? 'educator' : 'student';

    const newMessage = await CourseDiscussionMessage.create({
      discussion: discussion._id,
      sender: userId,
      senderRole,
      message: message.trim(),
    });

    discussion.lastMessage = message.trim().slice(0, 100);
    discussion.lastMessageAt = new Date();
    await discussion.save();

    const populatedMessage = await CourseDiscussionMessage.findById(newMessage._id)
      .populate('sender', 'name photoUrl role');

    emitCourseDiscussionMessage(courseId, {
      courseId,
      message: populatedMessage,
    });

    return res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error('Send discussion message error:', error);
    return res.status(500).json({ message: error.message });
  }
};