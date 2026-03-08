import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendPasswordResetEmail = async (email, newPassword) => {
  await transporter.sendMail({
    from: `"Fabrico Admin Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Admin Password Reset',
    html: `
      <h2>Password Reset</h2>
      <p>Your new admin password is: <strong>${newPassword}</strong></p>
      <p>Please log in and change your password.</p>
    `
  });
};
