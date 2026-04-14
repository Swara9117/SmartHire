import React from "react";
import logo from '../../assets/logo.png';

export default function Footer() {
  return (
    <footer className="text-gray-400 bg-gray-900 body-font">
      <div className="container px-5 py-24 mx-auto flex md:items-center lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col">
        <div className="w-64 flex-shrink-0 md:mx-0 mx-auto text-center md:text-left md:mt-0 mt-10">
          <a className="flex title-font font-medium items-center md:justify-start justify-center text-white">
            <img
              src={logo}
              alt="InterviewVerse Logo"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="ml-3 text-xl">NextHire</span>
          </a>
          <p className="mt-2 text-sm text-gray-500">
            Empower your career journey with AI-powered insights and simulations.
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex-grow flex flex-wrap md:pr-20 -mb-10 md:text-left text-center order-first">
          {/* PRODUCT */}
          <div className="lg:w-1/4 md:w-1/2 w-full px-4">
            <h2 className="title-font font-medium text-white tracking-widest text-sm mb-3">PRODUCT</h2>
            <nav className="list-none mb-10 space-y-2">
              <li><a className="hover:text-white">Resume Analyzer</a></li>
              <li><a className="hover:text-white">Tech Interview</a></li>
              <li><a className="hover:text-white">HR Interview</a></li>
              <li><a className="hover:text-white">Group Discussion</a></li>
            </nav>
          </div>

          {/* COMPANY */}
          <div className="lg:w-1/4 md:w-1/2 w-full px-4">
            <h2 className="title-font font-medium text-white tracking-widest text-sm mb-3">COMPANY</h2>
            <nav className="list-none mb-10 space-y-2">
              <li><a className="hover:text-white">About Us</a></li>
              <li><a className="hover:text-white">Careers</a></li>
              <li><a className="hover:text-white">Partners</a></li>
              <li><a className="hover:text-white">Blog</a></li>
            </nav>
          </div>

          {/* SUPPORT */}
          <div className="lg:w-1/4 md:w-1/2 w-full px-4">
            <h2 className="title-font font-medium text-white tracking-widest text-sm mb-3">SUPPORT</h2>
            <nav className="list-none mb-10 space-y-2">
              <li><a className="hover:text-white">Help Center</a></li>
              <li><a className="hover:text-white">Documentation</a></li>
              <li><a className="hover:text-white">Privacy Policy</a></li>
              <li><a className="hover:text-white">Terms of Service</a></li>
            </nav>
          </div>

          {/* CONTACT */}
          <div className="lg:w-1/4 md:w-1/2 w-full px-4">
            <h2 className="title-font font-medium text-white tracking-widest text-sm mb-3">CONTACT</h2>
            <nav className="list-none mb-10 space-y-2">
              <li><a className="hover:text-white">Email: support@interviewverse.com</a></li>
              <li><a className="hover:text-white">LinkedIn</a></li>
              <li><a className="hover:text-white">Twitter</a></li>
              <li><a className="hover:text-white">Contact Form</a></li>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-800 bg-opacity-75">
        <div className="container mx-auto py-4 px-5 flex flex-wrap flex-col sm:flex-row">
          <p className="text-gray-400 text-sm text-center sm:text-left">
            © {new Date().getFullYear()} NextHire
          </p>
          <span className="inline-flex sm:ml-auto sm:mt-0 mt-2 justify-center sm:justify-start">
            <a className="text-gray-400 hover:text-white" href="#"><i className="fab fa-facebook-f w-5 h-5"></i></a>
            <a className="ml-3 text-gray-400 hover:text-white" href="#"><i className="fab fa-twitter w-5 h-5"></i></a>
            <a className="ml-3 text-gray-400 hover:text-white" href="#"><i className="fab fa-linkedin-in w-5 h-5"></i></a>
            <a className="ml-3 text-gray-400 hover:text-white" href="#"><i className="fab fa-github w-5 h-5"></i></a>
          </span>
        </div>
      </div>
    </footer>
  );
}
