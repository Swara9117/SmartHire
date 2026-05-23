import Job from "../models/job.js";
import Application from "../models/application.js";

export const createJob = async (req, res) => {
  try {
    const job = new Job({ ...req.body, recruiter: req.user.id });
    await job.save();
    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiter: req.user.id });
    if (!job) return res.status(404).json({ message: "Job not found" });
    Object.assign(job, req.body);
    await job.save();
    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, recruiter: req.user.id });
    if (!job) return res.status(404).json({ message: "Job not found" });
    await Application.deleteMany({ job: job._id });
    res.status(200).json({ message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOpenJobs = async (req, res) => {
  try {
    const { search, location, jobType } = req.query;
    const filter = { status: "open" };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }
    if (location) filter.location = { $regex: location, $options: "i" };
    if (jobType) filter.jobType = jobType;

    const jobs = await Job.find(filter)
      .populate("recruiter", "username emailid company")
      .sort({ createdAt: -1 });
    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "recruiter",
      "username emailid company"
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json({ job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
