// import React from 'react';

// const Login = () => (
//   <div className="p-10 max-w-md mx-auto">
//     <h2 className="text-3xl text-blue-400 mb-4 text-center">Login</h2>
//     <form className="flex flex-col gap-4">
//       <input className="p-2 bg-gray-800 border border-blue-400" type="text" placeholder="Username or Email" />
//       <input className="p-2 bg-gray-800 border border-blue-400" type="password" placeholder="Password" />
//       <select className="p-2 bg-gray-800 border border-blue-400">
//         <option>Candidate</option>
//         <option>Recruiter</option>
//       </select>
//       <button className="p-2 bg-blue-500 text-white hover:bg-blue-600">Login</button>
//     </form>
//   </div>
// );

// export default Login;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ emailid: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await authService.login(formData.emailid, formData.password);
      
      if (response.success) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        navigate("/dashboard");
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error');
      console.error(err);
    }
  };

  return (
    <div className="p-10 max-w-md mx-auto">
      <h2 className="text-3xl text-blue-400 mb-4 text-center">Login</h2>
      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">
          {error}
        </div>
      )}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          name="emailid"
          onChange={handleChange}
          value={formData.emailid}
          className="p-2 bg-gray-800 border border-blue-400"
          type="text"
          placeholder="Email"
          required
        />
        <input
          name="password"
          onChange={handleChange}
          value={formData.password}
          className="p-2 bg-gray-800 border border-blue-400"
          type="password"
          placeholder="Password"
          required
        />
        <button 
          type="submit"
          className="p-2 bg-blue-500 text-white hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
