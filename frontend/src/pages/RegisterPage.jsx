import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Loader2 } from 'lucide-react';

const API_BASE_URL = 'https://fdb-node.vercel.app/api'; 
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


// 🔑 MODIFIED: Accepts setIsLoggedIn prop
const RegisterPage = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);
    await sleep(500); 

    try {
      // Backend (server.js) now returns { token, email, message } on success
      const response = await axios.post(`${API_BASE_URL}/register`, { email, password });
      
      const { token, message: serverMessage } = response.data;
      
      // 🔑 AUTO-LOGIN STEPS
      localStorage.setItem('authToken', token);
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true); // Update global state
      
      setMessage(serverMessage || 'Registration successful. Logging you in...');
      
      // Navigate to /home (protected route logic in App.jsx handles it from here)
      navigate('/home'); 

    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong during registration. Please try again.');
      // Clean up on failure
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('authToken');
      setIsLoggedIn(false);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-2xl rounded-xl border border-gray-200">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create an account</h2>
        
        {/* 🔑 NEW: Message Display */}
        {message && (
          <div className={`p-3 rounded-lg text-sm font-medium ${message.includes('successful') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
            {message}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email Input */}
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            disabled={isLoading}
            className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base transition duration-150" 
          />
          {/* Password Input */}
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            disabled={isLoading}
            className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base transition duration-150" 
          />
          
          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-lg"
          >
            {isLoading ? (<Loader2 className="w-5 h-5 animate-spin mr-2" />) : (<User className="w-5 h-5 mr-2" />)}
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150">Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;