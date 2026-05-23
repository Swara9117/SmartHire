import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import toast from "react-hot-toast";

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "Remote",
    jobType: "Full-time",
    salary: "",
    description: "",
    requirements: "",
    skills: "",
    status: "open",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          requirements: form.requirements.split("\n").filter(Boolean),
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      toast.success("Job posted successfully!");
      navigate("/recruiter/dashboard");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const inputClass = "w-full p-3 bg-gray-700 rounded-lg border border-gray-600";

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-400 mb-8">Post a New Job</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 rounded-xl p-6">
          <input name="title" placeholder="Job Title" required className={inputClass} value={form.title} onChange={handleChange} />
          <input name="company" placeholder="Company" required className={inputClass} value={form.company} onChange={handleChange} />
          <input name="location" placeholder="Location" className={inputClass} value={form.location} onChange={handleChange} />
          <select name="jobType" className={inputClass} value={form.jobType} onChange={handleChange}>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Internship</option>
            <option>Contract</option>
          </select>
          <input name="salary" placeholder="Salary" className={inputClass} value={form.salary} onChange={handleChange} />
          <textarea name="description" placeholder="Job Description" required rows={5} className={inputClass} value={form.description} onChange={handleChange} />
          <textarea name="requirements" placeholder="Requirements (one per line)" rows={4} className={inputClass} value={form.requirements} onChange={handleChange} />
          <input name="skills" placeholder="Skills (comma separated)" className={inputClass} value={form.skills} onChange={handleChange} />
          <button type="submit" className="w-full py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 font-semibold">
            Post Job
          </button>
        </form>
      </div>
    </div>
  );
}
