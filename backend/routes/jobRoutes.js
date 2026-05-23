import express from "express";
import { verifyToken } from "../middleware/verify.js";
import { authorizeRoles } from "../middleware/authorize.js";
import {
  createJob,
  getMyJobs,
  updateJob,
  deleteJob,
  getAllOpenJobs,
  getJobById,
} from "../controller/jobController.js";

const router = express.Router();

router.get("/", getAllOpenJobs);
router.get("/recruiter/mine", verifyToken, authorizeRoles("Recruiter"), getMyJobs);
router.get("/:id", getJobById);

router.post("/", verifyToken, authorizeRoles("Recruiter"), createJob);
router.put("/:id", verifyToken, authorizeRoles("Recruiter"), updateJob);
router.delete("/:id", verifyToken, authorizeRoles("Recruiter"), deleteJob);

export default router;
