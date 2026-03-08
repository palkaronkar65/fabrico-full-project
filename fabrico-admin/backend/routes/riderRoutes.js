import express from "express";
import Rider from "../models/Rider.js";
import RiderLocation from "../models/RiderLocation.js";

const router = express.Router();

// Get all riders
router.get("/", async (req, res) => {
  try {
    const riders = await Rider.find();
    res.json(riders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch riders" });
  }
});

// Add new rider
router.post("/", async (req, res) => {
  try {
    const { username, password, name } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ error: "All fields required" });
    }
    const rider = new Rider({ username, password, name });
    await rider.save();
    res.status(201).json(rider);
  } catch (err) {
    res.status(500).json({ error: "Failed to add rider" });
  }
});

// Update rider name and password
router.put("/:id", async (req, res) => {
  try {
    const { name, password } = req.body;
    const rider = await Rider.findByIdAndUpdate(
      req.params.id,
      { name, password },
      { new: true }
    );
    if (!rider) return res.status(404).json({ error: "Rider not found" });
    res.json(rider);
  } catch (err) {
    res.status(500).json({ error: "Failed to update rider" });
  }
});

// Delete rider
router.delete("/:id", async (req, res) => {
  try {
    const rider = await Rider.findByIdAndDelete(req.params.id);
    if (!rider) return res.status(404).json({ error: "Rider not found" });
    res.json({ message: "Rider deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete rider" });
  }
});

// ✅ Update rider location
router.post("/:id/location", async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    if (lat == null || lng == null) {
      return res.status(400).json({ error: "lat/lng required" });
    }

    const updated = await RiderLocation.findOneAndUpdate(
      { rider: id },
      { coords: { lat, lng }, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, location: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update location" });
  }
});

// ✅ Get latest rider location
router.get("/:id/location", async (req, res) => {
  try {
    const { id } = req.params;
    const loc = await RiderLocation.findOne({ rider: id });
    if (!loc) return res.json({ success: true, location: null });

    res.json({
      success: true,
      location: {
        lat: loc.coords.lat,
        lng: loc.coords.lng,
        updatedAt: loc.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch location" });
  }
});

export default router;
