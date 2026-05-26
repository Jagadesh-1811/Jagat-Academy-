import User from '../models/userModel.js';
import Course from '../models/courseModel.js';
import Attendance from '../models/attendanceModel.js';
import Grade from '../models/gradeModel.js';
import Progress from '../models/progressModel.js';
import Order from '../models/orderModel.js';
import { Assignment } from '../models/assignmentModel.js';
import { Conversation, Message } from '../models/chatModel.js';
import { genToken } from '../configs/token.js';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import crypto from 'crypto';
import sendMail, { sendVerificationEmail } from '../configs/Mail.js';

// 1. Parent Registration
export const registerParent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    let existUser = await User.findOne({ email: email.toLowerCase() });
    if (existUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash password and create parent user with verification token (email link)
    const hashPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const parent = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashPassword,
      role: 'parent',
      emailVerified: false,
      verificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    // Send verification link to parent email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    await sendVerificationEmail(parent.email, verificationToken, frontendUrl, 'parent');

    const token = await genToken(parent._id);
    return res.status(201).json({
      success: true,
      message: 'Parent registered successfully. Please verify your email.',
      user: {
        _id: parent._id,
        name: parent.name,
        email: parent.email,
        role: parent.role,
        emailVerified: parent.emailVerified
      },
      token
    });
  } catch (error) {
    console.error('registerParent error:', error);
    return res.status(500).json({ message: `Registration failed: ${error.message}` });
  }
};

// 2. Parent OTP Email Verification
export const verifyParentEmail = async (req, res) => {
  try {
    // Accept either token (from link) or legacy numeric code for compatibility
    const { email, token, code } = req.body;

    if (!email || (!token && !code)) {
      return res.status(400).json({ message: 'Email and verification token/code are required' });
    }

    const query = {
      email: email.toLowerCase(),
      verificationTokenExpires: { $gt: Date.now() }
    };

    if (token) query.verificationToken = token;
    else query.verificationToken = code;

    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Link Firebase if firebaseUid exists
    if (user.firebaseUid) {
      try {
        const admin = (await import("../utils/firebaseAdmin.js")).default;
        if (admin) {
          await admin.auth().updateUser(user.firebaseUid, { emailVerified: true });
          console.log(`✅ Firebase user emailVerified set to true for parent: ${user.email}`);
        }
      } catch (fbError) {
        console.error("❌ Failed to update Firebase emailVerified status for parent:", fbError);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully!'
    });
  } catch (error) {
    console.error('verifyParentEmail error:', error);
    return res.status(500).json({ message: `Verification failed: ${error.message}` });
  }
};

// 3. Parent Login
export const loginParent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const parent = await User.findOne({ email: email.toLowerCase() });
    if (!parent) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    if (parent.role !== 'parent') {
      return res.status(403).json({ message: 'This account is not registered as a parent' });
    }

    const isMatch = await bcrypt.compare(password, parent.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = await genToken(parent._id);
    return res.status(200).json({
      success: true,
      user: {
        _id: parent._id,
        name: parent.name,
        email: parent.email,
        role: parent.role,
        emailVerified: parent.emailVerified
      },
      token
    });
  } catch (error) {
    console.error('loginParent error:', error);
    return res.status(500).json({ message: `Login failed: ${error.message}` });
  }
};

// 4. Link Student Account
export const linkStudent = async (req, res) => {
  try {
    const { studentEmailOrCode } = req.body;
    const parentId = req.userId;

    if (!studentEmailOrCode) {
      return res.status(400).json({ message: 'Student email or linking code is required' });
    }

    // Find student by code or email
    const student = await User.findOne({
      $or: [
        { email: studentEmailOrCode.toLowerCase() },
        { linkingCode: studentEmailOrCode.trim() }
      ]
    });

    if (!student) {
      return res.status(404).json({ message: 'No student account found with these details.' });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ message: 'The specified account is not registered as a student.' });
    }

    // Check if already linked
    const parent = await User.findById(parentId);
    if (parent.students.includes(student._id)) {
      return res.status(400).json({ message: 'This student account is already linked to your dashboard.' });
    }

    // Auto Approve linking for all student profiles immediately
    parent.students.push(student._id);
    await parent.save();

    if (!student.parents.includes(parentId)) {
      student.parents.push(parentId);
      await student.save();
    }

    return res.status(200).json({
      success: true,
      status: 'linked',
      message: `Student account ${student.name} linked successfully.`
    });
  } catch (error) {
    console.error('linkStudent error:', error);
    return res.status(500).json({ message: `Failed to link student: ${error.message}` });
  }
};

