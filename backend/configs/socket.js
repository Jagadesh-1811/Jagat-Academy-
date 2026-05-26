import { Server } from 'socket.io';
import Course from '../models/courseModel.js';

let io = null;
const userSockets = new Map(); // Maps userId -> Array of Socket IDs (handles multiple tabs)

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:5173',
        'https://jagat-acadamey-1-1.onrender.com'
      ],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Client sends user ID to register their socket session
    socket.on('register', (userId) => {
      if (userId) {
        const userIdStr = String(userId);
        if (!userSockets.has(userIdStr)) {
          userSockets.set(userIdStr, []);
        }
        const activeSockets = userSockets.get(userIdStr);
        if (!activeSockets.includes(socket.id)) {
          activeSockets.push(socket.id);
        }
        socket.userId = userIdStr;
        // console.log(`🔌 Socket registered for user: ${userIdStr} (Socket ID: ${socket.id})`);
      }
    });

    socket.on('join-course-discussion', async ({ courseId }) => {
      try {
        if (!socket.userId || !courseId) return;

        const course = await Course.findById(courseId).select('creator enrolledStudents');
        if (!course) {
          socket.emit('course-discussion:error', { message: 'Course not found' });
          return;
        }

        const userIdStr = String(socket.userId);
        const isCreator = course.creator?.toString() === userIdStr;
        const isEnrolled = (course.enrolledStudents || []).some((studentId) => studentId.toString() === userIdStr);

        if (!isCreator && !isEnrolled) {
          socket.emit('course-discussion:error', { message: 'Not authorized to join this discussion' });
          return;
        }

        const roomId = `course-discussion:${courseId}`;
        socket.join(roomId);
        socket.emit('course-discussion:joined', { courseId });
      } catch (error) {
        socket.emit('course-discussion:error', { message: error.message });
      }
    });

    socket.on('leave-course-discussion', ({ courseId }) => {
      if (!courseId) return;
      socket.leave(`course-discussion:${courseId}`);
    });

    socket.on('disconnect', () => {
      if (socket.userId && userSockets.has(socket.userId)) {
        const activeSockets = userSockets.get(socket.userId);
        const index = activeSockets.indexOf(socket.id);
        if (index !== -1) {
          activeSockets.splice(index, 1);
        }
        if (activeSockets.length === 0) {
          userSockets.delete(socket.userId);
        }
        // console.log(`🔌 Socket disconnected for user: ${socket.userId}`);
      }
    });
  });

  console.log('⚡ Socket.io real-time engine initialized.');
  return io;
};

export const getIO = () => {
  return io;
};

/**
 * Send real-time events directly to all active connections/tabs of a specific user
 */
export const emitUserEvent = (userId, eventName, payload) => {
  if (!io) return false;
  const userIdStr = String(userId);
  const activeSockets = userSockets.get(userIdStr);
  if (activeSockets && activeSockets.length > 0) {
    activeSockets.forEach((socketId) => {
      io.to(socketId).emit(eventName, payload);
    });
    return true;
  }
  return false;
};

export const emitCourseDiscussionMessage = (courseId, payload) => {
  if (!io || !courseId) return false;
  io.to(`course-discussion:${courseId}`).emit('course-discussion:message', payload);
  return true;
};
