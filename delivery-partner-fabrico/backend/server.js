require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const http = require("http");
const { Server } = require("socket.io");

// Load models
require("./models/Rider");
require("./models/RiderLocation");
require("./models/Order");
require("./models/Product");
require("./models/User");

const RiderLocation = require("./models/RiderLocation");

// Routes
const riderRoutes = require("./routes/riderRoutes");
const orderRoutes = require("./routes/orderRoutes");
const pincodesRoutes = require("./routes/pincodesRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");

const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// API routes
app.use("/api/rider", riderRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/pincodes", pincodesRoutes);
app.use("/api/delivery", deliveryRoutes);

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("⚡ Rider connected:", socket.id);

  socket.on("rider-location", async (data) => {
    try {
      const { riderId, lat, lng } = data;

      if (!riderId || lat === undefined || lng === undefined) {
        return;
      }

      await RiderLocation.findOneAndUpdate(
        { rider: riderId },
        {
          coords: { lat, lng },
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      // broadcast location
      io.emit("location-update", {
        riderId,
        lat,
        lng,
        updatedAt: new Date(),
      });

    } catch (err) {
      console.error("Location update error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Rider disconnected:", socket.id);
  });
});

// Mongo connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err));

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});