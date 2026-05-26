import express from "express";
import { searchWithAi, askDoubt } from "../controllers/aiController.js";
import {
  generateAICourse,
  getAICourseById,
  updateCourseStatus,
  getCourseChat,
  getStudentAICourses,
  getAllAICourses
} from "../controllers/multiAgentCourseController.js";
import isAuth from "../middlewares/isAuth.js";

let aiRouter = express.Router()

// Existing AI search route
aiRouter.post("/search",searchWithAi)

// AI Doubt Assistant
aiRouter.post("/doubt", isAuth, askDoubt)

// Multi-Agent AI Course Generation routes
// Place specific routes before parameterized routes
aiRouter.post("/course/generate", isAuth, generateAICourse)
aiRouter.get("/my-courses", isAuth, getStudentAICourses)
aiRouter.get("/all-courses", isAuth, getAllAICourses)
aiRouter.get("/course/:courseId", isAuth, getAICourseById)
aiRouter.put("/course/:courseId/status", isAuth, updateCourseStatus)
aiRouter.get("/course/:courseId/chat", isAuth, getCourseChat)

export default aiRouter
