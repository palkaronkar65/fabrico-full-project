import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  codAvailable: { type: Boolean, default: true },
  category: { 
    type: String, 
    enum: ['Men', 'Women', 'Kids'], 
    required: true 
  },
  subCategory: { type: String, required: true },
  sizes: [String],
  variants: [{
    color: { type: String, required: true },
    quantity: { type: Number, required: true },
    images: [{ type: String, required: true }]
  }]
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;