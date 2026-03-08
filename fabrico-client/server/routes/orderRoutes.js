// routes/orderRoutes.js
const express = require('express');
const mongoose = require('mongoose');

// Ensure User model is registered before any populate('user')
require('../models/User');

const Order = require('../models/Order');
const Product = require('../models/Product');

const router = express.Router();

// ————————————————————————————————————————————
// 1) Place new order (client-side)
// POST /api/orders
router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId, items, shippingAddress, paymentMethod } = req.body;
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new Error(`Product not found: ${item.productId}`);

      const variant = product.variants[item.variantIndex];
      if (!variant) throw new Error(`Variant not found for product: ${product.name}`);
      if (variant.quantity < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

      variant.quantity -= item.quantity;
      await product.save({ session });

      orderItems.push({
        product: item.productId,
        variantIndex: item.variantIndex,
        quantity: item.quantity,
        priceAtOrder: product.price
      });
      totalAmount += product.price * item.quantity;
    }

    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount,
      location: shippingAddress.location,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid'
    });

    await order.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      orderId: order._id,
      message: 'Order placed successfully!'
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to place order'
    });
  } finally {
    session.endSession();
  }
});

// ————————————————————————————————————————————
// 2) Fetch orders for a given user
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate({ path: 'items.product', select: 'name variants' })
      .sort({ createdAt: -1 });

    const formatted = orders.map(order => ({
      ...order._doc,
      items: order.items.map(item => ({
        ...item._doc,
        product: {
          _id: item.product._id,
          name: item.product.name,
          image: item.product.variants[item.variantIndex]?.images?.[0] || null,
          color: item.product.variants[item.variantIndex]?.color || 'N/A'
        }
      }))
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ————————————————————————————————————————————
// 3) Request order cancellation (user)
router.put('/:orderId/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (['Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus)) {
      return res.status(400).json({
        error: `Cannot cancel order that's already ${order.orderStatus.toLowerCase()}`
      });
    }

    order.cancellationRequested = true;
    order.cancellationReason = req.body.reason;
    await order.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// ————————————————————————————————————————————
// 3b) Admin approves/rejects cancellation
router.post('/:orderId/cancel/admin', async (req, res) => {
  try {
    const { action, reason } = req.body; // approve | reject
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!order.cancellationRequested) {
      return res.status(400).json({ error: 'No cancellation requested' });
    }

    if (action === 'approve') {
      order.orderStatus = 'Cancelled';
      order.cancellationRequested = false;
      order.cancellationReason = reason || 'Approved by Admin';
    } else {
      order.cancellationRequested = false;
      order.cancellationReason = reason || 'Rejected by Admin';
    }

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process cancellation' });
  }
});

// ————————————————————————————————————————————
// 4) Request a return (user)
// 4) Request a return (user)
router.put('/:orderId/return', async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({ error: 'Only delivered orders can be returned' });
    }

    order.returnRequested = true;
    order.returnReason = reason || 'No reason provided';
    order.returnStatus = 'Return Requested';   // ✅ always valid enum
    if (!order.returnTimeline) order.returnTimeline = {};
    order.returnTimeline.requestedAt = new Date();

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to request return' });
  }
});


// ————————————————————————————————————————————
// 4b) Admin updates return status
// 4b) Admin updates return status
router.post('/:orderId/return/admin', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (!status || !order.schema.path("returnStatus").enumValues.includes(status)) {
      return res.status(400).json({ error: 'Invalid return status' });
    }

    order.returnStatus = status;
    const now = new Date();
    if (!order.returnTimeline) order.returnTimeline = {};

    switch (status) {
      case 'Return Approved / Pickup Scheduled': order.returnTimeline.approvedAt = now; break;
      case 'Return Picked Up': order.returnTimeline.pickedUpAt = now; break;
      case 'Return in Transit': order.returnTimeline.inTransitAt = now; break;
      case 'Return Completed': order.returnTimeline.completedAt = now; break;
      case 'Refund Initiated': order.returnTimeline.refundInitiatedAt = now; break;
      case 'Refund Completed': order.returnTimeline.refundCompletedAt = now; break;
    }

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update return status' });
  }
});


// ————————————————————————————————————————————
// 5) Admin: list all orders
router.get('/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin orders' });
  }
});

// 6) Admin: update order status
router.put('/admin/orders/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: status },
      { new: true }
    );
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
