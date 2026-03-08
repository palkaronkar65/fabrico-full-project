import express from 'express';
import Review from '../models/Review.js';

const router = express.Router();

// Get all reviews (admin)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get reviews for a specific product (optional)
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

// Add admin reply
router.put('/:reviewId/reply', async (req, res) => {
  try {
    const { replyText } = req.body;
    if (!replyText) return res.status(400).json({ error: 'Reply text required' });

    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { adminReply: replyText },
      { new: true }
    );
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete a review
router.delete('/:reviewId', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;