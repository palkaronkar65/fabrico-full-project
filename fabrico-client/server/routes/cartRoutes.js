// server/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Add to cart
router.post('/add', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const user = await User.findById(userId);
    
    // Check if product already exists
    const exists = user.cart.some(item => 
      item.productId.toString() === productId
    );
    
    if (exists) {
      return res.status(400).json({ 
        success: false,
        message: 'Product already in cart'
      });
    }
    
    user.cart.push({ productId });
    await user.save();
    res.json({ success: true, cart: user.cart });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove from cart
router.post('/remove', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const user = await User.findById(userId);
    
    user.cart = user.cart.filter(item => 
      item.productId.toString() !== productId
    );
    
    await user.save();
    res.json({ success: true, cart: user.cart });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get cart with populated products
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('cart.productId');
      
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;