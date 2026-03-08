import mongoose from "mongoose";

const riderLocationSchema = new mongoose.Schema({
  rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", required: true },
  coords: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  updatedAt: { type: Date, default: Date.now }
});

const RiderLocation = mongoose.model("RiderLocation", riderLocationSchema);

export default RiderLocation;
