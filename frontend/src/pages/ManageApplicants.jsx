import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../utils/api";
import toast from "react-hot-toast";

export default function ManageApplicants() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplicants = () => {
    apiFetch(`/api/applications/job/${jobId}`)
      .then((data) => setApplications(data.applications || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/api/applications/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(`Status updated to ${status}`);
      fetchApplicants();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-400 mb-8">Manage Applicants</h1>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : applications.length === 0 ? (
          <p className="text-gray-400">No applicants yet.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{app.candidate?.username}</h3>
                    <p className="text-gray-400">{app.candidate?.emailid}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Skills: {(app.candidate?.skills || []).join(", ") || "N/A"}
                    </p>
                    {app.candidate?.resumeURL && (
                      <a
                        href={`http://localhost:4000${app.candidate.resumeURL}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 text-sm hover:underline"
                      >
                        View Resume
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-gray-700 text-sm capitalize">{app.status}</span>
                    {app.status !== "shortlisted" && (
                      <button onClick={() => updateStatus(app._id, "shortlisted")} className="px-3 py-1 bg-green-700 rounded-lg text-sm hover:bg-green-600">
                        Shortlist
                      </button>
                    )}
                    {app.status !== "rejected" && (
                      <button onClick={() => updateStatus(app._id, "rejected")} className="px-3 py-1 bg-red-700 rounded-lg text-sm hover:bg-red-600">
                        Reject
                      </button>
                    )}
                    {app.status !== "hired" && (
                      <button onClick={() => updateStatus(app._id, "hired")} className="px-3 py-1 bg-purple-700 rounded-lg text-sm hover:bg-purple-600">
                        Hire
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
