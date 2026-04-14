import axios from 'axios';
import * as cheerio from 'cheerio';
import { normalizeGFG, normalizeLeetcode } from './normalize.js';

const getLeetCodeStats = async (username) => {
  const url = "https://leetcode.com/graphql";
  const headers = {
    "Content-Type": "application/json",
    "Referer": `https://leetcode.com/${username}/`,
    "User-Agent": "Mozilla/5.0"
  };

  const query = {
    query: `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }`,
    variables: { username }
  };

  try {
    const response = await axios.post(url, query, { headers });
    const submissions = response.data.data.matchedUser.submitStats.acSubmissionNum;
    
    const stats = {};
    submissions.forEach(item => {
      stats[item.difficulty.toLowerCase()] = item.count;
    });
    
    return {
      easySolved: stats.easy || 0,
      mediumSolved: stats.medium || 0,
      hardSolved: stats.hard || 0
    };
  } catch (err) {
    console.error("LeetCode API Error:", err.message);
    return null;
  }
};

const calculateScore = async (leetcodeUsername, gfg) => {
  let totalScore = 0;
  let leetcodeScore = 0;
  let gfgScore = 0;

  // LeetCode Calculation
  if (leetcodeUsername) {
    try {
      const leetcodeStats = await getLeetCodeStats(leetcodeUsername);
      if (leetcodeStats) {
        const { easySolved, mediumSolved, hardSolved } = leetcodeStats;
        leetcodeScore = await normalizeLeetcode(
          easySolved,
          mediumSolved,
          hardSolved
        );
        totalScore += leetcodeScore;
        console.log(`✅ LeetCode: ${leetcodeScore}`);
      }
    } catch (err) {
      console.log(`❌ LeetCode failed for ${leetcodeUsername}`);
    }
  }

  // GFG Calculation
  if (gfg) {
    try {
      const { data } = await axios.get(`https://auth.geeksforgeeks.org/user/${gfg}/profile`);
      const $ = cheerio.load(data);
      const scoreText = $('.scoreCard_head_left--score__oSi_x').first().text().trim();
      const gfgRaw = parseInt(scoreText) || 0;
      gfgScore = await normalizeGFG(gfgRaw);
      totalScore += gfgScore;
      console.log(`✅ GFG: ${gfgScore}`);
    } catch (err) {
      console.log(`❌ GFG failed for ${gfg}`, err.message);
    }
  }

  // Calculate Ace Board Score (normalization or just total/2)
  return {
    totalScore: Math.round(totalScore / 2),
    leetcodeScore,
    gfgScore
  };
};

export default calculateScore;
