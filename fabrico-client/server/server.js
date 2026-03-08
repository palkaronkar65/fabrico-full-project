require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');

const app = express();

// =====================================
// ✅ Middleware
// =====================================
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================
// ✅ Database Connection
// =====================================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


// =====================================
// ✅ Nodemailer Transporter
// =====================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,  // your gmail
    pass: process.env.EMAIL_PASS,  // app password
  },
});

// =====================================
// ✅ INTEGRATED CONTACT FORM API
// =====================================
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message)
    return res.status(400).json({ error: "All fields required" });

  try {
    await transporter.sendMail({
      from: `"Fabrico Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `New Message from ${name} | Fabrico Contact Form`,

      // ⭐ Beautiful HTML Styled Email ⭐
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 25px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">

            <h2 style="color: #000; margin-bottom: 10px;">📩 New Contact Message</h2>
            <p style="color: #555; margin-bottom: 20px;">
              You received a new message from your <strong>Fabrico Contact Form</strong>.
            </p>

            <div style="padding: 15px; background: #fafafa; border-radius: 8px; border: 1px solid #eee;">
              <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 8px 0;"><strong>Message:</strong></p>
              <div style="white-space: pre-line; padding: 10px 12px; background: #fff; border-radius: 6px; border: 1px solid #ddd;">
                ${message}
              </div>
            </div>

            <p style="margin-top: 25px; font-size: 12px; text-align: center; color: #999;">
              © ${new Date().getFullYear()} Fabrico — Contact Form Notification
            </p>
          </div>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// =====================================
// ✅ Existing Routes (UNCHANGED)
// =====================================
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cartRoutes');
const addressRoutes = require('./routes/addressRoutes');
const pincodeRoutes = require('./routes/PincodeRoutes');
const orderRoutes = require('./routes/orderRoutes');
const riderRoutes = require('./routes/riderRoutes');
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require('./routes/reviewRoutes');

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/pincodes', pincodeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/rider', riderRoutes);
app.use("/api/payment", paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// =====================================
// ✅ Cloudinary Config
// =====================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =====================================
// ✅ Error Handler
// =====================================
app.use((err, req, res, next) => {
  console.error("Error middleware:", err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// =====================================
// ✅ Start Server
// =====================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
