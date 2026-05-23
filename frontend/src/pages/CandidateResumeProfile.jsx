import React, { useState } from "react";
import { apiFetch, apiUpload } from "../utils/api";
import toast from "react-hot-toast";

export default function CandidateResumeProfile() {
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Select a PDF resume");
    const formData = new FormData();
    formData.append("resume", file);
    setLoading(true);
    try {
      await apiUpload("/api/profile/resume", formData);
      toast.success("Resume uploaded to profile!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/api/profile/details", {
        method: "PUT",
        body: JSON.stringify({
          bio,
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-indigo-400">Profile & Resume</h1>

        <form onSubmit={handleResumeUpload} className="bg-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Upload Resume (PDF)</h2>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-gray-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Resume"}
          </button>
        </form>

        <form onSubmit={handleProfileUpdate} className="bg-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Skills & Bio</h2>
          <textarea
            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
            rows={3}
            placeholder="Short bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <input
            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
            placeholder="Skills (comma separated, e.g. React, Node.js, Python)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
          <button type="submit" className="w-full py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700">
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}
