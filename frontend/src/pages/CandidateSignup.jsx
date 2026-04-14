import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Code, Terminal, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CandidateSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    emailid: '',
    leetcodeUsername: '',
    gfgUsername: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Assuming backend runs on port 3000 or similar. We use relative URL or generic.
      const res = await axios.post('http://localhost:3000/api/candidate/signup', formData);
      toast.success("Signup successful! Scores have been imported.");
      
      // Navigate to leaderboard or profile, passing emailid state if needed
      // To mimic a real app, let's navigate to their profile.
      navigate(`/candidate-profile/${formData.emailid}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-4 text-white">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600" />
        
        <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
          Join the Arena
        </h2>
        <p className="text-gray-300 mb-8 text-sm">
          Connect your coding profiles and rank on the Ace Board.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-500"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Email ID</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="email" 
                name="emailid"
                value={formData.emailid}
                onChange={handleChange}
                required
                className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-500"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">LeetCode Username</label>
            <div className="relative">
              <Code className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                name="leetcodeUsername"
                value={formData.leetcodeUsername}
                onChange={handleChange}
                required
                className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-500"
                placeholder="leetcode_john"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">GeeksForGeeks Username</label>
            <div className="relative">
              <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                name="gfgUsername"
                value={formData.gfgUsername}
                onChange={handleChange}
                required
                className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-500"
                placeholder="gfg_john"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
          >
            {loading ? (
              <span className="animate-pulse">Scraping Profiles...</span>
            ) : (
              <>
                <span>Sign Up & Sync Profiles</span>
                <ChevronRight size={20} />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default CandidateSignup;
