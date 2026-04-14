import React, { useState, useRef, useEffect } from "react";

const interviewFeatures = [
  {
    title: "STAR Method Guidance",
    description:
      "Master the STAR technique with structured prompts and response validation.",
    views: "2.1K",
    comments: 12,
  },
  {
    title: "Tone & Empathy Feedback",
    description:
      "Get real-time feedback on emotional tone, empathy level, and articulation.",
    views: "1.8K",
    comments: 9,
  },
  {
    title: "Behavioral Question Simulator",
    description:
      "Practice with common HR questions and receive personalized improvement tips.",
    views: "2.5K",
    comments: 15,
  },
];

export default function HRInterview() {
  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [chat, setChat] = useState([]); 
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [answerLoading, setAnswerLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const chatBoxRef = useRef(null);

  // Audio recording state
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat, showFeedback]);

  // Voice recognition setup
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        setIsRecording(false);
      };
      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
    if (!isRecording) {
      setIsRecording(true);
      recognitionRef.current.start();
    } else {
      setIsRecording(false);
      recognitionRef.current.stop();
    }
  };

  // Start/stop recording and send to backend for AssemblyAI transcription
  const handleRecordAnswer = async () => {
    if (!recording) {
      // Start recording
      if (navigator.mediaDevices && window.MediaRecorder) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          const recorder = new window.MediaRecorder(stream);
          setMediaRecorder(recorder);
          setAudioChunks([]);
          recorder.ondataavailable = (e) => {
            setAudioChunks((prev) => [...prev, e.data]);
          };
          recorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            // Send to backend for AssemblyAI transcription
            const formData = new FormData();
            formData.append('file', audioBlob, 'answer.webm');
            try {
              const res = await fetch('http://localhost:8000/hr_interview/voice_answer', {
                method: 'POST',
                body: formData,
              });
              if (!res.ok) throw new Error('Failed to transcribe audio');
              const data = await res.json();
              setUserInput(data.transcript || '');
            } catch (e) {
              setError('Failed to transcribe audio.');
            }
          };
          recorder.start();
          setRecording(true);
        }).catch(() => {
          setError('Microphone access denied.');
        });
      } else {
        setError('Audio recording not supported in this browser.');
      }
    } else {
      // Stop recording
      if (mediaRecorder) {
        mediaRecorder.stop();
        setRecording(false);
      }
    }
  };

  const handleStart = async () => {
    if (!company.trim() || !role.trim()) {
      setError("Please enter both company and role.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/hr_interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role }),
      });
      if (!res.ok) throw new Error("Failed to start HR interview");
      const data = await res.json();
      setCurrentQuestion(data.question);
      setChat([{ role: "system", content: data.question }]);
      setInterviewStarted(true);
      setShowForm(false);
      setShowFeedback(false);
      setUserInput("");
      setFeedback("");
    } catch (e) {
      setError("Failed to start HR interview.");
    } finally {
      setLoading(false);
    }
  };

  // Play AI response as audio using /tts endpoint
  const playTTS = async (text) => {
    try {
      const res = await fetch('http://localhost:8000/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (e) {
      setError('Failed to play AI audio.');
    }
  };

  const handleSendAnswer = async () => {
    if (!userInput.trim()) return;
    setAnswerLoading(true);
    setFeedback("");
    // Show user's answer in chat immediately
    setChat((prev) => [...prev, { role: "user", content: userInput }, { role: "system", content: "..." }]);
    try {
      const res = await fetch("http://localhost:8000/hr_interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: userInput, company, role }),
      });
      if (!res.ok) throw new Error("Failed to send answer");
      const data = await res.json();
      setFeedback(data.feedback);
      setCurrentQuestion(data.next_question);
      setChat((prev) => {
        // Remove the last system '...' message and add the real next question
        const newChat = prev.slice();
        if (newChat.length > 0 && newChat[newChat.length - 1].role === 'system' && newChat[newChat.length - 1].content === '...') {
          newChat.pop();
        }
        newChat.push({ role: "system", content: data.next_question });
        return newChat;
      });
      setUserInput("");
      // Play TTS for AI response
      playTTS(data.next_question);
    } catch (e) {
      setFeedback("Failed to get next question or feedback.");
      setChat((prev) => {
        // Remove the last system '...' message if error
        const newChat = prev.slice();
        if (newChat.length > 0 && newChat[newChat.length - 1].role === 'system' && newChat[newChat.length - 1].content === '...') {
          newChat.pop();
        }
        return newChat;
      });
    } finally {
      setAnswerLoading(false);
    }
  };

  const handleEndInterview = async () => {
    setAnswerLoading(true);
    setFeedback("");
    try {
      const res = await fetch("http://localhost:8000/hr_interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role }),
      });
      if (!res.ok) throw new Error("Failed to get feedback");
      const data = await res.json();
      setFeedback(data.feedback);
      setShowFeedback(true);
    } catch (e) {
      setFeedback("Failed to get feedback.");
      setShowFeedback(true);
    } finally {
      setAnswerLoading(false);
    }
  };

  return (
    <section className="text-gray-400 bg-gray-900 body-font min-h-screen">
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-wrap -m-4">
          {interviewFeatures.map((feature, index) => (
            <div
              className="p-4 lg:w-1/3"
              key={index}
              style={{
                animation: `fadeUp 0.6s ease ${index * 0.2 + 0.2}s both`,
              }}
            >
              <div className="card h-full bg-gray-800 bg-opacity-90 px-8 pt-16 pb-24 rounded-2xl overflow-hidden text-center relative shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-[0_8px_30px_rgba(99,102,241,0.8)]">
                <h2 className="tracking-widest text-xs title-font font-medium text-indigo-400 mb-1">
                  HR MODULE
                </h2>
                <h1 className="title-font sm:text-2xl text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h1>
                <p className="leading-relaxed mb-5 text-gray-300">
                  {feature.description}
                </p>
                <button
                  className="text-indigo-500 inline-flex items-center hover:text-indigo-300 transition duration-300"
                  onClick={() => setShowForm(true)}
                >
                  Try Now
                  <svg
                    className="w-4 h-4 ml-2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="text-center mt-4 leading-none flex justify-center absolute bottom-0 left-0 w-full py-4 bg-gray-900 bg-opacity-60 rounded-b-2xl">
                  <span className="text-gray-400 mr-4 inline-flex items-center text-sm pr-3 border-r border-gray-700">
                    <svg
                      className="w-4 h-4 mr-1"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {feature.views}
                  </span>
                  <span className="text-gray-400 inline-flex items-center text-sm">
                    <svg
                      className="w-4 h-4 mr-1"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                    </svg>
                    {feature.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Add HR Interview input box below the feature cards */}
        {!interviewStarted && (
          <div className="mt-12 max-w-xl mx-auto bg-gray-800 bg-opacity-90 rounded-2xl p-8 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">
              Start HR Interview
            </h2>
            {error && (
              <div className="text-red-400 mb-4 text-center">{error}</div>
            )}
            <div className="mb-4">
              <label className="block text-sm mb-2">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="e.g. Google"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm mb-2">Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="e.g. Software Engineer"
              />
            </div>
            <button
              onClick={handleStart}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-md py-2 transition-all duration-300"
              disabled={loading}
            >
              {loading ? "Starting..." : "Start Interview"}
            </button>
          </div>
        )}
        {interviewStarted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40 transition-all duration-300">
            <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-white mb-6">
                HR Interview in Progress
              </h2>
              <div
                ref={chatBoxRef}
                className="bg-gray-900 rounded-lg p-4 mb-4 overflow-y-auto text-left scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-800"
                style={{ height: 320, maxHeight: 320, minHeight: 320, cursor: 'grab' }}
                tabIndex={0}
              >
                {chat.length === 0 && currentQuestion && (
                  <div className="text-gray-200 mb-2 font-semibold">AI: {currentQuestion}</div>
                )}
                {chat.map((msg, idx) => (
                  <div
                    key={idx}
                    className={
                      msg.role === "user"
                        ? "text-indigo-300 mb-2"
                        : msg.content === '...'
                          ? "text-gray-400 mb-2 italic animate-pulse"
                          : "text-gray-200 mb-2 font-semibold"
                    }
                  >
                    {msg.role === "user" ? "You: " : "AI: "}
                    {msg.content}
                  </div>
                ))}
              </div>
              {showFeedback && feedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40 transition-all duration-300">
                  <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl text-white p-8 rounded-2xl shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl font-semibold mb-6 text-center flex items-center justify-center gap-2">
                      <span role="img" aria-label="feedback">📝</span> Interview Feedback
                    </h2>
                    {answerLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <div className="text-indigo-300 text-lg font-semibold">Generating feedback...</div>
                      </div>
                    ) : feedback ? (
                      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 p-6 rounded-xl shadow-lg border border-indigo-700 mb-8">
                        {(() => {
                          // Split feedback into sections by emoji headers
                          const sectionRegex = /([😊💬⭐💡📦].+?)(?=\n[😊💬⭐💡📦]|$)/gs;
                          const matches = [...feedback.matchAll(sectionRegex)];
                          return matches.length > 0 ? matches.map((match, idx) => {
                            const section = match[1].trim();
                            // Highlight summary box
                            if (section.startsWith('📦')) {
                              return (
                                <div key={idx} className="bg-gradient-to-r from-green-400/20 to-blue-400/10 border border-green-400 rounded-lg p-4 my-4 shadow-inner">
                                  <div className="text-lg font-bold text-green-300 mb-2 flex items-center gap-2">
                                    <span className="text-2xl">📦</span> <span>Actionable Tips</span>
                                  </div>
                                  <ul className="list-none pl-0">
                                    {section.split('\n').slice(1).map((line, i) => (
                                      <li key={i} className="flex items-center gap-2 text-green-100 text-base mb-1">
                                        {line.includes('✅') ? <span className="text-green-400 text-xl">✅</span> : null}
                                        <span>{line.replace('✅', '').trim()}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            }
                            // Other sections
                            const lines = section.split('\n');
                            // Emoji color mapping
                            const emojiColor = {
                              '😊': 'text-yellow-300',
                              '💬': 'text-pink-300',
                              '⭐': 'text-blue-300',
                              '💡': 'text-green-300',
                            };
                            const emoji = lines[0].slice(0,2).trim();
                            return (
                              <div key={idx} className="mb-6">
                                <div className={`text-lg font-bold mb-1 flex items-center gap-2 ${emojiColor[emoji] || 'text-indigo-200'}`}>
                                  <span className="text-2xl">{emoji}</span>
                                  <span>{lines[0].slice(2)}</span>
                                </div>
                                {/* Summary line */}
                                {lines[1] && lines[1].toLowerCase().startsWith('summary:') && (
                                  <div className="italic text-indigo-200 mb-1 pl-2">{lines[1].replace('Summary:', '').trim()}</div>
                                )}
                                <ul className="list-none pl-0">
                                  {lines.slice(2).map((line, i) => {
                                    if (line.startsWith('🟢')) {
                                      return <li key={i} className="flex items-center gap-2 text-green-400 text-base mb-1"><span className="text-lg">🟢</span><span>{line.replace('🟢', '').trim()}</span></li>;
                                    }
                                    if (line.startsWith('🟠')) {
                                      return <li key={i} className="flex items-center gap-2 text-orange-300 text-base mb-1"><span className="text-lg">🟠</span><span>{line.replace('🟠', '').trim()}</span></li>;
                                    }
                                    return <li key={i} className="text-indigo-100 text-base leading-relaxed mb-1 pl-6">{line.replace(/^•/, '').trim()}</li>;
                                  })}
                                </ul>
                              </div>
                            );
                          }) : (
                            <div className="text-indigo-100 text-base leading-relaxed mb-2 whitespace-pre-line">{feedback}</div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="text-center text-gray-300">No feedback available.</div>
                    )}
                    <button
                      className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 text-white font-semibold shadow-lg hover:from-indigo-500 hover:to-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed mx-auto block"
                      onClick={() => {
                        setInterviewStarted(false);
                        setShowFeedback(false);
                        setChat([]);
                        setUserInput("");
                        setFeedback("");
                        setCurrentQuestion("");
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
              {!showFeedback && (
                <form
                  className="flex flex-col gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendAnswer();
                  }}
                >
                  <div className="flex gap-2">
                    <textarea
                      className="w-full p-2 rounded bg-gray-700 text-white resize-none"
                      rows={3}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your answer... or use the mic"
                      disabled={answerLoading}
                    />
                    <button
                      type="button"
                      onClick={handleRecordAnswer}
                      className={`px-4 py-2 rounded-lg font-semibold shadow-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${recording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                      disabled={answerLoading}
                      title={recording ? 'Stop Recording' : 'Start Recording'}
                    >
                      {recording ? (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><rect x="6" y="6" width="8" height="8" rx="2"/></svg>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 15a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a1 1 0 1 1 2 0c0 3.866-3.134 7-7 7s-7-3.134-7-7a1 1 0 1 1 2 0c0 2.757 2.243 5 5 5s5-2.243 5-5z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-md py-2 transition-all duration-300"
                    disabled={answerLoading || !userInput.trim()}
                  >
                    {answerLoading ? "Submitting..." : "Submit Answer"}
                  </button>
                </form>
              )}
              <button
                className="mt-6 px-6 py-2 rounded-full bg-gradient-to-r from-red-400 to-pink-500 text-white font-semibold shadow-lg hover:from-red-500 hover:to-pink-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ letterSpacing: '0.03em', fontSize: '1.1rem' }}
                onClick={() => {
                  if (!showFeedback) handleEndInterview();
                  else {
                    setInterviewStarted(false);
                    setShowFeedback(false);
                    setChat([]);
                    setUserInput("");
                    setFeedback("");
                    setCurrentQuestion("");
                  }
                }}
                disabled={answerLoading}
              >
                {showFeedback ? "Close" : "End Interview"}
              </button>
            </div>
          </div>
        )}
      </div>
      <style>
        {`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </section>
  );
}
