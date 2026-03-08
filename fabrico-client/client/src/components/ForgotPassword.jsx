import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP, 3 = new password
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      
      if (response.data.message === 'If this email exists, an OTP has been sent') {
        const userExists = await axios.get(`${API_URL}/api/users/check-email?email=${email}`);
        
        if (!userExists.data.exists) {
          return setError('This email is not registered');
        }
      }
      
      setStep(2);
      setMessage('OTP sent to your email');
    } catch (error) {
      if (error.response?.status === 404) {
        setError('This email is not registered');
      } else {
        setError(error.response?.data?.error || 'Failed to send OTP');
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      setStep(3);
      setMessage('Enter your new password');
    } catch (error) {
      setError('Invalid OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        email,
        otp,
        newPassword
      });
      setMessage(response.data.message);
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Password Recovery</h2>

        {message && <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{message}</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Send OTP
            </button>
            <div className="text-center mt-4">
              <Link to="/login" className="text-blue-500 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">OTP</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Verify OTP
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type={showNewPassword ? "text" : "password"}
                className="w-full p-2 border rounded pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={toggleNewPasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center pt-5"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full p-2 border rounded pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center pt-5"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}