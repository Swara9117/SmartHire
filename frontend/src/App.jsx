import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TechnicalInterview from './pages/TechnicalInterview';
import HRInterview from './pages/HRInterview';
import GDPractice from './pages/GDPractice';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import VerifyOtpRegister from './pages/VerifyOtpRegister';
import ResetPassword from './pages/ResetPassword';
import VirtualWorkSim from './pages/VirtualWorkSim';
import NavBar from './components/NavBar';
import Footer from './components/Common/Footer';
import Setting from './pages/Settings';
import DashboardHomePage from './pages/DashboardHomePage';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <NavBar />
          
          {/* Main content */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/technical-interview" element={<TechnicalInterview />} />
              <Route path="/hr-interview" element={<HRInterview />} />
              <Route path="/gd-rooms" element={<GDPractice />} />
              <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp/:emailid" element={<VerifyOTP />} />
              <Route path="/verify-register-otp/:emailid" element={<VerifyOtpRegister />} />
              <Route path="/reset-password/:emailid" element={<ResetPassword />} />
              <Route path="/setting" element={<Setting />} />
              <Route path="/dashboard-home" element={<DashboardHomePage />} />
              <Route path="/virtual-office" element={<VirtualWorkSim />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
