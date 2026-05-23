import mongoose from "mongoose"
const schema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    emailid:{
        type:String,
        required:true,
        unique:true,
        }, 
    password:{
        type:String,
        required:true,
    },
    role: {
        type: String,
        enum: ["Candidate", "Recruiter", "Admin"],
        default: "Candidate",
    },
    resumeURL: { type: String, default: "" },
    resumeText: { type: String, default: "" },
    skills: [{ type: String }],
    bio: { type: String, default: "" },
    company: { type: String, default: "" },
    isVerified: { type: Boolean, default: false }, // NEW FIELD
    otp: { type: String }, // Store OTP temporarily
    otpExpires: { type: Date }, // Store OTP expiration time
    leetcodeUsername: { type: String, default: "" },
    gfgUsername: { type: String, default: "" },
    leetcodeScore: { type: Number, default: 0 },
    gfgScore: { type: Number, default: 0 },
    aceboardScore: { type: Number, default: 0 },
    },
    {timestamps:true}
)
const User=mongoose.model("users",schema);
export default User;