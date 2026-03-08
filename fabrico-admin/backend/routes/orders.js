import express from 'express';
import Order from '../models/Order.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all orders with populated user and product data
router.get('/', async (req, res) => {
  const { from, to } = req.query;
  const filter = {};
  if (from || to) {
    filter.estimatedDelivery = {};
    if (from) filter.estimatedDelivery.$gte = new Date(from);
    if (to)   filter.estimatedDelivery.$lte = new Date(to);
  }
  const orders = await Order.find(filter)
    .populate('user','name mobile')
    .populate('items.product','name')
    .sort({ createdAt: -1 });
  // Build timestamps object
  const data = orders.map(o => ({
    ...o._doc,
    timestamps: {
      Placed: o.createdAt,
      Processing: o.updatedAt,       // you may store explicit times on status-change
      Shipped: o.shippedAt,
      'Out for Delivery': o.outForDeliveryAt,
      Delivered: o.deliveredAt
    }
  }));
  res.json({ success: true, data });
});

router.put('/:orderId', async (req, res) => {
  const { orderStatus, estimatedDelivery, paymentStatus, cancellationRequested } = req.body;
  const update = {};
if (orderStatus) {
  update.orderStatus = orderStatus;
  if (orderStatus === 'Order Placed') update.placedAt = new Date();
  if (orderStatus === 'Packed / Processing') update.packedAt = new Date();
  if (orderStatus === 'Shipped / Dispatched') update.shippedAt = new Date();
  if (orderStatus === 'Out for Delivery') update.outForDeliveryAt = new Date();
  if (orderStatus === 'Delivered') update.deliveredAt = new Date();
}
  if (estimatedDelivery) update.estimatedDelivery = new Date(estimatedDelivery);
  if (paymentStatus) update.paymentStatus = paymentStatus;
  if (cancellationRequested !== undefined) update.cancellationRequested = cancellationRequested;

  const order = await Order.findByIdAndUpdate(req.params.orderId, update, { new: true });
  res.json({ success: true, order });
});


// routes/orderRoutes.js
router.post("/:id/return-status", async (req, res) => {
  try {
    const { id } = req.params;
    const { returnStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { returnStatus },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json({ order });
  } catch (err) {
    console.error("Error updating return status:", err);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;