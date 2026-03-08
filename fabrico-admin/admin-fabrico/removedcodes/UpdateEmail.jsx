import { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from 'react-feather';

export default function UpdateEmail() {
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/update-email`,
        { newEmail, currentPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Email updated successfully');
      setNewEmail('');
      setCurrentPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update email');
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Update Email</h2>
      {message && <div className="bg-green-100 text-green-700 p-2 rounded mb-2">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-2">{error}</div>}
      <form onSubmit={handleEmailUpdate} className="space-y-4">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="New email"
          className="w-full p-2 border rounded"
          required
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            className="w-full p-2 border rounded pr-10"
            required
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit">
          Update Email
        </button>
      </form>
    </div>
  );
}
