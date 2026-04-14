import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authService } from "../services/api";
import { Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const { emailid } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authService.resetPassword(emailid, newPassword);

      if (response.msg) {
        toast.success(response.msg);
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      const errorMessage = error.response?.data?.message || "Something went wrong. Try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-4xl font-bold text-indigo-400 mb-6 text-center">
          Reset Password
        </h2>
        <p className="text-gray-400 mb-6 text-center">
          Enter your new password for <span className="font-semibold text-indigo-300">{emailid}</span>
        </p>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={resetPassword}>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              className="p-3 bg-gray-700 border border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-300 w-full pr-12"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span
              onClick={toggleShowPassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-indigo-400"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <Eye size={20} />
              ) : (
                <EyeOff size={20} />
              )}
            </span>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              className="p-3 bg-gray-700 border border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-300 w-full pr-12"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              onClick={toggleShowConfirmPassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-indigo-400"
              title={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <Eye size={20} />
              ) : (
                <EyeOff size={20} />
              )}
            </span>
          </div>

          <button 
            className="mt-4 p-3 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg font-semibold text-white uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;