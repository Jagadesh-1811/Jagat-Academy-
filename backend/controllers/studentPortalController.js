import User from '../models/userModel.js';
import Attendance from '../models/attendanceModel.js';
import Progress from '../models/progressModel.js';
import Order from '../models/orderModel.js';

// 1. Get Parent Portal settings and lists for Student
export const getStudentParentPortal = async (req, res) => {
  try {
    const studentId = req.userId;
    const student = await User.findById(studentId)
      .populate('parents', 'name email photoUrl')
      .populate('pendingParentLinks.parentId', 'name email');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Ensure linkingCode exists (if not, generate and save it)
    if (!student.linkingCode) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = 'JAGT-STU-';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      student.linkingCode = code;
      await student.save();
    }

    return res.status(200).json({
      success: true,
      linkingCode: student.linkingCode,
      age: student.age || 18,
      parents: student.parents,
      pendingRequests: student.pendingParentLinks,
      parentAccessControls: student.parentAccessControls || {
        showGrades: true,
        showAttendance: true,
        showAnalytics: true,
        showAssignments: true
      }
    });
  } catch (error) {
    console.error('getStudentParentPortal error:', error);
    return res.status(500).json({ message: `Failed to load parent portal details: ${error.message}` });
  }
};

// 2. Approve Pending Parent Link
export const approveParent = async (req, res) => {
  try {
    const studentId = req.userId;
    const { parentId } = req.body;

    if (!parentId) {
      return res.status(400).json({ message: 'Parent ID is required' });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if parent request exists in pendingParentLinks
    const requestIndex = student.pendingParentLinks.findIndex(
      (req) => req.parentId.toString() === parentId.toString()
    );

    if (requestIndex === -1) {
      return res.status(400).json({ message: 'No pending linking request found for this parent.' });
    }

    // Remove from pending
    student.pendingParentLinks.splice(requestIndex, 1);

    // Add to parents list if not already there
    if (!student.parents.includes(parentId)) {
      student.parents.push(parentId);
    }
    await student.save();

    // Update parent's students list
    const parent = await User.findById(parentId);
    if (parent) {
      if (!parent.students.includes(studentId)) {
        parent.students.push(studentId);
        await parent.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Parent linked successfully.'
    });
  } catch (error) {
    console.error('approveParent error:', error);
    return res.status(500).json({ message: `Approval failed: ${error.message}` });
  }
};

// 3. Reject Pending Parent Link
export const rejectParent = async (req, res) => {
  try {
    const studentId = req.userId;
    const { parentId } = req.body;

    if (!parentId) {
      return res.status(400).json({ message: 'Parent ID is required' });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Remove from pending
    student.pendingParentLinks = student.pendingParentLinks.filter(
      (req) => req.parentId.toString() !== parentId.toString()
    );
    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Parent linking request rejected.'
    });
  } catch (error) {
    console.error('rejectParent error:', error);
    return res.status(500).json({ message: `Rejection failed: ${error.message}` });
  }
};

// 4. Update Parent Privacy Permissions
export const updateParentPrivacy = async (req, res) => {
  try {
    const studentId = req.userId;
    const { showGrades, showAttendance, showAnalytics, showAssignments, age } = req.body;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (showGrades !== undefined) student.parentAccessControls.showGrades = showGrades;
    if (showAttendance !== undefined) student.parentAccessControls.showAttendance = showAttendance;
    if (showAnalytics !== undefined) student.parentAccessControls.showAnalytics = showAnalytics;
    if (showAssignments !== undefined) student.parentAccessControls.showAssignments = showAssignments;
    if (age !== undefined) student.age = age;

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Privacy settings updated successfully.',
      parentAccessControls: student.parentAccessControls,
      age: student.age
    });
  } catch (error) {
    console.error('updateParentPrivacy error:', error);
    return res.status(500).json({ message: `Update failed: ${error.message}` });
  }
};

// 5. Get Student Dashboard Activities
export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.userId;
    const student = await User.findById(studentId).populate('enrolledCourses', 'title');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Fetch real recent activities
    const [attendances, progresses, orders] = await Promise.all([
      Attendance.find({ student: studentId }).sort({ checkInTime: -1 }).limit(5).populate('course', 'title'),
      Progress.find({ student: studentId }).sort({ lastUpdated: -1 }).limit(5).populate('course', 'title'),
      Order.find({ student: studentId }).sort({ createdAt: -1 }).limit(5).populate('course', 'title')
    ]);

    let recentActivities = [];

    attendances.forEach(a => {
       recentActivities.push({
          id: `att_${a._id}`,
          type: 'attendance',
          description: `Marked ${a.status} for session`,
          courseName: a.course?.title || 'Unknown Course',
          date: a.checkInTime
       });
    });

    progresses.forEach(p => {
       recentActivities.push({
          id: `prog_${p._id}`,
          type: 'lecture',
          description: `Progress updated`,
          courseName: p.course?.title || 'Unknown Course',
          date: p.lastUpdated || p.updatedAt
       });
    });

    orders.forEach(o => {
       if (o.paymentStatus === 'completed') {
          recentActivities.push({
             id: `ord_${o._id}`,
             type: 'course',
             description: `Enrolled in course`,
             courseName: o.course?.title || 'Unknown Course',
             date: o.createdAt
          });
       }
    });

    // Sort by date descending
    recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    recentActivities = recentActivities.slice(0, 10);

    return res.status(200).json({
      success: true,
      recentActivities,
      enrolledCourses: student.enrolledCourses
    });
  } catch (error) {
    console.error('getStudentDashboard error:', error);
    return res.status(500).json({ message: `Failed to fetch dashboard data: ${error.message}` });
  }
};
