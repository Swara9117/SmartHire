import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    emailid: '',
    password: '',
    role: '',
  });

  const sendOtpRegister = async (userData) => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:4000/auth/sendOtp-register', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("OTP sent successfully!");
        navigate(`/verify-register-otp/${userData.emailid}`);
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields are filled
    if (!formData.username || !formData.emailid || !formData.password || !formData.role) {
      alert("Please fill in all fields");
      return;
    }

    // Send OTP for registration
    await sendOtpRegister(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-4xl font-bold text-indigo-400 mb-6 text-center">Create an Account</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            className="p-3 bg-gray-700 border border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-300"
            type="text"
            name="username"
            placeholder="Full Name"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <input
            className="p-3 bg-gray-700 border border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-300"
            type="email"
            name="emailid"
            placeholder="Email Address"
            value={formData.emailid}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <div className="relative">
            <input
              className="p-3 bg-gray-700 border border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-300 w-full pr-12"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-indigo-400"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <Eye size={24} />
              ) : (
                <EyeOff size={24} />
              )}
            </span>
          </div>
          <select
            className="p-3 bg-gray-700 border border-indigo-400 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            disabled={isLoading}
          >
            <option value="">Select Role</option>
            <option value="Candidate">Candidate</option>
            <option value="Recruiter">Recruiter</option>
          </select>
          <button
            type="submit"
            className={`mt-4 p-3 rounded-lg font-semibold text-white uppercase tracking-wide transition-colors ${
              isLoading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Sending OTP...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
