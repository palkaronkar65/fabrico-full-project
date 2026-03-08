import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
   name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Address fields that can be added later
  address: [{
  name: String,
  mobile: String,
  pincode: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  taluka: String,       // Add this new field
  district: String,     // Add this new field
  state: String,
  landmark: String,
  alternatePhone: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  addressType: {
    type: String,
    enum: ['Home', 'Work'],
    default: 'Home'
  },
  isDefault: Boolean
}],
    resetPasswordOtp: {
    type: String
  },
  resetPasswordOtpExpiry: {
    type: Date
  },
  isLoggedIn: {
    type: Boolean,
    default: false,
  },
cart: [{
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  }
}],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

export default User;