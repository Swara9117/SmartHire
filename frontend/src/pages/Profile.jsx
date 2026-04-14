import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';

export default function Profile() {
  const [showNotes, setShowNotes] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [notes, setNotes] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ username: '', emailid: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser?.emailid) return;
        setLoading(true);
        const res = await userService.getProfile(storedUser.emailid);
        setUser(res);
        setForm({ username: res.username, emailid: res.emailid, password: '' });
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
    setSuccess('');
    setError('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Remove emailid from form data since it's not allowed to be updated
      const { emailid, ...updateData } = form;
      const res = await userService.updateProfile(user.emailid, updateData);
      setUser(res.user || res); // handle both {user: ...} and user object
      setEditMode(false);
      setSuccess('Profile updated successfully!');
      // Optionally update localStorage
      localStorage.setItem('user', JSON.stringify(res.user || res));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) return <div className="text-center text-indigo-400 mt-10">Loading profile...</div>;

  return (
    <section className="bg-gray-900 text-gray-300 body-font min-h-screen transition-all duration-500 ease-in-out">
      <div className="container px-5 py-24 mx-auto flex flex-col">
        <div className="lg:w-4/6 mx-auto">
          {/* Profile Banner Image */}
          <div className="rounded-lg h-64 overflow-hidden shadow-lg transform transition duration-700 hover:scale-105 hover:shadow-[0_10px_30px_rgba(99,102,241,0.6)]">
            <img
              alt="User Banner"
              className="object-cover object-center h-full w-full"
              src="https://dummyimage.com/1200x500/222/ccc&text=Your+Profile+Banner"
            />
          </div>

          {/* Profile Content */}
          <div className="flex flex-col sm:flex-row mt-10 bg-gray-800 rounded-lg shadow-xl p-6 transition duration-500 hover:shadow-indigo-500/50">
            {/* Left Side - Avatar and Basic Info */}
            <div className="sm:w-1/3 text-center sm:pr-8 sm:py-8">
              <div className="w-24 h-24 rounded-full inline-flex items-center justify-center bg-indigo-600 text-white shadow-lg hover:scale-110 transition duration-300 ease-in-out">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="w-12 h-12"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="flex flex-col items-center text-center justify-center mt-4">
                <h2 className="font-medium title-font text-white text-lg">
                  {user?.username || 'User'}
                </h2>
                <div className="w-12 h-1 bg-indigo-500 rounded mt-2 mb-4"></div>
                <p className="text-base text-white">{user?.role || 'Role'}</p>
              </div>
            </div>

            {/* Right Side */}
            <div className="sm:w-2/3 sm:pl-8 sm:py-8 sm:border-l border-gray-700 mt-4 pt-4 sm:mt-0 text-center sm:text-left">
              {error && <div className="bg-red-500 text-white p-2 rounded mb-2">{error}</div>}
              {success && <div className="bg-green-600 text-white p-2 rounded mb-2">{success}</div>}
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      className="w-full p-2 rounded bg-gray-700 border border-indigo-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      name="emailid"
                      value={form.emailid}
                      disabled
                      className="w-full p-2 rounded bg-gray-600 border border-gray-500 text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Password (leave blank to keep unchanged)</label>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-gray-700 border border-indigo-500 text-white"
                      />
                      <span
                        onClick={() => setShowPassword((prev) => !prev)}
                        style={{ cursor: "pointer", marginLeft: "8px", display: "flex", alignItems: "center" }}
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <Eye size={24} />
                        ) : (
                          <EyeOff size={24} />
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-4 mt-4">
                    <button
                      onClick={handleSave}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded shadow"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded shadow"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="leading-relaxed text-md mb-4 text-gray-300">
                    <strong>Email:</strong> {user?.emailid} <br />
                    <strong>Role:</strong> {user?.role} <br />
                    <strong>Member Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                  <button
                    onClick={handleEdit}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded shadow"
                  >
                    Edit Profile
                  </button>
                </>
              )}

              {/* Action Buttons (Responsive Flex) */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0 mb-4 mt-6">
                {/* View Reports Button */}
                <button
                  onClick={() => setShowReports(!showReports)}
                  className="text-white bg-indigo-900 hover:bg-indigo-700 border-2 border-indigo-500 py-1 px-4 rounded shadow-md hover:shadow-[0_0_10px_rgba(99,102,241,0.6)] transition-all duration-300"
                >
                  {showReports ? "Hide Reports" : "View Reports"}
                </button>

                {/* Notes Button */}
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-white bg-indigo-900 hover:bg-indigo-700 border-2 border-indigo-500 py-1 px-4 rounded shadow-md hover:shadow-[0_0_10px_rgba(99,102,241,0.6)] transition-all duration-300"
                >
                  {showNotes ? "Hide Notes" : "Add Notes"}
                </button>
              </div>

              {/* Report List */}
              {showReports && (
                <ul className="text-gray-400 list-disc list-inside space-y-1 mt-2">
                  <li>Completed "Technical Interview Simulation"</li>
                  <li>Updated Resume on Resume Analyzer</li>
                  <li>Joined Group Discussion on AI Ethics</li>
                </ul>
              )}

              {/* Notes Section */}
              {showNotes && (
                <div className="mt-4">
                  <textarea
                    className="w-full bg-gray-700 border border-indigo-500 rounded p-3 text-sm text-gray-200 resize-none shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                    rows="5"
                    placeholder="Write what topics you need to practice or improve..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <button
                    onClick={() => alert("Note saved!")}
                    className="mt-3 text-white bg-indigo-600 hover:bg-indigo-700 py-2 px-6 rounded shadow hover:shadow-[0_0_15px_rgba(99,102,241,0.8)] transition"
                  >
                    Save Note
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
