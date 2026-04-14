import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signin = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();
  const [formData, setFormData] = useState({ emailid: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailid: formData.emailid, password: formData.password }),
      });
      const data = await response.json();
      if (data.success) {
        setIsLoggedIn(true, data.user, data.token);
        navigate('/dashboard-home');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-4xl font-bold text-indigo-400 mb-6 text-center">
          Sign In to Your Account
        </h2>
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">{error}</div>
        )}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            className="p-3 bg-gray-700 border border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-300"
            type="email"
            name="emailid"
            placeholder="Email Address"
            value={formData.emailid}
            onChange={handleChange}
            required
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
          <button
            type="submit"
            className="mt-4 p-3 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg font-semibold text-white uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link 
            to="/forgot-password" 
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            Forgot Password?
          </Link>
        </div>
        
        <div className="mt-2 text-center">
          <span className="text-gray-400 text-sm">Don't have an account? </span>
          <Link 
            to="/signup" 
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signin;

