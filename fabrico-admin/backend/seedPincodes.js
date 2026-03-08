// server/seedPincodes.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pincode from './models/Pincode.js';

dotenv.config();

const pincodes = [
  {
    pincode: '415603',
    city: 'Pedhambe',
    taluka: 'Chiplun',
    district: 'Ratnagiri',
    state: 'Maharashtra'
  },
  {
    pincode: '415604',
    city: 'Kherdi',
    taluka: 'Chiplun',
    district: 'Ratnagiri',
    state: 'Maharashtra'
  },
  {
    pincode: '415605',
    city: 'Chiplun',
    taluka: 'Chiplun',
    district: 'Ratnagiri',
    state: 'Maharashtra'
  },
  {
    pincode: '415606',
    city: 'Sawarde',
    taluka: 'Chiplun',
    district: 'Ratnagiri',
    state: 'Maharashtra'
  },
  {
    pincode: '415709',
    city: 'Khed',
    taluka: 'Khed',
    district: 'Ratnagiri',
    state: 'Maharashtra'
  },
  {
    pincode: '415804',
    city: 'Devrukh',
    taluka: 'Sangameshwar',
    district: 'Ratnagiri',
    state: 'Maharashtra'
  },
  {
    pincode: '415712',
    city: 'Dapoli',
    taluka: 'Dapoli',
    district: 'Ratnagiri',
    state: 'Maharashtra'
  },
  {
    pincode: '415203',
    city: 'Sangameshwar',
    taluka: 'Sangameshwar',
    district: 'Ratnagiri',
    state: 'Maharashtra'
  }
];

async function seedPincodes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await Pincode.deleteMany({});
    await Pincode.insertMany(pincodes);
    console.log('✅ Pincodes seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding pincodes:', error);
    process.exit(1);
  }
}

seedPincodes();
