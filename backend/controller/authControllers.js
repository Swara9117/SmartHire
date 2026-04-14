import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Pw_Reset from "../models/forgotpassword.js";
import nodemailer from "nodemailer";
import dotenv from 'dotenv'; 
import path from "path";
import cloudinary from '../middleware/cloudinary.js';
dotenv.config(); 

const key=process.env.JWT_SECRET;

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
    const {username, emailid, password, role } = req.body;

    if (!emailid || !username || !role || !password) {
      return res.status(400).json({ message: "Email, username, role, and password are required" });
    }

    let user = await User.findOne({ emailid });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: "User already registered. Please log in." });
      }

      // If user exists but is not verified, update OTP
      user.otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
    } else {
      // Create new user with all fields
      user = new User({
        emailid,
        username,
        password, // Will be hashed after OTP verification
        role,
        isVerified: false,
        otp: Math.floor(100000 + Math.random() * 900000).toString(),
        otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      });
      await user.save();
    }

    // Configure Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify Email Server
    await transporter.verify();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: emailid,
      subject: "User email verification",
      text: `Your One-Time Password (OTP) for email verification is: ${user.otp}.

This OTP is valid for 10 minutes. Please do not share it with anyone.

If you did not request this, please ignore this email.

Thank you,  
NextHire`,
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

    // Hash password and mark user as verified
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

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

    // Check if user is verified
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
      { id: currentUser._id, emailid: currentUser.emailid },
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
        resp.status(500).js({message: "there has been an error oopsie poopsie"});
    }
}

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    // Get the file from req.file (if using multer memoryStorage) or req.body (if base64)
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'profile_pics',
      public_id: req.user.id,
      overwrite: true,
    });

    // Save the Cloudinary URL in the user model
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
    const expires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

    await Pw_Reset.findOneAndUpdate(
      { emailid },
      { otp, expires },
      { upsert: true, new: true }
    );

    // Check if email credentials are set in .env
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Configure and send email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.verify(); // Verify connection

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: emailid,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
      });

      return res.status(200).json({ message: "OTP sent successfully to your email." });
    } else {
      // If no email credentials, log OTP to console for testing
      console.log("************************************************************");
      console.log("**** EMAIL_USER or EMAIL_PASS not set in .env file.     ****");
      console.log(`**** OTP for ${emailid} is: ${otp}                      ****`);
      console.log("************************************************************");
      return res.status(200).json({ message: "OTP generated for testing. Check backend console." });
    }

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

    // Fetch OTP Record
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

