import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Pw_Reset from "../models/forgotpassword.js";
import calculateScore from "../utils/scraper.js";
import nodemailer from "nodemailer";
import dotenv from 'dotenv'; 
import path from "path";
import cloudinary from '../middleware/cloudinary.js';
dotenv.config(); 

const key=process.env.JWT_SECRET;

const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
  });
};

//register
export const register = async (req, res) => {
  try {
    const { username, emailid, password, role } = req.body;

    if (!username || !emailid || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ emailid });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      emailid,
      password: hashedPassword,
      role,
      isVerified: false,
    });

    const savedUser = await newUser.save();
    const userObject = savedUser.toObject();
    delete userObject.password;

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: userObject,
    });

  } catch (error) {
    console.error("Error in register:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};


export const sendOtpRegister = async (req, res) => {
  try {
    const {username, emailid, password, role, leetcodeUsername, gfgUsername } = req.body;

    if (!emailid || !username || !role || !password) {
      return res.status(400).json({ message: "Email, username, role, and password are required" });
    }

    let user = await User.findOne({ emailid });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: "User already registered. Please log in." });
      }

      user.otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      if (leetcodeUsername) user.leetcodeUsername = leetcodeUsername;
      if (gfgUsername) user.gfgUsername = gfgUsername;
      await user.save();
    } else {
      user = new User({
        emailid,
        username,
        password,
        role,
        isVerified: false,
        leetcodeUsername: leetcodeUsername || "",
        gfgUsername: gfgUsername || "",
        otp: Math.floor(100000 + Math.random() * 900000).toString(),
        otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      });
      await user.save();
    }

    const transporter = createTransporter();
    await transporter.sendMail({
      from: '"SmartHire" <ad6186001@smtp-brevo.com>',
      to: emailid,
      subject: 'User email verification',
      text: `Your One-Time Password (OTP) for email verification is: ${user.otp}.

This OTP is valid for 10 minutes. Please do not share it with anyone.

If you did not request this, please ignore this email.

Thank you,
SmartHire`,
    });

    return res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("Error in sendOtpRegister:", error);
    return res.status(500).json({ message: "Error sending OTP", details: error.message });
  }
};

export const VerifyRegister = async (req, res) => {
  try {
    const { otp } = req.body;
    const { emailid } = req.params;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const user = await User.findOne({ emailid });

    if (!user) {
      return res.status(400).json({ message: "User not found. Please register again." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified. Please login." });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.otpExpires) {
      await User.deleteOne({ emailid });
      return res.status(400).json({ message: "OTP expired. Please register again." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    if (user.role === "Candidate" && (user.leetcodeUsername || user.gfgUsername)) {
      console.log(`Scraping scores for ${user.leetcodeUsername} & ${user.gfgUsername}`);
      const { totalScore, leetcodeScore, gfgScore } = await calculateScore(user.leetcodeUsername, user.gfgUsername);
      user.leetcodeScore = leetcodeScore;
      user.gfgScore = gfgScore;
      user.aceboardScore = totalScore;
    }

    await user.save();

    return res.status(200).json({ 
      success: true,
      message: "User registered successfully. Please login to continue." 
    });

  } catch (error) {
    console.error("Error in VerifyRegister:", error);
    return res.status(500).json({ message: "Error verifying OTP", details: error.message });
  }
};

//login
export const login = async (req, res) => {
  try {
    const { emailid, password } = req.body;

    const currentUser = await User.findOne({ emailid });
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!currentUser.isVerified) {
      return res.status(401).json({ 
        success: false, 
        message: "Please verify your email first. Check your inbox for OTP." 
      });
    }

    const match = await bcrypt.compare(password, currentUser.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const userObject = currentUser.toObject();
    delete userObject.password;

    const token = jwt.sign(
      { id: currentUser._id, emailid: currentUser.emailid, role: currentUser.role },
      key,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userObject
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

//GET details
export const details=async(req,resp)=>{
    try {
        const emailid=req.user.emailid;
        const currentUser=await User.findOne({emailid:emailid});
        resp.json({username:currentUser.username});
    } catch (error) {
        console.log("there has been an error ", error);
        resp.status(500).json({message: "there has been an error"});
    }
}

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'profile_pics',
      public_id: req.user.id,
      overwrite: true,
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { image: result.secure_url },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ success: false, message: 'Image upload failed' });
  }
};

/* Send OTP */
export const sendOtp = async (req, res) => {
  try {
    const { emailid } = req.params;
    if (!emailid) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ emailid });
    if (!user) {
      return res.status(400).json({ message: "User does not exist!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await Pw_Reset.findOneAndUpdate(
      { emailid },
      { otp, expires },
      { upsert: true, new: true }
    );

    const transporter = createTransporter();
    await transporter.sendMail({
      from: '"SmartHire" <ad6186001@smtp-brevo.com>',
      to: emailid,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
    });

    return res.status(200).json({ message: "OTP sent successfully to your email." });

  } catch (error) {
    console.error("Error in sendOtp controller:", error);
    return res.status(500).json({ message: "Error generating OTP", details: error.message });
  }
};

/* Verify OTP */
export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const { emailid } = req.params;

    if (!emailid || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const record = await Pw_Reset.findOne({ emailid });

    if (!record) {
      return res.status(400).json({ success: false, message: "No OTP found for this email" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date(record.expires) < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    return res.status(200).json({ success: true, message: "OTP verified successfully" });

  } catch (error) {
    return res.status(500).json({ message: "Error verifying OTP", details: error.message });
  }
};

/* Reset Password */
export const resetPassword = async (req, res) => {
  try {
    const { emailid } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({ emailid });
    if (!user) {
      return res.status(400).json({ msg: "User does not exist!" });
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({ msg: "Password reset successfully." });

  } catch (error) {
    return res.status(500).json({ message: "Error resetting password", details: error.message });
  }
};