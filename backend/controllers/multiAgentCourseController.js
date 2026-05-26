import MultiAgentCourse from '../models/MultiAgentCourse.js';
import CourseReviewChat from '../models/CourseReviewChat.js';
import { generateCourseModules } from '../services/multiAgentCourseService.js';

/**
 * Generate a new multi-agent AI course
 * POST /api/ai/course/generate
 */
export const generateAICourse = async (req, res) => {
  try {
    const { topic, difficultyLevel, description } = req.body;
    const studentId = req.userId;

    // Validate input
    if (!studentId || !topic || !difficultyLevel) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, topic, and difficulty level are required'
      });
    }

    // Validate difficulty level
    const validLevels = ['Beginner', 'Intermediate', 'Advanced'];
    if (!validLevels.includes(difficultyLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Difficulty level must be Beginner, Intermediate, or Advanced'
      });
    }

    console.log(`🎓 Generating AI course for student ${studentId}: ${topic} (${difficultyLevel})${description ? ` — ${description.substring(0, 80)}...` : ''}`);

    // Generate course modules using the multi-agent service
    const courseData = await generateCourseModules({
      studentId,
      topic,
      difficultyLevel,
      description
    });

    // Create new MultiAgentCourse document with status set to PendingEducatorReview
    // as specified in Prompt 3 after Agent 4 assembly
    const newCourse = new MultiAgentCourse({
      ...courseData,
      status: 'PendingEducatorReview'
    });
    const savedCourse = await newCourse.save();

    // Initialize a chat room for this course
    const initialChat = new CourseReviewChat({
      courseId: savedCourse._id,
      senderId: studentId, // Initial message from student
      senderModel: 'student',
      message: `I've requested a course on "${topic}" at ${difficultyLevel} level. The AI agents have generated the initial content. Please review and provide feedback.`
    });
    await initialChat.save();

    res.status(201).json({
      success: true,
      message: 'AI course generated successfully',
      course: savedCourse
    });

  } catch (error) {
    console.error(`❌ Error generating AI course: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI course',
      error: error.message
    });
  }
};

/**
 * Get a specific AI course by ID
 * GET /api/ai/course/:courseId
 */
export const getAICourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await MultiAgentCourse.findById(courseId)
      .populate('studentId', 'name email')
      .populate('educatorId', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      course
    });

  } catch (error) {
    console.error(`❌ Error fetching AI course: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI course',
      error: error.message
    });
  }
};

/**
 * Update course status (for educator review actions)
 * PUT /api/ai/course/:courseId/status
 */
export const updateCourseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status, educatorId } = req.body;

    // Validate status
    const validStatuses = ['Generating', 'PendingEducatorReview', 'RevisionsRequested', 'Approved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Generating, PendingEducatorReview, RevisionsRequested, or Approved'
      });
    }

    const updateData = { status };
    if (educatorId) {
      updateData.educatorId = educatorId;
    }

    const updatedCourse = await MultiAgentCourse.findByIdAndUpdate(
      courseId,
      updateData,
      { new: true }
    ).populate('studentId', 'name email')
     .populate('educatorId', 'name email');

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // If status changed to PendingEducatorReview, notify via chat
    if (status === 'PendingEducatorReview') {
      const notificationChat = new CourseReviewChat({
        courseId: courseId,
        senderId: educatorId,
        senderModel: 'educator',
        message: `The course has been generated and is now ready for your review. Please examine the content and provide feedback through this chat.`
      });
      await notificationChat.save();
    }

    res.status(200).json({
      success: true,
      message: 'Course status updated successfully',
      course: updatedCourse
    });

  } catch (error) {
    console.error(`❌ Error updating course status: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update course status',
      error: error.message
    });
  }
};

/**
 * Get chat history for a course
 * GET /api/ai/course/:courseId/chat
 */
export const getCourseChat = async (req, res) => {
  try {
    const { courseId } = req.params;

    const chats = await CourseReviewChat.find({ courseId })
      .populate('senderId', 'name email')
      .sort({ timestamp: 1 }); // Oldest first

    res.status(200).json({
      success: true,
      chats
    });

  } catch (error) {
    console.error(`❌ Error fetching course chat: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course chat',
      error: error.message
    });
  }
};

/**
 * Get all AI courses for a student
 * GET /api/ai/my-courses
 */
export const getStudentAICourses = async (req, res) => {
  try {
    const studentId = req.userId; // From auth middleware

    const courses = await MultiAgentCourse.find({ studentId })
      .sort({ createdAt: -1 }) // Newest first
      .populate('studentId', 'name email')
      .populate('educatorId', 'name email');

    res.status(200).json({
      success: true,
      courses
    });

  } catch (error) {
    console.error(`❌ Error fetching student AI courses: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student AI courses',
      error: error.message
    });
  }
};

/**
 * Get all AI courses for educator review
 * GET /api/ai/all-courses
 */
export const getAllAICourses = async (req, res) => {
  try {
    const courses = await MultiAgentCourse.find({})
      .sort({ createdAt: -1 }) // Newest first
      .populate('studentId', 'name email')
      .populate('educatorId', 'name email');

    res.status(200).json({
      success: true,
      courses
    });

  } catch (error) {
    console.error(`❌ Error fetching all AI courses: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI courses',
      error: error.message
    });
  }
};
