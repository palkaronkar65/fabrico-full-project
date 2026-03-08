// models/Order.js (Client)
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // 🔹 User placing the order
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // 🔹 Items ordered
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        variantIndex: { type: Number }, // only if variants exist
        quantity: { type: Number, required: true },
        priceAtOrder: { type: Number, required: true }, // snapshot price
      },
    ],

    // 🔹 Shipping details
    shippingAddress: { type: mongoose.Schema.Types.Mixed, required: true },

    // 🔹 Payment
    paymentMethod: { type: String, enum: ["COD", "UPI"], required: true },
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    totalAmount: { type: Number, required: true },

    // 🔹 Order lifecycle
    orderStatus: {
      type: String,
      enum: [
        "Order Placed",
        "Packed / Processing",
        "Shipped / Dispatched",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Order Placed",
    },

    // 🔹 Cancellation
    cancellationReason: { type: String, default: "" },
    cancellationRequested: { type: Boolean, default: false },

    // 🔹 Tracking & delivery info
    trackingNumber: String,
    estimatedDelivery: Date,

    // 🔹 Rider / Delivery partner assignment
    inBucket: { type: Boolean, default: false },
    bucketHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rider" }], // optional
    assignedTo: {
      riderId: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", default: null },
      riderName: { type: String, default: null },
      assignedAt: { type: Date, default: null },
      deliveredAt: { type: Date, default: null },
      completed: { type: Boolean, default: false },
    },

    // 🔹 Timeline tracking
    placedAt: { type: Date, default: Date.now },
    packedAt: Date,
    shippedAt: Date,
    outForDeliveryAt: Date,
    deliveredAt: Date,

    // 🔹 Return & Refund lifecycle
   returnStatus: {
  type: String,
  enum: [
    'Return Requested',
    'Return Approved / Pickup Scheduled',
    'Return Picked Up',
    'Return in Transit',
    'Return Completed',
    'Refund Initiated',
    'Refund Completed',
    'N/A',   // included in enum
  ],
  default: 'N/A'  // ✅ safe default
},
    returnTimeline: {
      requestedAt: Date,
      approvedAt: Date,
      pickedUpAt: Date,
      inTransitAt: Date,
      completedAt: Date,
      refundInitiatedAt: Date,
      refundCompletedAt: Date,
    },

    // 🔹 Geo tracking (for map)
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: [Number], // [lng, lat]
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
