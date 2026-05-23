import Job from "../models/job.js";
import User from "../models/user.js";
import Application from "../models/application.js";
import { getJobRecommendations } from "../services/geminiService.js";

export const getAIJobRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "Candidate") {
      return res.status(403).json({ message: "Only candidates can get recommendations" });
    }

    const appliedJobIds = (
      await Application.find({ candidate: req.user.id }).select("job")
    ).map((a) => a.job.toString());

    const openJobs = await Job.find({
      status: "open",
      _id: { $nin: appliedJobIds },
    }).limit(30);

    if (openJobs.length === 0) {
      return res.status(200).json({ recommendations: [], message: "No open jobs available" });
    }

    const profile = {
      username: user.username,
      skills: user.skills || [],
      bio: user.bio || "",
      leetcodeScore: user.leetcodeScore,
      gfgScore: user.gfgScore,
      resumeText: user.resumeText ? user.resumeText.slice(0, 2000) : "",
    };

    const recommendations = await getJobRecommendations(profile, openJobs);
    res.status(200).json({ recommendations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
