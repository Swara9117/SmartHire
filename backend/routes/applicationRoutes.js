import express from "express";
import { verifyToken } from "../middleware/verify.js";
import { authorizeRoles } from "../middleware/authorize.js";
import {
  applyForJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
  getRecruiterApplications,
} from "../controller/applicationController.js";

const router = express.Router();

router.post("/apply", verifyToken, authorizeRoles("Candidate"), applyForJob);
router.get("/my", verifyToken, authorizeRoles("Candidate"), getMyApplications);

router.get(
  "/recruiter/all",
  verifyToken,
  authorizeRoles("Recruiter"),
  getRecruiterApplications
);
router.get(
  "/job/:jobId",
  verifyToken,
  authorizeRoles("Recruiter"),
  getApplicantsForJob
);
router.patch(
  "/:id/status",
  verifyToken,
  authorizeRoles("Recruiter"),
  updateApplicationStatus
);

export default router;
