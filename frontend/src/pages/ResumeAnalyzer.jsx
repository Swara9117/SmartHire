import React, { useState, useEffect, useReducer, useRef, useMemo } from "react";
import { FileText, Search, CheckCircle2, Loader2, AlertCircle, ChevronDown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// Features data
const features = [
  {
    icon: <FileText className="w-10 h-10" />,
    title: "AI Resume Parsing",
    description: "Instantly parse your resume and extract key sections like Education, Skills, and Experience.",
  },
  {
    icon: <Search className="w-10 h-10" />,
    title: "ATS Compatibility Check",
    description: "Check your resume's readability by Applicant Tracking Systems (ATS) and get a compatibility score.",
  },
  {
    icon: <CheckCircle2 className="w-10 h-10" />,
    title: "Personalized Suggestions",
    description: "Receive intelligent tips to improve grammar, structure, keywords, and overall presentation.",
  },
];

// Initial state
const initialState = {
  selectedFile: null,
  jobRole: "",
  company: "",
  isAnalyzing: false,
  analysisResult: null,
  error: null,
  showDetails: {
    strengths: false,
    weaknesses: false,
    suggestions: false,
    keywords: false,
  },
  backendStatus: "checking",
  aiStatus: "",
};

// Reducer function
function reducer(state, action) {
  switch (action.type) {
    case 'SET_FILE':
      return { ...state, selectedFile: action.payload, error: null, analysisResult: null };
    case 'SET_JOB_ROLE':
      return { ...state, jobRole: action.payload };
    case 'SET_COMPANY':
      return { ...state, company: action.payload };
    case 'ANALYSIS_START':
      return { ...state, isAnalyzing: true, error: null, aiStatus: "Starting analysis..." };
    case 'SET_AI_STATUS':
      return { ...state, aiStatus: action.payload };
    case 'ANALYSIS_SUCCESS':
      return { ...state, isAnalyzing: false, analysisResult: action.payload, aiStatus: "" };
    case 'ANALYSIS_ERROR':
      return { ...state, isAnalyzing: false, error: action.payload, aiStatus: "" };
    case 'TOGGLE_DETAILS':
      return { 
        ...state, 
        showDetails: {
          ...state.showDetails,
          [action.payload]: !state.showDetails[action.payload]
        }
      };
    case 'SET_BACKEND_STATUS':
      return { ...state, backendStatus: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// Error Alert Component
const ErrorAlert = ({ error, onDismiss }) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg flex items-start"
  >
    <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
    <span className="flex-grow">{error}</span>
    {onDismiss && (
      <button 
        onClick={onDismiss}
        className="ml-2 text-red-300 hover:text-white"
        aria-label="Dismiss error"
      >
        &times;
      </button>
    )}
  </motion.div>
);

// File Upload Component
const FileUpload = ({ onFileChange, selectedFile }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Upload Your Resume (PDF)
      </label>
      <div className="flex items-center">
        <div 
          onClick={handleClick}
          className="flex flex-col items-center px-4 py-6 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 cursor-pointer hover:bg-gray-600 w-full"
        >
          <div className="flex flex-col items-center justify-center">
            <FileText className="w-8 h-8 mb-2 text-gray-400" />
            <p className="text-sm text-gray-400">
              {selectedFile ? selectedFile.name : 'Click to upload PDF'}
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
                  onFileChange(file);
                } else {
                  onFileChange(null);
                  e.target.value = '';
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Analysis Status Component
const AnalysisStatus = ({ status }) => {
  if (!status) return null;

  const statusMessages = [
    "Extracting text from resume...",
    "Identifying key sections...",
    "Checking ATS compatibility...",
    "Generating suggestions..."
  ];

  const progress = statusMessages.indexOf(status) + 1;

  return (
    <div className="mt-4 p-3 bg-indigo-900/30 text-indigo-200 rounded-lg">
      <div className="flex items-center">
        <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
        <span>{status}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
        <div 
          className="bg-indigo-500 h-1.5 rounded-full" 
          style={{ 
            width: `${(progress / statusMessages.length) * 100}%`,
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  );
};

// Memoized Score Circle Component
const MemoizedScoreCircle = React.memo(({ score }) => {
  const percentage = Math.min(100, Math.max(0, score));
  const color = percentage >= 75 ? "text-green-500" : 
               percentage >= 50 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="relative w-24 h-24 mx-auto mb-4">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#2D3748"
          strokeWidth="3"
        />
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={`${percentage}, 100`}
          className={color}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${color}`}>
        {score}
      </div>
    </div>
  );
});

// Memoized Feature Card Component
const MemoizedFeatureCard = React.memo(({ icon, title, description }) => (
  <motion.div
    className="p-4 md:w-1/3 flex flex-col text-center items-center"
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.3 }}
  >
    <div className="w-20 h-20 inline-flex items-center justify-center rounded-full bg-indigo-200 text-indigo-700 mb-5 shadow-md">
      {icon}
    </div>
    <div className="flex-grow bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-shadow duration-300">
      <h2 className="text-white text-lg title-font font-semibold mb-3">
        {title}
      </h2>
      <p className="leading-relaxed text-gray-300">{description}</p>
    </div>
  </motion.div>
));

// Analysis Results Component
const AnalysisResults = ({ result, showDetails, toggleDetails }) => {
  const renderAnalysisSection = (title, items, sectionKey) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-6">
        <button
          onClick={() => toggleDetails(sectionKey)}
          className="flex items-center justify-between w-full p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          type="button"
        >
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${showDetails[sectionKey] ? "rotate-180" : ""}`}
          />
        </button>
        {showDetails[sectionKey] && (
          <ul className="mt-2 space-y-2 pl-5">
            {items.map((item, index) => (
              <li 
                key={index} 
                className="text-gray-300 list-disc"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  if (!result) return null;

  return (
    <div className="mt-12 max-w-4xl mx-auto bg-gray-800 p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white" id="results-heading" tabIndex="-1">
          Analysis Results
        </h2>
        <div className="flex items-center text-sm text-indigo-400">
          <Sparkles className="w-4 h-4 mr-1" />
          <span>Powered by Gemini AI</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-2 text-center">
            ATS Score
          </h3>
          <MemoizedScoreCircle score={result.ats_score} />
          <p className="text-center text-gray-300">
            {result.ats_score >= 75
              ? "Excellent! Your resume is well optimized."
              : result.ats_score >= 50
              ? "Good, but could use some improvements."
              : "Needs significant improvements to pass ATS screening."}
          </p>
        </div>

        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            Job Information
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400">Position:</span>{" "}
              <span className="text-white font-medium">{result.jobRole}</span>
            </div>
            <div>
              <span className="text-gray-400">Company:</span>{" "}
              <span className="text-white font-medium">{result.company}</span>
            </div>
            <div>
              <span className="text-gray-400">Resume:</span>{" "}
              <span className="text-white font-medium">{result.filename}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {renderAnalysisSection(
          "Strengths",
          result.analysis?.strengths,
          "strengths"
        )}
        {renderAnalysisSection(
          "Weaknesses",
          result.analysis?.weaknesses,
          "weaknesses"
        )}
        {renderAnalysisSection(
          "Suggestions for Improvement",
          result.analysis?.suggestions,
          "suggestions"
        )}

        {result.keyword_matches && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Keyword Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-green-400 mb-2">
                  Matched Keywords ({result.keyword_matches.matched?.length || 0})
                </h4>
                {result.keyword_matches.matched?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.keyword_matches.matched.map((keyword, index) => (
                      <motion.span
                        key={index}
                        className="px-3 py-1 bg-green-900/50 text-green-200 rounded-full text-sm"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {keyword}
                      </motion.span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No keywords matched</p>
                )}
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-yellow-400 mb-2">
                  Missing Keywords ({result.keyword_matches.missing?.length || 0})
                </h4>
                {result.keyword_matches.missing?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.keyword_matches.missing.map((keyword, index) => (
                      <motion.span
                        key={index}
                        className="px-3 py-1 bg-yellow-900/50 text-yellow-200 rounded-full text-sm"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {keyword}
                      </motion.span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">All important keywords matched!</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
const ResumeAnalyzer = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Test backend connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/resume/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify({ test: 'connection' })
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        dispatch({ type: 'SET_BACKEND_STATUS', payload: "connected" });
      } catch (err) {
        console.error('Connection test failed:', err);
        dispatch({ type: 'SET_BACKEND_STATUS', payload: "error" });
        dispatch({ type: 'SET_ERROR', payload: `Backend connection failed. Details: ${err.message}` });
      }
    };
    
    const timer = setTimeout(() => {
      testConnection();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle resume analysis
  const handleAnalyze = async () => {
    if (!state.selectedFile) {
      dispatch({ type: 'SET_ERROR', payload: "Please upload a resume first" });
      return;
    }
    if (!state.jobRole.trim()) {
      dispatch({ type: 'SET_ERROR', payload: "Please enter the job role you're applying for" });
      return;
    }
    if (!state.company.trim()) {
      dispatch({ type: 'SET_ERROR', payload: "Please enter the company name" });
      return;
    }

    dispatch({ type: 'ANALYSIS_START' });

    try {
      const statusMessages = [
        "Extracting text from resume...",
        "Identifying key sections...",
        "Checking ATS compatibility...",
        "Generating suggestions..."
      ];

      statusMessages.forEach((message, i) => {
        setTimeout(() => {
          dispatch({ type: 'SET_AI_STATUS', payload: message });
        }, i * 800);
      });

      const formData = new FormData();
      formData.append("resume", state.selectedFile);
      formData.append("jobRole", state.jobRole);
      formData.append("company", state.company);

      const response = await fetch("http://localhost:4000/api/resume/analyze", {
        method: "POST",
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      }

      const data = await response.json();
      dispatch({ type: 'ANALYSIS_SUCCESS', payload: data });
    } catch (err) {
      console.error("Error details:", err);
      dispatch({ type: 'ANALYSIS_ERROR', payload: err.message || "Failed to analyze resume" });
    }
  };

  return (
    <section className="text-gray-400 bg-gray-900 body-font">
      <div className="container px-5 py-24 mx-auto">
        {state.backendStatus === "checking" && (
          <div className="mb-4 p-3 bg-blue-900/50 text-blue-200 rounded-lg flex items-center">
            <Loader2 className="animate-spin mr-2" />
            <span>Checking backend connection...</span>
          </div>
        )}
        {state.backendStatus === "error" && (
          <ErrorAlert 
            error="Backend connection failed. Please ensure the server is running."
            onDismiss={() => dispatch({ type: 'SET_BACKEND_STATUS', payload: "checking" })}
          />
        )}

        <div className="text-center mb-20">
          <h1 className="sm:text-3xl text-2xl font-medium title-font text-white mb-4">
            Resume Analyzer
          </h1>
          <p className="text-base leading-relaxed xl:w-2/4 lg:w-3/4 mx-auto text-gray-400">
            Upload your resume and unlock deep insights into structure, skills, and ATS optimization.
          </p>
          <div className="flex mt-6 justify-center">
            <div className="w-16 h-1 rounded-full bg-indigo-500 inline-flex"></div>
          </div>
        </div>

        <div className="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4 md:space-y-0 space-y-6">
          {features.map((feature, index) => (
            <MemoizedFeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        <div className="mt-16 max-w-2xl mx-auto bg-gray-800 p-6 rounded-xl shadow-lg">
          <FileUpload 
            onFileChange={(file) => dispatch({ type: 'SET_FILE', payload: file })}
            selectedFile={state.selectedFile}
          />

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Job Role You're Applying For
            </label>
            <input
              type="text"
              value={state.jobRole}
              onChange={(e) => dispatch({ type: 'SET_JOB_ROLE', payload: e.target.value })}
              className="w-full bg-gray-700 rounded border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900 text-base outline-none text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              placeholder="e.g. Software Engineer, Data Analyst, Product Manager"
              aria-label="Job Role"
              aria-required="true"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={state.company}
              onChange={(e) => dispatch({ type: 'SET_COMPANY', payload: e.target.value })}
              className="w-full bg-gray-700 rounded border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900 text-base outline-none text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              placeholder="e.g. Google, Amazon, Microsoft"
              aria-label="Company Name"
              aria-required="true"
            />
          </div>

          <div className="text-center">
            <motion.button
              onClick={handleAnalyze}
              disabled={state.isAnalyzing || state.backendStatus !== "connected"}
              whileHover={(!state.isAnalyzing && state.backendStatus === "connected") ? { scale: 1.05 } : {}}
              whileTap={(!state.isAnalyzing && state.backendStatus === "connected") ? { scale: 0.97 } : {}}
              className={`inline-flex items-center border-0 py-2 px-8 rounded text-lg shadow-md transition duration-300
                ${state.isAnalyzing ? "bg-indigo-700 text-white" : 
                  state.backendStatus !== "connected" ? "bg-gray-500 text-gray-300 cursor-not-allowed" :
                  "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-400/40 cursor-pointer"}
              `}
              aria-busy={state.isAnalyzing}
              aria-live="polite"
            >
              {state.isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Analyzing...
                </>
              ) : state.backendStatus !== "connected" ? (
                "Service Unavailable"
              ) : (
                "Analyze Resume"
              )}
            </motion.button>
          </div>

          <AnalysisStatus status={state.aiStatus} />
          {state.error && (
            <ErrorAlert 
              error={state.error}
              onDismiss={() => dispatch({ type: 'SET_ERROR', payload: null })}
            />
          )}
        </div>

        <AnalysisResults 
          result={state.analysisResult} 
          showDetails={state.showDetails}
          toggleDetails={(section) => dispatch({ type: 'TOGGLE_DETAILS', payload: section })}
        />
      </div>
    </section>
  );
};

export default ResumeAnalyzer;
