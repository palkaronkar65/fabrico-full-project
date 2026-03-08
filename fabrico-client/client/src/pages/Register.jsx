import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // not used but kept for compatibility
  const API_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const sendOtp = async () => {
    if (!formData.email) {
      return setError('Email is required');
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/send-registration-otp`,
        { email: formData.email },
        { headers: { "Content-Type": "application/json" } }
      );
      setIsOtpSent(true);
      setSuccess('OTP sent to your email');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtpAndRegister = async (e) => {
    e.preventDefault();
    
    if (!formData.otp) {
      return setError('Please enter the OTP');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/verify-registration`,
        {
          email: formData.email,
          otp: formData.otp,
          name: formData.name,
          phone: formData.phone,
          password: formData.password
        },
        { headers: { "Content-Type": "application/json" } }
      );
      
      // ✅ Success – navigate to login page with a success message
      navigate('/login', { 
        state: { successMessage: 'Registration successful! Please login.' } 
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Fabrico Account</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {success}
        </div>
      )}
      
      
      <form onSubmit={verifyOtpAndRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name*</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Email*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              disabled={isOtpSent}
            />
          </div>
          <button
            type="button"
            onClick={sendOtp}
            disabled={isOtpSent || isLoading}
            className={`px-3 py-2 text-sm rounded ${isOtpSent ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            {isLoading ? 'Sending...' : isOtpSent ? 'OTP Sent' : 'Send OTP'}
          </button>
        </div>

        {isOtpSent && (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">OTP*</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
                disabled={isOtpVerified}
              />
            </div>
           <button
              type="button"
              onClick={() => setIsOtpVerified(true)} // Simplified for demo
              disabled={isOtpVerified || isLoading}
              className={`px-3 py-2 text-sm rounded ${isOtpVerified ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              {isLoading ? 'Verifying...' : isOtpVerified ? 'Verified' : 'Verify'}
            </button> 
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700">Password*</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded pr-10"
            required
            minLength="6"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center pt-5"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700">Confirm Password*</label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 border rounded pr-10"
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
          disabled={!isOtpVerified || isLoading}
          className={`w-full py-2 px-4 rounded transition ${(!isOtpVerified || isLoading) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;