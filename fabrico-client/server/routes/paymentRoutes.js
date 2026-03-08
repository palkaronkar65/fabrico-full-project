// server/routes/paymentRoutes.js
const express = require("express");
const Razorpay = require("razorpay");
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    console.log("Razorpay Key:", process.env.RAZORPAY_KEY_ID); // 👈 Debug
    console.log("Amount received:", amount);

    if (!amount) {
      return res.status(400).json({ success: false, error: "Amount is required" });
    }

    const options = {
      amount: Math.round(amount * 100), // convert ₹ to paise
      currency: currency || "INR",
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    console.log("Order created:", order);

    res.json({ success: true, order });
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
