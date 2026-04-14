import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import heroImage from "../assets/Heroimage.jpg";
import groupImg from "../assets/GD.jpg";
import behavioralImg from "../assets/Behaviour.jpg";
import mockImg from "../assets/AI.jpg";
import resumeImg from "../assets/Resume.jpg";

const HomePage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth(); // Assuming useAuth exposes isLoggedIn correctly

  return (
    <section className="text-gray-300 bg-gray-900 min-h-screen relative overflow-hidden">
      {/* Hero Section */}
      <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center justify-center relative z-10">
        <div
          className="w-full max-w-3xl flex flex-col items-center text-center animate-fadeInUp opacity-0"
          style={{ animationDelay: "0.2s", animationFillMode: "forwards", animationDuration: "1.2s" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-6">
            <span className="text-indigo-400">✨ Next Generation Platform</span>
          </div>

          <h1 className="title-font sm:text-6xl text-5xl mb-6 font-bold text-indigo-400 drop-shadow-md tracking-tight leading-tight">
            Welcome to NextHire
          </h1>
          <p className="mb-8 leading-relaxed text-lg text-gray-400 max-w-xl">
            Master the art of interviewing and thrive in simulated work environments. NextHire empowers you to build confidence, communication, and technical acumen — before the real job begins.
          </p>

          <div className="flex justify-center w-full">
            {!isLoggedIn && (
              <>
                <button
                  onClick={() => navigate("/signup")}
                  className="inline-flex justify-center text-white bg-indigo-600 border-0 py-3.5 px-8 rounded-xl text-lg font-semibold shadow-md hover:shadow-indigo-500/30 transition-all duration-300 hover:bg-indigo-700 focus:outline-none"
                >
                  Join the Arena
                </button>
                <button
                  onClick={() => navigate("/signin")}
                  className="ml-4 inline-flex justify-center text-indigo-300 bg-gray-800 border border-indigo-600 py-3.5 px-8 rounded-xl text-lg font-semibold hover:bg-gray-700 hover:text-white transition-all duration-300 focus:outline-none"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section className="text-gray-400 body-font relative z-10">
        <div className="container px-5 py-24 mx-auto">
          <div className="flex flex-col text-center w-full mb-20 animate-fadeInUp opacity-0" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
            <h1 className="sm:text-4xl text-3xl font-bold title-font mb-4 text-white">
              Explore Our Services
            </h1>
            <p className="lg:w-2/3 mx-auto leading-relaxed text-base">
              Your one-stop platform for mastering technical, HR, and mock interviews with AI-powered tools and expert insights.
            </p>
          </div>

          <div className="flex flex-wrap -m-4">
            {["Group Discussions", "Behavioral Practice", "AI-Powered Mocks", "Resume Analyzer"].map((title, idx) => {
              const subtitles = ["TECHNICAL", "HR ROUND", "MOCK INTERVIEWS", "RESUME"];
              const descriptions = [
                "Sharpen your communication and collaboration skills through realistic group discussion scenarios.",
                "Prepare for HR interviews by mastering storytelling, situational responses, and soft skills.",
                "Simulate interviews with AI avatars to get instant feedback on tone, confidence, and structure.",
                "Get actionable insights and improvements to optimize your resume for tech recruiters."
              ];
              const images = [groupImg, behavioralImg, mockImg, resumeImg];

              return (
                <div
                  key={idx}
                  className="xl:w-1/4 md:w-1/2 p-4"
                  style={{ animation: `fadeInUp 0.6s ease forwards`, animationDelay: `${0.2 + idx * 0.15}s`, opacity: 0 }}
                >
                  <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl transition-all duration-300 ease-in-out hover:-translate-y-2 hover:bg-gray-700 hover:shadow-lg cursor-pointer h-full flex flex-col">
                    <div className="overflow-hidden rounded-xl mb-6">
                      <img
                        className="h-40 w-full object-cover object-center transition-transform duration-500 hover:scale-110"
                        src={images[idx]}
                        alt={title}
                      />
                    </div>
                    <h3 className="tracking-widest text-indigo-400 text-xs font-bold title-font mb-2">
                      {subtitles[idx]}
                    </h3>
                    <h2 className="text-xl text-white font-semibold title-font mb-3">
                      {title}
                    </h2>
                    <p className="leading-relaxed text-gray-400 text-sm flex-grow">{descriptions[idx]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <style>
        {`
          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(30px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fadeInUp {
            animation-name: fadeInUp;
          }
        `}
      </style>
    </section>
  );
};

export default HomePage;
