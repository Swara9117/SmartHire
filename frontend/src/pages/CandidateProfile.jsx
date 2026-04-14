import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { User, Mail, Code, Terminal, Edit2, Save, X, Trophy } from 'lucide-react';

const CandidateProfile = () => {
  const { emailid } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/candidate/profile/${emailid}`);
        setCandidate(res.data);
        setFormData({
          name: res.data.name,
          leetcodeUsername: res.data.leetcodeUsername,
          gfgUsername: res.data.gfgUsername
        });
      } catch (err) {
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    if (emailid) fetchProfile();
  }, [emailid]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await axios.put(`http://localhost:4000/api/candidate/profile/${emailid}`, formData);
      setCandidate(res.data.candidate);
      setIsEditing(false);
      toast.success("Profile updated seamlessly! Scores synced.");
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!candidate) return <div className="text-white text-center mt-20">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 relative flex flex-col items-center">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10"
      >
        {/* Left Column: Stats */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center">
             <div className="w-24 h-24 bg-gradient-to-tr from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-4xl font-bold shadow-[0_0_30px_rgba(168,85,247,0.4)] mb-4">
                {candidate.name.charAt(0)}
             </div>
             <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">
                {candidate.name}
             </h2>
             <p className="text-gray-400 text-sm mt-1">{candidate.emailid}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-amber-500/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />
            <h3 className="text-amber-400 font-medium mb-1 flex items-center gap-2">
              <Trophy size={18} /> Ace Board Score
            </h3>
            <p className="text-5xl font-bold text-white tracking-widest">{candidate.aceboardScore}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-blue-500/20">
              <p className="text-blue-300 text-xs font-semibold mb-1 uppercase tracking-wider">LeetCode</p>
              <p className="text-3xl font-bold">{candidate.leetcodeScore}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-green-500/20">
              <p className="text-green-300 text-xs font-semibold mb-1 uppercase tracking-wider">GFG</p>
              <p className="text-3xl font-bold">{candidate.gfgScore}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Info */}
        <div className="md:col-span-2 bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-semibold">Profile Details</h3>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-xl text-sm"
                >
                  <Edit2 size={16} /> Edit Info
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors px-4 py-2 rounded-xl text-sm"
                >
                  <X size={16} /> Cancel
                </button>
              )}
           </div>

           {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="text" 
                      className="w-full bg-black/40 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Email ID (Read Only)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="email" 
                      readOnly
                      className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-gray-500 cursor-not-allowed outline-none"
                      value={candidate.emailid}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-sm text-gray-400">LeetCode Username</label>
                    <div className="relative">
                      <Code className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="text" 
                        className="w-full bg-black/40 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.leetcodeUsername}
                        onChange={(e) => setFormData({...formData, leetcodeUsername: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-gray-400">GFG Username</label>
                    <div className="relative">
                      <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="text" 
                        className="w-full bg-black/40 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-green-500 outline-none"
                        value={formData.gfgUsername}
                        onChange={(e) => setFormData({...formData, gfgUsername: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={updating}
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 py-3 rounded-xl font-medium shadow-lg hover:shadow-indigo-500/40 transition-all disabled:opacity-50"
                  >
                    {updating ? 'Updating & Syncing...' : <><Save size={18} /> Save Changes</>}
                  </button>
                </div>
              </form>
           ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                    <p className="text-gray-500 text-sm mb-1">LeetCode Username</p>
                    <p className="text-lg font-mono text-blue-200">{candidate.leetcodeUsername}</p>
                  </div>
                  <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                    <p className="text-gray-500 text-sm mb-1">GFG Username</p>
                    <p className="text-lg font-mono text-green-200">{candidate.gfgUsername}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4 border-t border-white/10 mt-6 md:mt-10">
                  <button 
                    onClick={() => navigate('/leaderboards')}
                    className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-colors font-medium flex justify-center items-center gap-2"
                  >
                    <Trophy size={18} className="text-amber-400" />
                    View Leaderboards
                  </button>
                </div>
              </div>
           )}
        </div>
      </motion.div>
    </div>
  );
};

export default CandidateProfile;
