import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";
import toast from "react-hot-toast";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/jobs/${id}`)
      .then((data) => setJob(data.job))
      .catch(() => toast.error("Failed to load job"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!isLoggedIn) {
      navigate("/signin");
      return;
    }
    if (user?.role !== "Candidate") {
      toast.error("Only candidates can apply for jobs");
      return;
    }
    try {
      await apiFetch("/api/applications/apply", {
        method: "POST",
        body: JSON.stringify({ jobId: id, coverLetter }),
      });
      toast.success("Application submitted!");
      navigate("/my-applications");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-12">Loading...</div>;
  if (!job) return <div className="min-h-screen bg-gray-900 text-white p-12">Job not found</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/jobs")} className="text-indigo-400 mb-6 hover:underline">
          ← Back to Jobs
        </button>
        <h1 className="text-3xl font-bold text-indigo-400">{job.title}</h1>
        <p className="text-xl text-gray-300 mt-2">{job.company}</p>
        <p className="text-gray-400 mt-1">{job.location} · {job.jobType} · {job.salary}</p>
        <div className="mt-6 bg-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-gray-300 whitespace-pre-wrap">{job.description}</p>
        </div>
        {job.requirements?.length > 0 && (
          <div className="mt-4 bg-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-2">Requirements</h2>
            <ul className="list-disc list-inside text-gray-300">
              {job.requirements.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
        {user?.role === "Candidate" && job.status === "open" && (
          <div className="mt-6 bg-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-2">Apply for this job</h2>
            <textarea
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 mb-4"
              rows={4}
              placeholder="Cover letter (optional)"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
            <button
              onClick={handleApply}
              className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 font-semibold"
            >
              Submit Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