// 5. Get Linked Students
export const getLinkedStudents = async (req, res) => {
  try {
    const parentId = req.userId;
    const parent = await User.findById(parentId).populate({
      path: 'students',
      select: 'name email photoUrl enrolledCourses age parentAccessControls',
      populate: {
        path: 'enrolledCourses',
        select: 'title price lectures creator'
      }
    });

    if (!parent) {
      return res.status(404).json({ message: 'Parent account not found' });
    }

    return res.status(200).json({
      success: true,
      students: parent.students
    });
  } catch (error) {
    console.error('getLinkedStudents error:', error);
    return res.status(500).json({ message: `Failed to retrieve linked students: ${error.message}` });
  }
};

// Helper: Ensure student is linked to parent
const confirmLink = async (parentId, studentId) => {
  const parent = await User.findById(parentId);
  return parent && parent.students.includes(studentId);
};

// 6. Get Student Progress
export const getStudentProgress = async (req, res) => {
  try {
    const { id: studentId } = req.params;
    const parentId = req.userId;

    if (!(await confirmLink(parentId, studentId))) {
      return res.status(403).json({ message: 'Unauthorized access to student analytics.' });
    }

    const student = await User.findById(studentId);
    if (!student.parentAccessControls.showAnalytics) {
      return res.status(200).json({
        success: true,
        privacyBlocked: true,
        message: 'Student has disabled visibility for analytics/progress.'
      });
    }

    // Get Progress details
    const progressRecords = await Progress.find({ student: studentId })
      .populate('course', 'title category level')
      .populate('completedLectures', 'lectureTitle');

    return res.status(200).json({
      success: true,
      privacyBlocked: false,
      progress: progressRecords
    });
  } catch (error) {
    console.error('getStudentProgress error:', error);
    return res.status(500).json({ message: `Failed to fetch progress: ${error.message}` });
  }
};

// 7. Get Student Grades
export const getStudentGrades = async (req, res) => {
  try {
    const { id: studentId } = req.params;
    const parentId = req.userId;

    if (!(await confirmLink(parentId, studentId))) {
      return res.status(403).json({ message: 'Unauthorized access to student grades.' });
    }

    const student = await User.findById(studentId);
    if (!student.parentAccessControls.showGrades) {
      return res.status(200).json({
        success: true,
        privacyBlocked: true,
        message: 'Student has disabled visibility for grades.'
      });
    }

    // Fetch grades
    const grades = await Grade.find({ student: studentId })
      .populate({
        path: 'submission',
        populate: { path: 'assignment', select: 'title' }
      });

    return res.status(200).json({
      success: true,
      privacyBlocked: false,
      grades
    });
  } catch (error) {
    console.error('getStudentGrades error:', error);
    return res.status(500).json({ message: `Failed to fetch grades: ${error.message}` });
  }
};

// 8. Get Student Attendance
export const getStudentAttendance = async (req, res) => {
  try {
    const { id: studentId } = req.params;
    const parentId = req.userId;

    if (!(await confirmLink(parentId, studentId))) {
      return res.status(403).json({ message: 'Unauthorized access to student attendance.' });
    }

    const student = await User.findById(studentId);
    if (!student.parentAccessControls.showAttendance) {
      return res.status(200).json({
        success: true,
        privacyBlocked: true,
        message: 'Student has disabled visibility for attendance logs.'
      });
    }

    // Get attendance records
    const records = await Attendance.find({ student: studentId })
      .populate('course', 'title')
      .populate('lecture', 'lectureTitle')
      .sort({ checkInTime: -1 });

    // Group rates by course
    const courseRates = {};
    for (const record of records) {
      if (!record.course) continue;
      const cId = record.course._id.toString();
      if (!courseRates[cId]) {
        const courseObj = await Course.findById(cId);
        courseRates[cId] = {
          courseTitle: courseObj?.title || 'Unknown Course',
          totalLectures: courseObj?.lectures?.length || 1,
          presentCount: 0,
          records: []
        };
      }
      courseRates[cId].records.push(record);
      if (record.status === 'present' || record.status === 'late') {
        courseRates[cId].presentCount++;
      }
    }

    const attendanceSummary = Object.entries(courseRates).map(([courseId, stats]) => ({
      courseId,
      courseTitle: stats.courseTitle,
      attendanceRate: Math.round((stats.presentCount / Math.max(stats.totalLectures, 1)) * 100),
      presentCount: stats.presentCount,
      totalSessions: stats.totalLectures,
      records: stats.records
    }));

    return res.status(200).json({
      success: true,
      privacyBlocked: false,
      records,
      summary: attendanceSummary
    });
  } catch (error) {
    console.error('getStudentAttendance error:', error);
    return res.status(500).json({ message: `Failed to fetch attendance: ${error.message}` });
  }
};

