import User from "../models/user.js";
import Job from "../models/job.js";
import Application from "../models/application.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp").sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ["Candidate", "Recruiter", "Admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalCandidates, totalRecruiters, totalAdmins, totalJobs, openJobs, totalApplications, applicationsByStatus] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "Candidate" }),
        User.countDocuments({ role: "Recruiter" }),
        User.countDocuments({ role: "Admin" }),
        Job.countDocuments(),
        Job.countDocuments({ status: "open" }),
        Application.countDocuments(),
        Application.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
      ]);

    const recentUsers = await User.find()
      .select("username emailid role createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentJobs = await Job.find()
      .select("title company status createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      analytics: {
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalAdmins,
        totalJobs,
        openJobs,
        totalApplications,
        applicationsByStatus,
      },
      recentUsers,
      recentJobs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const seedAdmin = async (req, res) => {
  try {
    const { username, emailid, password, setupSecret } = req.body;
    if (setupSecret !== process.env.ADMIN_SETUP_SECRET) {
      return res.status(403).json({ message: "Invalid setup secret" });
    }

    const existing = await User.findOne({ emailid });
    if (existing) {
      existing.role = "Admin";
      existing.isVerified = true;
      await existing.save();
      return res.status(200).json({ message: "User promoted to Admin" });
    }

    const bcrypt = await import("bcrypt");
    const salt = await bcrypt.default.genSalt(10);
    const hashedPassword = await bcrypt.default.hash(password, salt);

    const admin = new User({
      username,
      emailid,
      password: hashedPassword,
      role: "Admin",
      isVerified: true,
    });
    await admin.save();
    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
