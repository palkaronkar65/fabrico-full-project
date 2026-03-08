const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');

// Get reviews for a product (public)
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Post a review (user must be logged in)
router.post('/', async (req, res) => {
  try {
    const { productId, userId, reviewText } = req.body;
    if (!productId || !userId || !reviewText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const review = new Review({ product: productId, user: userId, reviewText });
    await review.save();
    await review.populate('user', 'name email');

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

module.exports = router;