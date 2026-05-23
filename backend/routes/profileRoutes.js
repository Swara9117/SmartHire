import express from "express";
import { verifyToken } from "../middleware/verify.js";
import { authorizeRoles } from "../middleware/authorize.js";
import {
  uploadProfileResume,
  uploadResumeMiddleware,
  updateCandidateProfile,
} from "../controller/profileResumeController.js";

const router = express.Router();

router.post(
  "/resume",
  verifyToken,
  authorizeRoles("Candidate"),
  uploadResumeMiddleware,
  uploadProfileResume
);
router.put(
  "/details",
  verifyToken,
  authorizeRoles("Candidate", "Recruiter"),
  updateCandidateProfile
);

export default router;
