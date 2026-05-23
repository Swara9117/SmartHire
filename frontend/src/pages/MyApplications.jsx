import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api";

const statusColors = {
  applied: "bg-blue-900 text-blue-300",
  shortlisted: "bg-green-900 text-green-300",
  rejected: "bg-red-900 text-red-300",
  hired: "bg-purple-900 text-purple-300",
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/applications/my")
      .then((data) => setApplications(data.applications || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-400 mb-8">My Applications</h1>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">You haven't applied to any jobs yet.</p>
            <Link to="/jobs" className="text-indigo-400 hover:underline">Browse Jobs</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{app.job?.title}</h3>
                    <p className="text-indigo-400">{app.job?.company}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm capitalize ${statusColors[app.status]}`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
