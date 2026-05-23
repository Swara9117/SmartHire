import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function JobRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/recommendations/jobs")
      .then((data) => setRecommendations(data.recommendations || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-400 mb-2">AI Job Recommendations</h1>
        <p className="text-gray-400 mb-8">Personalized matches based on your profile and resume</p>
        {loading && <p className="text-gray-400">Analyzing your profile with AI...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && !error && recommendations.length === 0 && (
          <p className="text-gray-400">No recommendations available. Upload your resume and add skills to your profile.</p>
        )}
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.jobId} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{rec.job?.title}</h3>
                  <p className="text-indigo-400">{rec.job?.company}</p>
                  <p className="text-gray-300 mt-2">{rec.reason}</p>
                </div>
                <span className="text-2xl font-bold text-green-400">{rec.matchScore}%</span>
              </div>
              <Link
                to={`/jobs/${rec.jobId}`}
                className="inline-block mt-4 text-indigo-400 hover:underline"
              >
                View Job →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
