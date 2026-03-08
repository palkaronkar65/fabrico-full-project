const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    
    const productsWithCod = products.map(product => {
      return {
        ...product,
        variants: product.variants.map(variant => ({
          ...variant,
          // Ensure codAvailable is explicitly added to each variant
          codAvailable: variant.codAvailable !== undefined 
            ? variant.codAvailable 
            : product.codAvailable
        }))
      };
    });

    res.json(productsWithCod);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({
      error: 'Failed to fetch products',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Apply the same transformation for single product
    const productWithCod = {
      ...product,
      variants: product.variants.map(variant => ({
        ...variant,
        codAvailable: product.codAvailable
      }))
    };
    
    res.json(productWithCod);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;