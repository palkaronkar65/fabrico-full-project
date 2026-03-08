import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewText: {
    type: String,
    required: true,
    trim: true
  },
  adminReply: {
    type: String,
    trim: true,
    default: null
  }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;