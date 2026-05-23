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
import CandidateSignup from './pages/CandidateSignup';
import CandidateProfile from './pages/CandidateProfile';
import CandidateLeaderboard from './pages/CandidateLeaderboard';
import ProtectedRoute from './components/ProtectedRoute';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import MyApplications from './pages/MyApplications';
import JobRecommendations from './pages/JobRecommendations';
import CandidateResumeProfile from './pages/CandidateResumeProfile';
import RecruiterDashboard from './pages/RecruiterDashboard';
import PostJob from './pages/PostJob';
import ManageApplicants from './pages/ManageApplicants';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <div className="flex flex-col min-h-screen">
          <NavBar />

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
              <Route path="/candidate-signup" element={<CandidateSignup />} />
              <Route path="/candidate-profile/:emailid" element={<CandidateProfile />} />
              <Route path="/leaderboards" element={<CandidateLeaderboard />} />

              {/* SmartHire Job Portal */}
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/my-applications" element={
                <ProtectedRoute roles={['Candidate']}>
                  <MyApplications />
                </ProtectedRoute>
              } />
              <Route path="/job-recommendations" element={
                <ProtectedRoute roles={['Candidate']}>
                  <JobRecommendations />
                </ProtectedRoute>
              } />
              <Route path="/candidate-profile-setup" element={
                <ProtectedRoute roles={['Candidate']}>
                  <CandidateResumeProfile />
                </ProtectedRoute>
              } />

              {/* Recruiter */}
              <Route path="/recruiter/dashboard" element={
                <ProtectedRoute roles={['Recruiter']}>
                  <RecruiterDashboard />
                </ProtectedRoute>
              } />
              <Route path="/recruiter/post-job" element={
                <ProtectedRoute roles={['Recruiter']}>
                  <PostJob />
                </ProtectedRoute>
              } />
              <Route path="/recruiter/applicants/:jobId" element={
                <ProtectedRoute roles={['Recruiter']}>
                  <ManageApplicants />
                </ProtectedRoute>
              } />

              {/* Admin */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute roles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute roles={['Admin']}>
                  <ManageUsers />
                </ProtectedRoute>
              } />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
