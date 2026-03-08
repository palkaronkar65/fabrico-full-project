import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { sendPasswordResetEmail } from '../utils/emailSender.js';

const router = express.Router();


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[LOGIN ATTEMPT] Email: ${email}`);

    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log(`[LOGIN FAILED] Admin not found`);
      return res.status(401).json({ error: 'Admin not found' });
    }

    if (!admin.isVerified) {
      console.log(`[LOGIN FAILED] Admin not verified`);
      return res.status(403).json({ error: 'Admin not verified' });
    }

    if (admin.password !== password) {
      console.log(`[LOGIN FAILED] Wrong password`);
      return res.status(401).json({ error: 'Wrong password' });
    }

    console.log(`[LOGIN SUCCESS] ${admin.email}`);
    return res.json({
      admin: {
        id: admin._id,
        email: admin.email
      }
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });

    const responseMessage = 'If this email exists, a reset email has been sent.';

    if (!admin) {
      return res.json({ success: true, message: responseMessage });
    }

    const newPassword = Math.random().toString(36).slice(-8);
    admin.password = newPassword;
    await admin.save();

    try {
      await sendPasswordResetEmail(email, newPassword);
    } catch (err) {
      console.error('Failed to send email:', err);
    }

    return res.json({ success: true, message: responseMessage });

  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

function generateSecurePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Update Email
router.post('/update-email', async (req, res) => {
  try {
    const { email, newEmail, currentPassword } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
   if (admin.password !== currentPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    if (await Admin.findOne({ email: newEmail })) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    admin.email = newEmail;
    await admin.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Update Password
router.post('/update-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    if (admin.password !== currentPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    admin.password = newPassword;
    await admin.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ error: 'Email not found Please re-login and retry' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Logout
router.post('/logout', async (req, res) => {
  try {
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;