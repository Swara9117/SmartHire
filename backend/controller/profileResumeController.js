import fs from "fs";
import User from "../models/user.js";
import upload from "../utils/multerConfig.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { createNotification } from "./notificationController.js";

export const uploadResumeMiddleware = upload.single("resume");

export const uploadProfileResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume PDF is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const pdfBuffer = fs.readFileSync(req.file.path);
    const resumeText = await extractTextFromPDF(pdfBuffer);
    user.resumeText = resumeText;
    user.resumeURL = `/uploads/${req.file.filename}`;
    await user.save();

    await createNotification(user._id, "Resume uploaded to your profile successfully!");

    res.status(200).json({
      success: true,
      message: "Resume uploaded",
      resumeURL: user.resumeURL,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCandidateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { bio, skills, company } = req.body;
    if (bio !== undefined) user.bio = bio;
    if (company !== undefined) user.company = company;
    if (skills !== undefined) {
      user.skills = Array.isArray(skills)
        ? skills
        : skills.split(",").map((s) => s.trim()).filter(Boolean);
    }
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
