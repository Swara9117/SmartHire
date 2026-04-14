import User from "../models/user.js";
import calculateScore from "../utils/scraper.js";

// Sign up and automatically scrape and normalize scores
export const signupCandidate = async (req, res) => {
    try {
        const { name, emailid, leetcodeUsername, gfgUsername } = req.body;
        
        // Basic validation
        if (!name || !emailid || !leetcodeUsername || !gfgUsername) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        let existingCandidate = await User.findOne({ emailid });
        if (existingCandidate) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Web scraping the scores
        console.log(`Scraping scores for ${leetcodeUsername} & ${gfgUsername}`);
        const { totalScore, leetcodeScore, gfgScore } = await calculateScore(leetcodeUsername, gfgUsername);

        const newCandidate = new User({
            name,
            emailid,
            leetcodeUsername,
            gfgUsername,
            leetcodeScore,
            gfgScore,
            aceboardScore: totalScore 
        });

        await newCandidate.save();

        res.status(201).json({
            message: "Candidate signed up successfully",
            candidate: newCandidate
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during signup" });
    }
};

// Update profile and optionally rescrape scores
export const updateCandidate = async (req, res) => {
    try {
        const { emailid } = req.params;
        const { name, leetcodeUsername, gfgUsername } = req.body;
        
        let candidate = await User.findOne({ emailid });
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        let rescrapeNeeded = false;
        
        if (name) candidate.name = name;
        if (leetcodeUsername && leetcodeUsername !== candidate.leetcodeUsername) {
            candidate.leetcodeUsername = leetcodeUsername;
            rescrapeNeeded = true;
        }
        if (gfgUsername && gfgUsername !== candidate.gfgUsername) {
            candidate.gfgUsername = gfgUsername;
            rescrapeNeeded = true;
        }

        if (rescrapeNeeded) {
            console.log("Rescraping due to username change...");
             // Send response early and update in background if needed? 
             // We'll await it to ensure consistency right now.
            const { totalScore, leetcodeScore, gfgScore } = await calculateScore(candidate.leetcodeUsername, candidate.gfgUsername);
            candidate.leetcodeScore = leetcodeScore;
            candidate.gfgScore = gfgScore;
            candidate.aceboardScore = totalScore;
        }

        await candidate.save();
        
        res.status(200).json({
            message: "Profile updated successfully",
            candidate
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during update" });
    }
};

export const getCandidateInfo = async (req, res) => {
    try {
        const { emailid } = req.params;
        const candidate = await User.findOne({ emailid });
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }
        res.status(200).json(candidate);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching profile" });
    }
};

export const getLeaderboards = async (req, res) => {
    try {
        const leetcodeBoard = await User.find({ role: "Candidate" }).sort({ leetcodeScore: -1 }).limit(10).select('username leetcodeScore leetcodeUsername');
        const gfgBoard = await User.find({ role: "Candidate" }).sort({ gfgScore: -1 }).limit(10).select('username gfgScore gfgUsername');
        const aceBoard = await User.find({ role: "Candidate" }).sort({ aceboardScore: -1 }).limit(10).select('username aceboardScore');

        res.status(200).json({
            leetcodeBoard,
            gfgBoard,
            aceBoard
        });
    } catch (error) {
        res.status(500).json({ message: "Server error fetching leaderboards" });
    }
};
