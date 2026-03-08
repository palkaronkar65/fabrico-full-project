// server/models/Pincode.js
const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema({
  pincode:   { type: String, required: true, unique: true },
  city:      { type: String, required: true },
  taluka:    { type: String, required: true },
  district:  { type: String, required: true },
  state:     { type: String, required: true },
  deliveryAvailable: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.models.Pincode || mongoose.model('Pincode', pincodeSchema);
