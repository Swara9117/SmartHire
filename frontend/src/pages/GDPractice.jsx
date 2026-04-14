import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaRobot, FaPlay, FaStop, FaClock, FaInfoCircle, FaMicrophone, FaKeyboard, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';

// Simplified Avatar Component
const Avatar = ({ name, color }) => (
  <div className={`w-16 h-16 ${color} rounded-full shadow-md flex items-center justify-center text-white font-bold text-2xl`}>
    {name[0]}
  </div>
);

const GDPractice = () => {
  // Steps data
  const steps = [
    {
      title: "Step 1: Topic Introduction",
      description: "Understand the given topic and gather your thoughts.",
      icon: <FaUser className="w-5 h-5" />
    },
    {
      title: "Step 2: Express Your Views",
      description: "Speak clearly and make meaningful contributions.",
      icon: <FaRobot className="w-5 h-5" />
    },
    {
      title: "Step 3: Listen Actively",
      description: "Pay attention to others' points.",
      icon: <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10H2"></path>
        <path d="M12 16v-4"></path>
        <path d="M12 8h.01"></path>
      </svg>
    },
    {
      title: "Step 4: Summarize",
      description: "Conclude by summarizing key points.",
      icon: <FaClock className="w-5 h-5" />
    },
    {
      title: "Finish: Reflect & Improve",
      description: "Reflect on your performance. Note what worked well and areas to improve for next time.",
      icon: (
        <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
          <path d="M22 4L12 14.01l-3-3"></path>
        </svg>
      ),
    },
  ];

  // State management
  const [state, setState] = useState({
    showGDRoom: false,
    company: '',
    jobProfile: '',
    gdTopic: '',
    isGeneratingTopic: false,
    isStarted: false,
    timeLeft: 600, // 10 minutes
    participants: [
      { id: 1, name: "Alex", isAI: true, position: "left", personality: "analytical", color: "bg-blue-500" },
      { id: 2, name: "Priya", isAI: true, position: "top", personality: "supportive", color: "bg-purple-500" },
      { id: 3, name: "Jordan", isAI: true, position: "right", personality: "challenging", color: "bg-rose-500" },
      { id: 4, name: "You", isAI: false, position: "bottom", color: "bg-green-500" }
    ],
    messages: [],
    inputMessage: '',
    activeSpeaker: null,
    userInitiated: false,
    userConcluded: false
  });

  const [inputMode, setInputMode] = useState('text');
  const [isListening, setIsListening] = useState(false);
  const [voiceInput, setVoiceInput] = useState('');
  const [report, setReport] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  const speechSynthRef = useRef(null);
  const utteranceRef = useRef(null);

  // Initialize speech synthesis
  useEffect(() => {
    speechSynthRef.current = window.speechSynthesis;
    
    // Some browsers need this to load voices properly
    const loadVoices = () => {
      const voices = speechSynthRef.current.getVoices();
      if (voices.length === 0) {
        speechSynthRef.current.onvoiceschanged = loadVoices;
      }
    };
    loadVoices();
    
    return () => {
      if (speechSynthRef.current.speaking) {
        speechSynthRef.current.cancel();
      }
    };
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  // Timer effect
  useEffect(() => {
    if (state.isStarted && state.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (state.timeLeft === 0) {
      endGDSession();
    }

    return () => clearInterval(timerRef.current);
  }, [state.isStarted, state.timeLeft]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Speak text using Web Speech API
  const speak = (text, rate = 1, pitch = 1) => {
    if (!audioEnabled || !text || !speechSynthRef.current) return;
    
    // Cancel any ongoing speech
    speechSynthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    // Try to select a voice
    const voices = speechSynthRef.current.getVoices();
    if (voices.length > 0) {
      const preferredVoice = voices.find(v => v.name.includes('Google') || 
                            v.name.includes('English') || 
                            v.default) || voices[0];
      utterance.voice = preferredVoice;
    }

    utterance.onerror = (event) => {
      console.error('SpeechSynthesisError:', event);
    };

    speechSynthRef.current.speak(utterance);
  };

  // Speak the GD topic when it's generated
  useEffect(() => {
    if (state.gdTopic && !state.showGDRoom) {
      speak(`Your group discussion topic is: ${state.gdTopic}`);
    }
  }, [state.gdTopic, state.showGDRoom]);

  // Speak AI messages when they're added
  useEffect(() => {
    if (state.messages.length > 0 && audioEnabled) {
      const lastMessage = state.messages[state.messages.length - 1];
      
      // Only speak AI messages that aren't typing indicators
      if (lastMessage.isAI && !lastMessage.isTyping && lastMessage.text) {
        const participant = state.participants.find(p => p.id === lastMessage.participantId);
        if (participant) {
          // Adjust voice characteristics based on participant
          let rate = 1;
          let pitch = 1;
          
          switch (participant.personality) {
            case 'analytical':
              rate = 0.9;
              pitch = 0.9;
              break;
            case 'supportive':
              rate = 1;
              pitch = 1.1;
              break;
            case 'challenging':
              rate = 1.1;
              pitch = 0.95;
              break;
            default:
              rate = 1;
              pitch = 1;
          }
          
          speak(`${participant.name} says: ${lastMessage.text}`, rate, pitch);
        }
      }
    }
  }, [state.messages, audioEnabled]);

  // Toggle audio functionality
  const toggleAudio = () => {
    if (audioEnabled && speechSynthRef.current?.speaking) {
      speechSynthRef.current.cancel();
    }
    setAudioEnabled(prev => !prev);
    
    // Re-speak the topic if enabling audio and we're on the setup screen
    if (!audioEnabled && state.gdTopic && !state.showGDRoom) {
      speak(`Your group discussion topic is: ${state.gdTopic}`);
    }
  };

  // API Calls to Backend (now connected to Gemini)
  const fetchGDTopic = async (company, jobProfile) => {
    const response = await fetch('http://localhost:4000/api/gd/generate-topic', {
      method: 'POST',
      headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({ company, jobProfile })
    });
    return await response.json();
  };

  const fetchAIResponse = async (topic, lastUserMessage, participant) => {
    const response = await fetch('http://localhost:4000/api/gd/generate-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        lastUserMessage,
        participantName: participant.name,
        personality: participant.personality
      })
    });
    return await response.json();
  };

  const fetchInitialMessages = async (topic) => {
    const response = await fetch('http://localhost:4000/api/gd/generate-initial-messages', {
      method: 'POST',
      headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({ topic })
    });
    return await response.json();
  };

  // Generate GD topic
  const generateGDTopic = async () => {
    if (!state.company || !state.jobProfile) {
      alert("Please enter company and job profile");
      return;
    }

    setState(prev => ({ ...prev, isGeneratingTopic: true }));

    try {
      const { topic } = await fetchGDTopic(state.company, state.jobProfile);
      setState(prev => ({ ...prev, gdTopic: topic }));
    } catch (error) {
      console.error("Failed to generate topic:", error);
      setState(prev => ({ 
        ...prev, 
        gdTopic: `How should ${state.company} innovate in ${state.jobProfile} roles?` 
      }));
    } finally {
      setState(prev => ({ ...prev, isGeneratingTopic: false }));
    }
  };

  // Start GD session with improved initial messages
  const startGDSession = async () => {
    if (!state.gdTopic) {
      alert("Please generate a topic first");
      return;
    }
    
    setState(prev => ({
      ...prev,
      showGDRoom: true,
      isStarted: true,
      timeLeft: 600,
      messages: [],
      activeSpeaker: null,
      userInitiated: false,
      userConcluded: false
    }));

    // Get dynamic initial messages from API
    const { messages: initialMessages } = await fetchInitialMessages(state.gdTopic);
    
    // Show typing indicators and then messages with delays
    const showMessageSequence = async () => {
      for (let i = 0; i < initialMessages.length; i++) {
        const msg = initialMessages[i];
        
        // Show typing indicator
        setState(prev => ({ ...prev, activeSpeaker: msg.participantId }));
        addMessage(msg.participantId, "", true);
        
        // Wait for typing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Add actual message
        addMessage(msg.participantId, msg.text);
        
        // Clear active speaker
        setState(prev => ({ ...prev, activeSpeaker: null }));
        
        // Wait before next message
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    };

    showMessageSequence();
  };

  const generateAIResponse = async (participantId) => {
    const participant = state.participants.find(p => p.id === participantId);
    if (!participant || !participant.isAI) return;

    setState(prev => ({ ...prev, activeSpeaker: participantId }));
    addMessage(participantId, "", true);

    try {
      const lastUserMessage = [...state.messages].reverse().find(m => !m.isAI)?.text || "";
      const { response } = await fetchAIResponse(state.gdTopic, lastUserMessage, participant);

      // Clean Gemini output
      let cleanResponse = response
        .replace(`${participant.name}:`, '')
        .replace(/^["']|["']$/g, '')
        .replace(/\*\*/g, '') // Remove markdown bold
        .replace(/```/g, '')  // Remove code blocks
        .trim();

      await new Promise(resolve => setTimeout(resolve, 2000));
      addMessage(participantId, cleanResponse);

    } catch (error) {
      console.error("AI Response Error:", error);
      const fallback = `As ${participant.name}, I believe this discussion about ${state.gdTopic} is important.`;
      addMessage(participantId, fallback);
    } finally {
      setState(prev => ({ ...prev, activeSpeaker: null }));
    }
  };

  // Add message to discussion
  const addMessage = (participantId, text, isTyping = false) => {
    const participant = state.participants.find(p => p.id === participantId);
    if (!participant) return;

    setState(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: isTyping ? `typing-${Date.now()}` : Date.now(),
          participantId,
          text,
          isAI: participant.isAI,
          isTyping,
          timestamp: isTyping ? "" : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          personality: participant.personality
        }
      ]
    }));

    if (!isTyping) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleSendMessage = (e, voiceText = null) => {
    e.preventDefault();
    const message = voiceText || state.inputMessage;
    if (!message.trim()) return;

    // Check if this is the first message (initiation)
    const isFirstMessage = state.messages.filter(m => !m.isAI).length === 0;
    if (isFirstMessage) {
      setState(prev => ({ ...prev, userInitiated: true }));
    }

    // Check if this is a conclusion message (last 60 seconds)
    const isConclusion = state.timeLeft <= 60 && 
                        (message.toLowerCase().includes('summary') || 
                         message.toLowerCase().includes('conclusion') ||
                         message.toLowerCase().includes('overall'));
    if (isConclusion) {
      setState(prev => ({ ...prev, userConcluded: true }));
    }

    addMessage(4, message);
    setState(prev => ({ ...prev, inputMessage: '' }));
    setVoiceInput('');

    // AI responds after a delay - improved rotation logic
    setTimeout(() => {
      const aiParticipants = state.participants.filter(p => p.isAI);
      
      // Get the last AI speaker
      const lastMessages = [...state.messages].reverse();
      const lastAISpeaker = lastMessages.find(m => m.isAI)?.participantId;
      
      // Find the index of the last AI speaker
      const lastIndex = lastAISpeaker 
        ? aiParticipants.findIndex(p => p.id === lastAISpeaker) 
        : -1;
      
      // Select next participant in rotation
      const nextIndex = (lastIndex + 1) % aiParticipants.length;
      const nextParticipant = aiParticipants[nextIndex];
      
      generateAIResponse(nextParticipant.id);
    }, 1500 + Math.random() * 1500);
  };

  // Generate performance report
  const generateReport = () => {
    const userMessages = state.messages.filter(m => m.participantId === 4);
    const totalMessages = state.messages.filter(m => m.isAI).length;
    
    // 1. Initiation Score
    const initiationScore = state.userInitiated ? 1 : 0;

    // 2. Content Quality (analyze message relevance and depth)
    let contentScore = 0;
    userMessages.forEach(msg => {
      if (msg.text.length > 50 && msg.text.split(' ').length > 8) contentScore += 1;
    });
    contentScore = Math.min(3, contentScore / 2); // Cap at 3

    // 3. Communication Skills (analyze message structure)
    const commScore = userMessages.some(m => 
      m.text.includes('because') || 
      m.text.includes('therefore') ||
      m.text.split(',').length > 2
    ) ? 2 : 1;

    // 4. Engagement & Collaboration
    const engagementScore = userMessages.some(m => 
      m.text.includes('agree') || 
      m.text.includes('disagree') ||
      m.text.includes('what Alex said') ||
      m.text.includes('Priya mentioned')
    ) ? 2 : 0.5;

    // 5. Conclusion Effort
    const conclusionScore = state.userConcluded ? 1 : 0;

    // 6. Time Management
    const timeScore = userMessages.length >= 2 && 
                     userMessages.length <= 5 ? 1 : 0.5;

    // Calculate total
    const totalScore = initiationScore + contentScore + commScore + 
                      engagementScore + conclusionScore + timeScore;

    // Behavioral Tags
    const tags = [];
    if (contentScore >= 2.5) tags.push('🧠 Analytical Thinker');
    if (initiationScore === 1) tags.push('🎯 Sharp Initiator');
    if (engagementScore >= 1.5) tags.push('🤝 Collaborative Communicator');
    if (userMessages.length > 5) tags.push('🗣️ Dominates Too Much');
    if (userMessages.length < 2) tags.push('🛑 Needs More Focus');

    return {
      scores: {
        initiation: initiationScore,
        content: contentScore,
        communication: commScore,
        engagement: engagementScore,
        conclusion: conclusionScore,
        timeManagement: timeScore,
        total: totalScore
      },
      tags,
      feedback: [
        initiationScore ? "✅ Great initiation!" : "⚠️ Try to initiate discussion more confidently",
        contentScore >= 2 ? "✅ Excellent content quality" : "📝 Work on deeper analysis",
        commScore >= 1.5 ? "✅ Clear communication" : "🗣️ Practice structuring your points",
        engagementScore >= 1.5 ? "✅ Good collaboration" : "🤝 Engage more with others' points",
        conclusionScore ? "✅ Effective conclusion" : "🔚 Practice summarizing discussions",
        timeScore ? "✅ Balanced participation" : "⏱️ Manage your speaking turns better"
      ]
    };
  };

  // End GD session
  const endGDSession = () => {
    clearInterval(timerRef.current);
    
    // Generate report before resetting
    const gdReport = generateReport();
    setReport(gdReport);
    
    setState(prev => ({
      ...prev,
      isStarted: false,
      showGDRoom: false,
      timeLeft: 600,
      messages: [],
      activeSpeaker: null,
      userInitiated: false,
      userConcluded: false
    }));
  };

  // Initialize voice recognition
  useEffect(() => {
    if (inputMode === 'voice') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          setVoiceInput(transcript);
        };

        recognitionRef.current.onend = () => {
          if (isListening) {
            recognitionRef.current.start();
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [inputMode, isListening]);

  // Toggle voice listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (voiceInput.trim()) {
        handleSendMessage({ preventDefault: () => {} }, voiceInput);
        setVoiceInput('');
      }
    } else {
      setVoiceInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Get participant position class
  const getPositionClass = (position) => {
    switch (position) {
      case "left": return "absolute left-11 top-0.40 -translate-y-1/2";
      case "top": return "absolute top-2 left-0.25 -translate-x-1/2";
      case "right": return "absolute right-11 top-0.40 -translate-y-1/2";
      case "bottom": return "absolute bottom-1 left-0.25 -translate-x-1/2";
      default: return "";
    }
  };

  // Personality colors
  const getPersonalityColor = (personality) => {
    switch (personality) {
      case "analytical": return "bg-blue-500";
      case "supportive": return "bg-purple-500";
      case "challenging": return "bg-rose-500";
      default: return "bg-green-500";
    }
  };

  // Report Card Component
  const ReportCard = ({ report }) => (
    <div className="bg-gray-800 rounded-xl p-6 mt-6 border border-gray-700">
      <h3 className="text-2xl font-bold text-white mb-4">GD Performance Report</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="font-semibold text-white mb-2">Initiation</h4>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-indigo-400">{report.scores.initiation}/1</span>
            <span className="ml-2 text-sm">{report.scores.initiation ? "✅ Confident start" : "⚠️ Could improve"}</span>
          </div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="font-semibold text-white mb-2">Content Quality</h4>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-indigo-400">{report.scores.content.toFixed(1)}/3</span>
            <span className="ml-2 text-sm">{report.scores.content >= 2 ? "✅ Insightful points" : "📝 Needs more depth"}</span>
          </div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="font-semibold text-white mb-2">Communication</h4>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-indigo-400">{report.scores.communication.toFixed(1)}/2</span>
            <span className="ml-2 text-sm">{report.scores.communication >= 1.5 ? "✅ Clear expression" : "🗣️ Could be clearer"}</span>
          </div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="font-semibold text-white mb-2">Engagement</h4>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-indigo-400">{report.scores.engagement.toFixed(1)}/2</span>
            <span className="ml-2 text-sm">{report.scores.engagement >= 1.5 ? "✅ Great collaboration" : "🤝 Engage more"}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-indigo-900 bg-opacity-20 p-4 rounded-lg mb-4">
        <h4 className="font-semibold text-white mb-2">Total Score</h4>
        <div className="text-4xl font-bold text-center text-indigo-300">
          {report.scores.total.toFixed(1)}/10
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold text-white mb-2">Feedback</h4>
        <ul className="space-y-2">
          {report.feedback.map((item, i) => (
            <li key={i} className="flex items-start">
              <span className="mr-2 mt-1">{item.includes('✅') ? '✅' : item.includes('⚠️') ? '⚠️' : '🔹'}</span>
              <span>{
                item.replace(/✅/g, '')
                .replace(/⚠️/g, '')
                .replace(/🔹/g, '')
                .replace(/📝/g, '')
                .replace(/🗣️/g, '')
                .replace(/🤝/g, '')
                .replace(/🔚/g, '')
                .replace(/⏱️/g, '')
                .trim()
              }</span>
            </li>
          ))}
        </ul>
      </div>
      
      {report.tags.length > 0 && (
        <div>
          <h4 className="font-semibold text-white mb-2">Behavioral Tags</h4>
          <div className="flex flex-wrap gap-2">
            {report.tags.map((tag, i) => (
              <span key={i} className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render input section
  const renderInputSection = () => (
    <div className="space-y-2">
      <div className="flex justify-center space-x-4">
        <button
          type="button"
          onClick={() => setInputMode('text')}
          className={`px-4 py-2 rounded-lg flex items-center ${inputMode === 'text' ? 'bg-indigo-600' : 'bg-gray-700'}`}
        >
          <FaKeyboard className="mr-2" /> Type
        </button>
        <button
          type="button"
          onClick={() => setInputMode('voice')}
          className={`px-4 py-2 rounded-lg flex items-center ${inputMode === 'voice' ? 'bg-indigo-600' : 'bg-gray-700'}`}
          disabled={!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)}
          title={!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) ? 
                 "Voice input not supported in your browser" : ""}
        >
          <FaMicrophone className="mr-2" /> Speak
        </button>
      </div>

      <form onSubmit={handleSendMessage} className="flex bg-gray-700 rounded-lg overflow-hidden border border-gray-600">
        <input
          type="text"
          value={inputMode === 'text' ? state.inputMessage : voiceInput}
          onChange={(e) => inputMode === 'text' 
            ? setState(prev => ({ ...prev, inputMessage: e.target.value })) 
            : setVoiceInput(e.target.value)}
          className="flex-grow px-4 py-3 bg-gray-700 focus:outline-none text-white placeholder-gray-400"
          placeholder={inputMode === 'text' 
            ? "Type your message..." 
            : (isListening ? "Listening... Speak now" : "Click microphone to speak")}
          disabled={inputMode === 'voice'}
        />
        
        {inputMode === 'text' ? (
          <button
            type="submit"
            disabled={!state.inputMessage.trim() || !state.isStarted}
            className="bg-indigo-600 hover:bg-indigo-700 px-5 flex items-center justify-center disabled:opacity-50 transition-all"
          >
            <IoMdSend size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleListening}
            disabled={!state.isStarted}
            className={`px-5 flex items-center justify-center transition-all ${
              isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <FaMicrophone size={20} className={isListening ? 'animate-pulse' : ''} />
          </button>
        )}
      </form>

      {inputMode === 'voice' && (
        <div className="text-center text-sm text-gray-400">
          {isListening ? (
            <div className="flex items-center justify-center">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Listening... Speak now
            </div>
          ) : voiceInput ? (
            "Click microphone again to send"
          ) : (
            "Click microphone to start speaking"
          )}
        </div>
      )}
    </div>
  );

  return (
    <section className="text-gray-300 bg-gray-900 min-h-screen">
      <div className="container px-5 py-12 mx-auto">
        {!state.showGDRoom ? (
          <div className="flex flex-wrap w-full mb-16">
            <div className="lg:w-2/5 md:w-1/2 md:pr-10 md:py-6">
              {steps.map((step, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  key={idx}
                  className={`flex relative ${idx !== steps.length - 1 ? "pb-12" : ""}`}
                >
                  {idx !== steps.length - 1 && (
                    <div className="h-full w-10 absolute inset-0 flex items-center justify-center">
                      <div className="h-full w-1 bg-gray-700 pointer-events-none"></div>
                    </div>
                  )}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 inline-flex items-center justify-center text-white relative z-10">
                    {step.icon}
                  </div>
                  <div className="flex-grow pl-4">
                    <h2 className="font-semibold title-font text-sm text-white mb-1 tracking-wider">
                      {step.title}
                    </h2>
                    <p className="leading-relaxed text-gray-400">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:w-3/5 md:w-1/2 object-cover object-center rounded-lg shadow-2xl md:mt-0 mt-12"
              src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80"
              alt="Group Discussion"
            />
          </div>
        ) : null}

        <div className="flex justify-center">
          {!state.showGDRoom ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-2xl border border-gray-700"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Start Group Discussion Practice</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Company</label>
                  <input
                    type="text"
                    value={state.company}
                    onChange={(e) => setState(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Google, Amazon"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Job Profile</label>
                  <input
                    type="text"
                    value={state.jobProfile}
                    onChange={(e) => setState(prev => ({ ...prev, jobProfile: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Product Manager"
                  />
                </div>
                
                <button
                  onClick={generateGDTopic}
                  disabled={!state.company || !state.jobProfile || state.isGeneratingTopic}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center disabled:opacity-50"
                >
                  {state.isGeneratingTopic ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Unique Topic...
                    </>
                  ) : "Generate Discussion Topic"}
                </button>
              </div>
              
              {state.gdTopic && (
                <div className="mt-6 p-4 bg-gray-700 rounded-lg border-l-4 border-indigo-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-400 font-medium mb-1">GENERATED TOPIC</p>
                      <p className="text-xl text-indigo-300 font-medium">{state.gdTopic}</p>
                    </div>
                    <button
                      onClick={toggleAudio}
                      className={`p-2 rounded-full hover:bg-gray-600 transition-colors ${audioEnabled ? 'text-green-400' : 'text-gray-400'}`}
                      title={audioEnabled ? "Mute audio" : "Enable audio"}
                    >
                      {audioEnabled ? <FaVolumeUp size={20} /> : <FaVolumeMute size={20} />}
                    </button>
                  </div>
                </div>
              )}
              
              {state.gdTopic && (
                <button
                  onClick={startGDSession}
                  className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-lg font-bold flex items-center justify-center"
                >
                  <FaPlay className="mr-2" /> Start Group Discussion
                </button>
              )}
            </motion.div>
          ) : (
            <div className="w-full max-w-3xl bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
              <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-700">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full mr-2">
                      <FaUser className="text-sm" />
                    </span>
                    Group Discussion Simulation
                  </h2>
                  <p className="text-indigo-400 text-sm mt-1">{state.company} • {state.jobProfile}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleAudio}
                    className={`p-2 rounded-full hover:bg-gray-700 transition-colors ${audioEnabled ? 'text-green-400' : 'text-gray-400'}`}
                    title={audioEnabled ? "Mute audio" : "Enable audio"}
                  >
                    {audioEnabled ? <FaVolumeUp size={18} /> : <FaVolumeMute size={18} />}
                  </button>
                  
                  <div className="flex items-center text-yellow-400 bg-gray-800 px-3 py-1 rounded-full">
                    <FaClock className="mr-2" />
                    <span className="font-mono">{formatTime(state.timeLeft)}</span>
                  </div>
                  
                  <button
                    onClick={endGDSession}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center transition-all"
                  >
                    <FaStop className="mr-2" /> End Session
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 flex items-center">
                <FaInfoCircle className="mr-2" />
                Participants will type their messages in the discussion.
              </div>
              
              <div className="p-6">
                <div className="relative h-96 mb-8 bg-gray-900 rounded-3xl flex items-center justify-center overflow-hidden">
                  {/* Table (oval) */}
                  <div className="absolute w-[400px] h-[160px] bg-gradient-to-br from-gray-700 to-gray-800 rounded-full shadow-inner border border-gray-600 z-0" />

                  {/* Topic in center */}
                  <div className="absolute text-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="text-xs text-yellow-400 font-semibold mb-1">CURRENT TOPIC</div>
                    <div className="text-white font-bold text-md">
                      {state.gdTopic}
                    </div>
                  </div>

                  {/* Participants */}
                  {state.participants.map((participant) => (
                    <motion.div
                      key={participant.id}
                      className={`${getPositionClass(participant.position)} 
                        flex flex-col items-center transition-all duration-300 z-10`}
                      animate={{
                        scale: state.activeSpeaker === participant.id ? 1.1 : 1,
                        y: state.activeSpeaker === participant.id ? -5 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`relative mb-1 transition-all duration-300 ${state.activeSpeaker === participant.id ? 'ring-2 ring-white rounded-full' : ''}`}>
                        <Avatar name={participant.name} color={participant.color} />
                        {state.activeSpeaker === participant.id && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
                        )}
                      </div>
                      
                      <div className="text-center bg-gray-900 bg-opacity-80 px-2 py-1 rounded-md">
                        <span className="text-white font-medium text-sm">{participant.name}</span>
                        {participant.isAI && (
                          <span className="block text-xs text-gray-300 capitalize">{participant.personality}</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4 h-96 overflow-y-auto mb-4 border border-gray-600 shadow-inner">
                  {state.messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <div className="animate-pulse mb-2">🗣️</div>
                        <p>The discussion is starting...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {state.messages.map((message) => {
                          const participant = state.participants.find(p => p.id === message.participantId);
                          const isUser = participant && !participant.isAI;
                          
                          if (message.isTyping) {
                            return (
                              <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-start"
                              >
                                <div className={`max-w-xs rounded-xl px-4 py-3 ${getPersonalityColor(participant?.personality)}`}>
                                  <div className="flex space-x-1">
                                    <div className="w-2 h-2 rounded-full bg-white opacity-60 animate-bounce"></div>
                                    <div className="w-2 h-2 rounded-full bg-white opacity-60 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 rounded-full bg-white opacity-60 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          }
                          
                          return (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs md:max-w-md rounded-xl px-4 py-3 relative ${
                                  isUser
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : `${getPersonalityColor(participant?.personality)} rounded-bl-none`
                                } shadow-md`}
                              >
                                <div className="font-semibold flex items-center">
                                  <div className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center text-xs ${participant.color}`}>
                                    {participant.name[0]}
                                  </div>
                                  {participant.name}
                                  {participant?.isAI && (
                                    <span className="ml-2 text-xs opacity-70 capitalize">{participant.personality}</span>
                                  )}
                                </div>
                                <p className="mt-1 text-sm">{message.text}</p>
                                {message.timestamp && (
                                  <div className="text-xs opacity-70 mt-1 text-right">
                                    {message.timestamp}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                
                {renderInputSection()}
              </div>
            </div>
          )}
        </div>

        {report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <ReportCard report={report} />
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default GDPractice;
