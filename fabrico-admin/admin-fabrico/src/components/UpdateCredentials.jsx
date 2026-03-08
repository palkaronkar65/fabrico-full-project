import { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock } from 'react-feather';
import { useAuth } from '../context/AuthContext';

export default function UpdateCredentials() {
  const { admin, setAdmin } = useAuth();

  // Email Update State
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailMessage('');

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/update-email`,
        { email: admin.email, newEmail, currentPassword: emailPassword }
      );

      setEmailMessage('Email updated successfully');
      setAdmin({ ...admin, email: newEmail });

      setNewEmail('');
      setEmailPassword('');
    } catch (err) {
      setEmailError(err.response?.data?.error || 'Failed to update email');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/update-password`,
        { email: admin.email, currentPassword, newPassword }
      );

      setPasswordMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to update password');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Account Settings</h1>
        <p className="text-gray-600 mt-2">Update your email and password</p>
      </div>

      {/* TWO COLUMN WRAPPER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

        {/* ---------------- EMAIL UPDATE ---------------- */}
        <div className="bg-white p-5 md:p-7 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">

          <div className="flex items-center mb-5">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Mail className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Update Email Address</h2>
          </div>

          {emailMessage && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-5 border border-green-200 flex items-center">
              <i className="fas fa-check-circle mr-2"></i>
              {emailMessage}
            </div>
          )}
          {emailError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-5 border border-red-200 flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {emailError}
            </div>
          )}

          <form onSubmit={handleEmailUpdate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type={showEmailPassword ? 'text' : 'password'}
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowEmailPassword(!showEmailPassword)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showEmailPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center"
            >
              <Mail className="mr-2" size={18} />
              Update Email
            </button>
          </form>
        </div>

        {/* ---------------- PASSWORD UPDATE ---------------- */}
        <div className="bg-white p-5 md:p-7 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">

          <div className="flex items-center mb-5">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <Lock className="text-purple-600" size={20} />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Change Password</h2>
          </div>

          {passwordMessage && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-5 border border-green-200 flex items-center">
              <i className="fas fa-check-circle mr-2"></i>
              {passwordMessage}
            </div>
          )}
          {passwordError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-5 border border-red-200 flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordUpdate} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showCurrent ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showNew ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showConfirm ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center"
            >
              <Lock className="mr-2" size={18} />
              Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
