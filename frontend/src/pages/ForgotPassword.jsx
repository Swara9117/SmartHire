import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authService } from "../services/api";

const ForgotPassword = () => {
  const [emailid, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (e) => setEmail(e.target.value);
  
  const sendOtp = async () => {
    if (!emailid) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await authService.sendOtp(emailid);
      
      if (response.message) {
        toast.success(response.message);
        navigate(`/verify-otp/${emailid}`);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      const errorMessage = error.response?.data?.message || "An error occurred. Please try again later.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendOtp();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-4xl font-bold text-indigo-400 mb-6 text-center">
          Forgot Password?
        </h2>
        <p className="text-gray-400 mb-6 text-center">
          Enter your email and we'll send you an OTP.
        </p>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}
        
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            className="p-3 bg-gray-700 border border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-300"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={emailid}
            onChange={handleEmailChange}
            required
          />
          <button
            type="submit"
            className="mt-4 p-3 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg font-semibold text-white uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/signin")}
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            ⬅ Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

