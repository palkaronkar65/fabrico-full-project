// backend/models/RiderLocation.js
const mongoose = require("mongoose");

const riderLocationSchema = new mongoose.Schema({
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rider",
    required: true,
    unique: true, // one doc per rider
  },
  coords: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  updatedAt: { type: Date, default: Date.now, index: true }, // indexed for fast recent queries
});

// update 'updatedAt' on save/update
riderLocationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("RiderLocation", riderLocationSchema);