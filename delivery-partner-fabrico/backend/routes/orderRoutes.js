const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");

const router = express.Router();

/*
================================================
GET ALL ORDERS
================================================
*/
router.get("/", async (req, res) => {
  try {

    const orders = await Order.find({})
      .select(
        "user shippingAddress totalAmount orderStatus items assignedTo inBucket returnStatus createdAt paymentMethod"
      )
      .populate("user", "name address")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

const formattedOrders = orders.map((order) => {

  const address = order.shippingAddress || {};

  const addressString = address.addressLine1
    ? `${address.addressLine1}, ${address.city}, ${address.state} - ${address.pincode}`
    : "N/A";

  return {
    _id: order._id,
    customerName: order.user?.name || address.name || "N/A",
    address: addressString,
    status: order.orderStatus,
    createdAt: order.createdAt,
    totalAmount: order.totalAmount,
    items: order.items,
    paymentMethod: order.paymentMethod,
    inBucket: order.inBucket,
    assignedTo: order.assignedTo,
    returnStatus: order.returnStatus,
    shippingAddress: order.shippingAddress
  };

});

    res.json(formattedOrders);

  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/*
================================================
TOGGLE BUCKET
================================================
*/
router.post("/bucket/:orderId/toggle", async (req, res) => {
  try {

    const { riderId, riderName } = req.body;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Remove from same rider bucket
    if (order.inBucket && order.assignedTo?.riderId?.toString() === riderId) {

      order.inBucket = false;

      order.assignedTo = {
        riderId: null,
        riderName: null,
        assignedAt: null,
        deliveredAt: null,
        completed: false,
      };

      if (!order.returnStatus) order.returnStatus = "N/A";

      await order.save();

      return res.json({
        success: true,
        message: "Order removed",
        order,
      });
    }

    // Block if already in another rider bucket
    if (order.inBucket && order.assignedTo?.riderId?.toString() !== riderId) {
      return res.status(400).json({
        error: `Order already in bucketlist of rider ${order.assignedTo?.riderName || "Unknown"}`,
      });
    }

    // Assign order
    order.inBucket = true;

    order.assignedTo = {
      riderId,
      riderName,
      assignedAt: new Date(),
      deliveredAt: null,
      completed: false,
    };

    if (!order.returnStatus) order.returnStatus = "N/A";

    await order.save();

    res.json({
      success: true,
      message: "Order added",
      order,
    });

  } catch (err) {
    console.error("Toggle bucket error:", err);
    res.status(500).json({ error: err.message || "Failed to toggle bucket" });
  }
});

/*
================================================
UPDATE RETURN STATUS
================================================
*/
router.post("/:id/return-status", async (req, res) => {
  try {

    const { id } = req.params;
    const { returnStatus } = req.body;

    if (!returnStatus) {
      return res.status(400).json({ error: "returnStatus is required" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.returnStatus = returnStatus;

    await order.save();

    res.json({
      success: true,
      order,
    });

  } catch (err) {
    console.error("Error updating returnStatus:", err);
    res.status(500).json({ error: "Server error updating returnStatus" });
  }
});

module.exports = router;