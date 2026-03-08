const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendOtpEmail } = require('../utils/emailService');

// Temporary OTP storage for registration (use Redis in production)
const registrationOtps = new Map();

// Registration OTP Send
router.post('/send-registration-otp', async (req, res) => {
  try {
    console.log("Incoming /send-registration-otp body:", req.body);

    const { email } = req.body || {};
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Valid email is required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    // Store OTP temporarily
    registrationOtps.set(email, { otp, expiry });

    // Send email
    await sendOtpEmail(email, otp);

    res.json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Registration OTP Verify
router.post('/verify-registration', async (req, res) => {
  try {
    console.log("Incoming /verify-registration body:", req.body);

    const { email, otp, name, phone, password } = req.body || {};
    if (!email || !otp || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check OTP from temporary storage
    const storedOtp = registrationOtps.get(email);
    if (!storedOtp || storedOtp.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check expiry
    if (Date.now() > storedOtp.expiry) {
      registrationOtps.delete(email);
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Create new verified user
    const user = new User({
      name,
      email,
      phone,
      password,
      isVerified: true
    });
    await user.save();

    // Clear OTP
    registrationOtps.delete(email);

    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot Password OTP Send
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.json({ success: true, message: 'If this email exists, an OTP has been sent' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user doesn't exist
      return res.json({ success: true, message: 'If this email exists, an OTP has been sent' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000;

    // Store OTP in user document
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = expiry;
    await user.save();

    await sendOtpEmail(email, otp);

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset Password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body || {};
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Verify OTP
    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check expiry
    if (Date.now() > user.resetPasswordOtpExpiry) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpiry = undefined;
      await user.save();
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Update password and clear OTP
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
