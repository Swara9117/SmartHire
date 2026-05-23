import express from "express";
import { verifyToken } from "../middleware/verify.js";
import { authorizeRoles } from "../middleware/authorize.js";
import { getAIJobRecommendations } from "../controller/recommendationController.js";

const router = express.Router();

router.get(
  "/jobs",
  verifyToken,
  authorizeRoles("Candidate"),
  getAIJobRecommendations
);

export default router;
