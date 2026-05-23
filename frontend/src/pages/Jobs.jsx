import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const data = await apiFetch(`/api/jobs?${params}`);
      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-indigo-400 mb-2">Browse Jobs</h1>
        <p className="text-gray-400 mb-8">Find your next opportunity on SmartHire</p>
        <div className="flex gap-3 mb-8">
          <input
            className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Search by title, company, or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            onClick={fetchJobs}
            className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 font-semibold"
          >
            Search
          </button>
        </div>
        {loading ? (
          <p className="text-gray-400">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-gray-400">No open jobs found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-indigo-500 transition cursor-pointer"
                onClick={() => navigate(`/jobs/${job._id}`)}
              >
                <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                <p className="text-indigo-400 mt-1">{job.company}</p>
                <p className="text-gray-400 text-sm mt-2">
                  {job.location} · {job.jobType}
                </p>
                <p className="text-gray-300 mt-3 line-clamp-2">{job.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {(job.skills || []).slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}