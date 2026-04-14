import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authService } from "../services/api";

const VerifyOTP = () => {
  const { emailid } = useParams();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await authService.verifyOtp(emailid, otp);
      
      if (response.success) {
        toast.success(response.message);
        navigate(`/reset-password/${emailid}`);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      const errorMessage = error.response?.data?.message || "Invalid OTP. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.sendOtp(emailid);
      toast.success(response.message);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to resend OTP.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyOtp();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-4xl font-bold text-indigo-400 mb-6 text-center">
          Verify OTP
        </h2>
        <p className="text-gray-400 mb-6 text-center">
          Enter the 6-digit OTP sent to <span className="font-semibold text-indigo-300">{emailid}</span>
        </p>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}
        
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            className="p-3 bg-gray-700 border border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-300 text-center text-lg tracking-widest"
            type="text"
            name="otp"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={handleOtpChange}
            maxLength={6}
            required
          />
          <button
            type="submit"
            className="mt-4 p-3 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg font-semibold text-white uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={resendOtp}
            disabled={loading}
            className="text-indigo-400 hover:text-indigo-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Resend OTP
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            ⬅ Back to Forgot Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP; 