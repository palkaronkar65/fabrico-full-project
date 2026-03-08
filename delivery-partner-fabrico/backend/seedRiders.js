// seedRiders.js
require("dotenv").config();
const mongoose = require("mongoose");
const Rider = require("./models/Rider"); // <-- path correct to your model

// ⭐ EXACT previous rider data with same IDs
const ridersData = [
  {
    _id: "68d23748ac1a922890b207bc",
    username: "rider1",
    password: "pass1",
    name: "Raj Sharma"
  },
  {
    _id: "68d23748ac1a922890b207bf",
    username: "rider2",
    password: "pass2",
    name: "Vikram Singh"
  },
  {
    _id: "68d23748ac1a922890b207c2",
    username: "rider3",
    password: "pass3",
    name: "Sunil Kumar"
  }
];

(async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("🧹 Clearing existing riders...");
    await Rider.deleteMany({}); // remove old riders

    console.log("🚀 Seeding Riders...");
    for (const rider of ridersData) {
      await Rider.create({
        _id: rider._id,
        username: rider.username,
        password: rider.password,
        name: rider.name
      });
      console.log(`✔ Added: ${rider.username}`);
    }

    console.log("🎉 Rider Seeding Completed Successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
})();
