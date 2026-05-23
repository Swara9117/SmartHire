import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    apiFetch("/api/admin/analytics")
      .then(setData)
      .catch(console.error);
  }, []);

  const a = data?.analytics;

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-400">Admin Dashboard</h1>
          <Link to="/admin/users" className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700">
            Manage Users
          </Link>
        </div>

        {!a ? (
          <p className="text-gray-400">Loading analytics...</p>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Users", value: a.totalUsers },
                { label: "Candidates", value: a.totalCandidates },
                { label: "Recruiters", value: a.totalRecruiters },
                { label: "Admins", value: a.totalAdmins },
                { label: "Total Jobs", value: a.totalJobs },
                { label: "Open Jobs", value: a.openJobs },
                { label: "Applications", value: a.totalApplications },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-800 rounded-xl p-6">
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
                {(data.recentUsers || []).map((u) => (
                  <div key={u._id} className="flex justify-between py-2 border-b border-gray-700">
                    <span>{u.username}</span>
                    <span className="text-gray-400 text-sm">{u.role}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Jobs</h2>
                {(data.recentJobs || []).map((j) => (
                  <div key={j._id} className="flex justify-between py-2 border-b border-gray-700">
                    <span>{j.title}</span>
                    <span className="text-gray-400 text-sm">{j.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
