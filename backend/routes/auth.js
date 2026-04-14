import express from "express";
import { register } from "../controller/authControllers.js";
import { login } from "../controller/authControllers.js";
import { verifyToken } from "../middleware/verify.js";
import { uploadProfileImage } from "../controller/authControllers.js";
import { sendOtp, verifyOtp, resetPassword } from "../controller/authControllers.js";
import { sendOtpRegister, VerifyRegister } from "../controller/authControllers.js";
import multer from "multer";
import path from "path";
const router=express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'backend/uploaded/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, req.user.id + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post("/register", register);
router.post("/login" , login);
router.post("/upload-image", verifyToken, uploadProfileImage);

router.post("/send-otp/:emailid", sendOtp);
router.post("/verify-otp/:emailid", verifyOtp);
router.post("/reset-password/:emailid", resetPassword);
router.post("/sendOtp-register", sendOtpRegister);
router.post("/verify-register/:emailid", VerifyRegister);


export default router;