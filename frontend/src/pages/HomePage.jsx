import React from "react";
import { useNavigate } from "react-router-dom";
import { FaLinkedin } from "react-icons/fa";
import heroImage from "../assets/Heroimage.jpg";
import Amisha from "../assets/Amisha.jpg";
import Ishita from "../assets/Ishita.jpg";
import Khusi from "../assets/Khusi.jpg";
import Lipsita from "../assets/Lipsita.jpg";
import groupImg from "../assets/GD.jpg";
import behavioralImg from "../assets/Behaviour.jpg";
import mockImg from "../assets/AI.jpg";
import resumeImg from "../assets/Resume.jpg";
import Avani from "../assets/Avani.jpg";
import virtualOfficeImg from "../assets/VirtualOffice.avif"; 

const teamMembers = [
  {
    name: "Lipsita Mahapatro",
    role: "Frontend Developer",
    description:
      "Expert in building responsive, accessible, and high-performance web interfaces.",
    image: Lipsita,
    linkedin: "https://www.linkedin.com/in/lipsita-mahapatro-70a6b92a5/",
  },
  {
    name: "Khusi Garg",
    role: "AI/ML Engineer",
    description:
      "Designs and trains intelligent systems for mock interviews and resume analysis.",
    image: Khusi,
    linkedin: "https://www.linkedin.com/in/khushi-garg-670126281/",
  },
  {
    name: "Amisha Gupta",
    role: "Backend Developer",
    description:
      "Builds robust and scalable APIs for the InterviewVerse platform.",
    image: Amisha,
    linkedin: "https://www.linkedin.com/in/amisha-gupta-567566291/",
  },
  {
    name: "Avani Mathur",
    role: "UI/UX Designer",
    description:
      "Designs intuitive user experiences and modern UI systems for seamless navigation.",
    image: Avani,
    linkedin: "https://www.linkedin.com/in/avani-mathur-555a9a287/",
  },
  {
    name: "Ishita Rane",
    role: "ML Engineer",
    description:
      "Builds smart systems for real-time feedback and AI-driven interview analysis.",
    image: Ishita,
    linkedin: "https://www.linkedin.com/in/ishita-rane-9225b0282/",
  },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <section className="text-gray-300 bg-black body-font min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
        <div
          className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center animate-fadeInUp opacity-0"
          style={{ animationDelay: "0.2s", animationFillMode: "forwards", animationDuration: "1.2s" }}
        >
          <h1 className="title-font sm:text-5xl text-4xl mb-6 font-bold text-white drop-shadow-xl">
            Welcome to NextHire
          </h1>
         <p className="mb-8 leading-relaxed text-lg text-gray-400 max-w-xl">
        Master the art of interviewing and thrive in simulated work environments. NextHire empowers you to build confidence, communication, and technical acumen — before the real job begins.
        </p>



          <div className="flex justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="inline-flex text-white bg-indigo-600 border-0 py-3 px-8 rounded-lg text-lg font-semibold shadow-xl hover:shadow-indigo-700 transition duration-300 ease-in-out hover:bg-indigo-700 focus:outline-none"
            >
              Sign Up
            </button>
            <button
              onClick={() => navigate("/signin")}
              className="ml-4 inline-flex text-indigo-400 border border-indigo-600 py-3 px-8 rounded-lg text-lg font-semibold hover:bg-indigo-600 hover:text-white transition duration-300 ease-in-out shadow-md focus:outline-none"
            >
              Sign In
            </button>
          </div>
        </div>

        <div
          className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6 flex justify-center items-center animate-fadeInUp opacity-0"
          style={{ animationDelay: "0.5s", animationFillMode: "forwards", animationDuration: "1.2s" }}
        >
          <img
            className="rounded-full shadow-[0_10px_30px_rgba(99,102,241,0.6)] w-80 h-80 object-cover transition-transform duration-700 ease-in-out hover:scale-105"
            src={heroImage}
            alt="InterviewVerse Hero"
          />
        </div>
      </div>

      {/* Services Section */}
      <section className="text-gray-400 body-font bg-black">
        <div className="container px-5 py-24 mx-auto">
          <div className="flex flex-wrap w-full mb-20">
            <div className="lg:w-1/2 w-full mb-6 lg:mb-0">
              <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-white">
                Explore Our Services
              </h1>
              <div className="h-1 w-20 bg-indigo-500 rounded"></div>
            </div>
            <p className="lg:w-1/2 w-full leading-relaxed text-gray-400 text-opacity-90">
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
                  style={{ animation: `fadeInUp 0.5s ease forwards`, animationDelay: `${idx * 0.15}s`, opacity: 0 }}
                >
                  <div className="bg-gray-800 bg-opacity-40 p-6 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-indigo-700/50 cursor-pointer">
                    <img
                      className="h-40 rounded w-full object-cover object-center mb-6"
                      src={images[idx]}
                      alt={title}
                    />
                    <h3 className="tracking-widest text-indigo-400 text-xs font-medium title-font">
                      {subtitles[idx]}
                    </h3>
                    <h2 className="text-lg text-white font-medium title-font mb-4">
                      {title}
                    </h2>
                    <p className="leading-relaxed text-base">{descriptions[idx]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Virtual Work Simulation Section */}
      <section className="bg-gray-950 text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="text-4xl font-bold mb-4">
              Experience the Virtual Work Simulation
            </h2>
            <p className="text-gray-400 text-lg mb-6">
              Step into a full day-in-the-life virtual tech office. Powered by GenAI, avatars, STT and TTS, this simulation mimics real job workflows — from standups and manager check-ins to fun hours and peer chats.
              <br /><br />
              With CultureMatch AI and dynamic coding challenges, recruiters evaluate real-time behavior, communication, and decision-making — not just resumes. Perfect for students & professionals to showcase how they actually work.
            </p>
            <button
              onClick={() => window.open("https://teamflow-phi.vercel.app/", "_blank")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg rounded-lg font-semibold shadow-lg hover:shadow-indigo-700 transition"
            >
              Enter VirtualOffice
            </button>
          </div>

          <div className="lg:w-1/2 flex justify-center">
            <img
              src={virtualOfficeImg}
              alt="Virtual Work Office"
              className="rounded-xl shadow-[0_10px_30px_rgba(99,102,241,0.6)] w-full max-w-md object-cover hover:scale-105 transition-transform duration-500 ease-in-out"
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-black text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Meet Our Team
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            We're a group of developers, designers, and visionaries passionate about transforming interview preparation.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-2xl p-6 text-center shadow-md hover:shadow-[0_0_25px_rgba(99,102,241,0.7)] transition-transform transform hover:scale-105 duration-300"
            >
              <img
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-700"
                src={member.image}
                alt={member.name}
              />
              <h3 className="mt-6 text-xl font-semibold text-white">{member.name}</h3>
              <p className="text-white mb-2">{member.role}</p>
              <p className="text-gray-400 text-sm mb-4">{member.description}</p>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black text-white hover:bg-indigo-600 transition"
              >
                <FaLinkedin className="text-xl" />
              </a>
            </div>
          ))}
        </div>
      </section>

      <style>
        {`
          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(20px);
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

