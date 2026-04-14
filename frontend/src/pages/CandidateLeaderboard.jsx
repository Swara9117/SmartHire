import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Code, Terminal, Medal, TrendingUp, Sparkles, UserRound } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CandidateLeaderboard = () => {
  const [activeTab, setActiveTab] = useState('ace'); // 'ace', 'leetcode', 'gfg'
  const [data, setData] = useState({ leetcodeBoard: [], gfgBoard: [], aceBoard: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/candidate/leaderboards');
        setData(res.data);
      } catch (err) {
        toast.error("Failed to fetch leaderboards.");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboards();
  }, []);

  const getActiveData = () => {
    switch(activeTab) {
      case 'ace': return data.aceBoard;
      case 'leetcode': return data.leetcodeBoard;
      case 'gfg': return data.gfgBoard;
      default: return [];
    }
  };

  const getScoreKey = () => {
    switch(activeTab) {
      case 'ace': return 'aceboardScore';
      case 'leetcode': return 'leetcodeScore';
      case 'gfg': return 'gfgScore';
      default: return 'aceboardScore';
    }
  };

  const tabs = [
    { id: 'ace', label: 'Leaderboard', icon: <Trophy size={18} className="text-amber-400"/> },
    { id: 'leetcode', label: 'LeetCode', icon: <Code size={18} className="text-blue-400"/> },
    { id: 'gfg', label: 'GeeksForGeeks', icon: <Terminal size={18} className="text-green-400"/> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510] text-gray-100 p-4 md:p-10 relative overflow-hidden flex flex-col items-center">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-purple-900/20 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-4xl w-full z-10">
        
        <div className="text-center mb-10 space-y-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium"
          >
            <Sparkles className="text-indigo-400" size={16} /> Global Rankings
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            Hall of Fame
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Discover the top performing candidates.
          </p>
        </div>

        {/* Custom Tab Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/5 p-1.5 rounded-2xl backdrop-blur-md flex shadow-lg border border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon} {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 overflow-hidden min-h-[500px]">
          <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 uppercase tracking-widest pb-4 border-b border-white/10 mb-4 px-4">
             <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
             <div className="col-span-7 sm:col-span-8">Candidate Info</div>
             <div className="col-span-3 text-right">Score</div>
          </div>
          
          <AnimatePresence mode="popLayout">
            {getActiveData().map((candidate, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                key={`${activeTab}-${candidate._id || index}`}
                className={`grid grid-cols-12 items-center py-4 px-4 rounded-2xl mb-2 transition-all hover:bg-white/10 ${
                  index === 0 ? 'bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20' : 
                  index === 1 ? 'bg-gradient-to-r from-slate-300/10 to-transparent border border-slate-300/20' : 
                  index === 2 ? 'bg-gradient-to-r from-amber-700/10 to-transparent border border-amber-700/20' : 
                  'bg-white/5'
                }`}
              >
                {/* Rank */}
                <div className="col-span-2 sm:col-span-1 flex justify-center">
                  {index < 3 ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg ${
                      index === 0 ? 'bg-amber-400 text-amber-900' :
                      index === 1 ? 'bg-slate-300 text-slate-800' :
                      'bg-amber-700 text-amber-100'
                    }`}>
                      {index + 1}
                    </div>
                  ) : (
                    <span className="font-mono text-gray-400 font-medium">#{index + 1}</span>
                  )}
                </div>

                {/* Info */}
                <div className="col-span-7 sm:col-span-8 flex items-center gap-4">
                  <div className={`hidden sm:flex w-10 h-10 rounded-full items-center justify-center font-bold text-lg ${
                    index % 3 === 0 ? 'bg-blue-500/20 text-blue-300' : 
                    index % 3 === 1 ? 'bg-purple-500/20 text-purple-300' : 
                    'bg-pink-500/20 text-pink-300'
                  }`}>
                    {candidate.username ? candidate.username.charAt(0) : '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-100 truncate text-sm sm:text-base">{candidate.username}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                       {activeTab === 'leetcode' && `@${candidate.leetcodeUsername}`}
                       {activeTab === 'gfg' && `@${candidate.gfgUsername}`}
                       {activeTab === 'ace' && 'Elite Coder'}
                    </p>
                  </div>
                </div>

                {/* Score */}
                <div className="col-span-3 text-right">
                  <div className="inline-flex items-center gap-1 font-mono font-bold text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    {candidate[getScoreKey()]}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {getActiveData().length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="py-20 text-center text-gray-500 flex flex-col items-center"
              >
                <TrendingUp size={48} className="mb-4 opacity-20" />
                <p>No rankings available yet.</p>
                <p className="text-sm mt-2">Sign up candidates to populate the board!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CandidateLeaderboard;
