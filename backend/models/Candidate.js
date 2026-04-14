import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    emailid: {
        type: String,
        required: true,
        unique: true,
    },
    leetcodeUsername: {
        type: String,
        required: true,
    },
    gfgUsername: {
        type: String,
        required: true,
    },
    leetcodeScore: {
        type: Number,
        default: 0,
    },
    gfgScore: {
        type: Number,
        default: 0,
    },
    aceboardScore: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

const Candidate = mongoose.model("Candidate", candidateSchema);

export default Candidate;
