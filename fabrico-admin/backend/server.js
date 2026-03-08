import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/Products.js';
import { v2 as cloudinary } from 'cloudinary';
import pincodeRoutes from './routes/PincodeRoutes.js';
import orderRoutes from './routes/orders.js'
import User from './models/User.js';
import riderRoutes from './routes/riderRoutes.js';
import Admin from './models/Admin.js';
import reviewRoutes from './routes/reviewRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

//creating admin
// const createAdmin = async () => {
//   await Admin.create({
//     email: 'palkaronkar65@gmail.com',
//     password: 'Harsh@8646',
//     isVerified: true
//   });
//   console.log('Admin user created');
// };
// createAdmin();

app.use(cors({
  origin: '*', // Your Vite frontend URL
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/pincodes', pincodeRoutes);
app.use('/api/orders', orderRoutes);
app.use("/api/riders", riderRoutes);
app.use('/api/reviews', reviewRoutes);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.name === 'TimeoutError') {
    return res.status(504).json({ 
      error: 'Upload timeout - please try again with smaller files' 
    });
  }
  console.error('Server error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});
