import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // 🔹 User who placed the order
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // 🔹 Items in the order
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        variantIndex: { type: Number }, // only admin tracks product variant index
        quantity: { type: Number, required: true },
        priceAtOrder: { type: Number, required: true }, // price locked at time of order
      },
    ],

    // 🔹 Shipping address
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
    cancellationReason: String,
    cancellationRequested: { type: Boolean, default: false },

    // 🔹 Tracking
    trackingNumber: String,
    estimatedDelivery: Date,

    // 🔹 Delivery partner assignment (for Rider dashboard)
    inBucket: { type: Boolean, default: false },
    assignedTo: {
      riderId: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", default: null },
      riderName: { type: String, default: null },
      assignedAt: { type: Date, default: null },
      deliveredAt: { type: Date, default: null },
      completed: { type: Boolean, default: false },
    },

    // 🔹 Timeline tracking (for analytics & logs)
    placedAt: { type: Date, default: Date.now },
    packedAt: Date,
    shippedAt: Date,
    outForDeliveryAt: Date,
    deliveredAt: Date,

    // 🔹 Return & Refund lifecycle
    returnStatus: {
      type: String,
      enum: [
        "Return Requested",
        "Return Approved / Pickup Scheduled",
        "Return Picked Up",
        "Return in Transit",
        "Return Completed",
        "Refund Initiated",
        "Refund Completed",
      ],
      default: null,
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

    // 🔹 Geo tracking (optional for live location tracking)
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: [Number], // [lng, lat]
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