// 9. Get Student Upcoming Assignments
export const getStudentAssignments = async (req, res) => {
  try {
    const { id: studentId } = req.params;
    const parentId = req.userId;

    if (!(await confirmLink(parentId, studentId))) {
      return res.status(403).json({ message: 'Unauthorized access to student assignments.' });
    }

    const student = await User.findById(studentId);
    if (!student.parentAccessControls.showAssignments) {
      return res.status(200).json({
        success: true,
        privacyBlocked: true,
        message: 'Student has disabled visibility for assignments.'
      });
    }

    // Get active assignments of student's enrolled courses
    const assignments = await Assignment.find({
      course: { $in: student.enrolledCourses },
      deadline: { $gte: new Date() }
    }).populate('course', 'title').sort({ deadline: 1 });

    return res.status(200).json({
      success: true,
      privacyBlocked: false,
      assignments
    });
  } catch (error) {
    console.error('getStudentAssignments error:', error);
    return res.status(500).json({ message: `Failed to fetch assignments: ${error.message}` });
  }
};

// 10. Get Student Billing / Invoices History
export const getStudentOrders = async (req, res) => {
  try {
    const { id: studentId } = req.params;
    const parentId = req.userId;

    if (!(await confirmLink(parentId, studentId))) {
      return res.status(403).json({ message: 'Unauthorized access to student billing.' });
    }

    // We fetch completed orders using existing Order model for this student
    const orders = await Order.find({ student: studentId, paymentStatus: 'completed' })
      .populate('course', 'title price')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('getStudentOrders error:', error);
    return res.status(500).json({ message: `Failed to fetch orders: ${error.message}` });
  }
};

// 11. Message Educator
export const messageEducator = async (req, res) => {
  try {
    const { educatorId, courseId, messageText } = req.body;
    const parentId = req.userId;

    if (!educatorId || !courseId || !messageText) {
      return res.status(400).json({ message: 'Educator ID, Course ID, and message text are required.' });
    }

    // Check if parent has a linked student enrolled in this course to establish link validity
    const parent = await User.findById(parentId).populate('students', 'enrolledCourses');
    const isAuthorizedChat = parent.students.some((stu) =>
      stu.enrolledCourses.map(id => id.toString()).includes(courseId.toString())
    );

    if (!isAuthorizedChat) {
      return res.status(403).json({ message: 'You can only message educators of courses your students are actively enrolled in.' });
    }

    // Find or create direct parent-educator conversation
    // To distinguish parent conversations, we map parent to the 'student' field but specify roles
    let conversation = await Conversation.findOne({
      student: parentId,
      educator: educatorId,
      course: courseId
    });

    if (!conversation) {
      conversation = await Conversation.create({
        student: parentId, // Mapping parent to student field for messaging schema reuse
        educator: educatorId,
        course: courseId,
        lastMessage: messageText,
        lastMessageAt: new Date(),
        unreadEducator: 1
      });
    } else {
      conversation.lastMessage = messageText;
      conversation.lastMessageAt = new Date();
      conversation.unreadEducator += 1;
      await conversation.save();
    }

    // Add individual Message
    const newMessage = await Message.create({
      conversation: conversation._id,
      sender: parentId,
      senderRole: 'parent',
      message: messageText
    });

    return res.status(201).json({
      success: true,
      conversation,
      message: newMessage
    });
  } catch (error) {
    console.error('messageEducator error:', error);
    return res.status(500).json({ message: `Failed to send message: ${error.message}` });
  }
};

// 12. Get Active Conversations
export const getConversations = async (req, res) => {
  try {
    const parentId = req.userId;
    const conversations = await Conversation.find({ student: parentId })
      .populate('educator', 'name email')
      .populate('course', 'title')
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('getConversations error:', error);
    return res.status(500).json({ message: `Failed to fetch conversations: ${error.message}` });
  }
};
