import express from "express";
import { signupCandidate, updateCandidate, getCandidateInfo, getLeaderboards } from "../controller/candidateController.js";

const router = express.Router();

router.post("/signup", signupCandidate);
router.put("/profile/:emailid", updateCandidate);
router.get("/profile/:emailid", getCandidateInfo);
router.get("/leaderboards", getLeaderboards);

export default router;
