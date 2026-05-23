import Application from "../models/application.js";
import Job from "../models/job.js";
import User from "../models/user.js";
import { createNotification } from "./notificationController.js";

export const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    const job = await Job.findById(jobId);
    if (!job || job.status !== "open") {
      return res.status(404).json({ message: "Job not available" });
    }

    const existing = await Application.findOne({
      job: jobId,
      candidate: req.user.id,
    });
    if (existing) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    const candidate = await User.findById(req.user.id);
    const application = new Application({
      job: jobId,
      candidate: req.user.id,
      coverLetter: coverLetter || "",
      resumeURL: candidate.resumeURL || "",
    });
    await application.save();

    await createNotification(
      job.recruiter,
      `${candidate.username} applied for ${job.title}`
    );

    res.status(201).json({ success: true, application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already applied" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate("job")
      .sort({ createdAt: -1 });
    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getApplicantsForJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, recruiter: req.user.id });
    if (!job) return res.status(404).json({ message: "Job not found" });

    const applications = await Application.find({ job: req.params.jobId })
      .populate("candidate", "username emailid skills resumeURL leetcodeScore gfgScore aceboardScore bio")
      .sort({ createdAt: -1 });
    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["applied", "shortlisted", "rejected", "hired"];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(req.params.id).populate("job");
    if (!application) return res.status(404).json({ message: "Application not found" });

    const job = await Job.findOne({
      _id: application.job._id,
      recruiter: req.user.id,
    });
    if (!job) return res.status(403).json({ message: "Not authorized" });

    application.status = status;
    await application.save();

    await createNotification(
      application.candidate,
      `Your application for ${job.title} is now: ${status}`
    );

    res.status(200).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecruiterApplications = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id }).select("_id");
    const jobIds = jobs.map((j) => j._id);
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("job", "title company")
      .populate("candidate", "username emailid skills resumeURL")
      .sort({ createdAt: -1 });
    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
