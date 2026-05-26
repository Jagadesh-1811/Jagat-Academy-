import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { createAssignment, gradeAssignment, deleteAssignment, getCourseAssignments } from "../controllers/assignmentController.js";

const router = express.Router();

router.route("/create/:courseId").post(isAuth, createAssignment);
router.route("/grade/:assignmentId").post(isAuth, gradeAssignment);
router.route("/delete/:assignmentId").delete(isAuth, deleteAssignment);
router.route("/course/:courseId").get(getCourseAssignments);

export default router;