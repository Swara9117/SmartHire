import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/jobs/recruiter/mine"),
      apiFetch("/api/applications/recruiter/all"),
    ])
      .then(([jobsData, appsData]) => {
        setJobs(jobsData.jobs || []);
        setApplications(appsData.applications || []);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-400">Recruiter Dashboard</h1>
          <Link
            to="/recruiter/post-job"
            className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 font-semibold"
          >
            Post New Job
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400">Total Jobs</p>
            <p className="text-3xl font-bold text-white">{jobs.length}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400">Open Jobs</p>
            <p className="text-3xl font-bold text-green-400">
              {jobs.filter((j) => j.status === "open").length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400">Total Applicants</p>
            <p className="text-3xl font-bold text-indigo-400">{applications.length}</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Your Job Postings</h2>
        <div className="space-y-3 mb-10">
          {jobs.map((job) => (
            <div key={job._id} className="bg-gray-800 rounded-xl p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-gray-400 text-sm">{job.company} · {job.status}</p>
              </div>
              <Link
                to={`/recruiter/applicants/${job._id}`}
                className="text-indigo-400 hover:underline"
              >
                Manage Applicants
              </Link>
            </div>
          ))}
          {jobs.length === 0 && <p className="text-gray-400">No jobs posted yet.</p>}
        </div>
      </div>
    </div>
  );
}
