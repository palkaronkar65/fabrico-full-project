import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: 'products',
        timeout: 60000 // 60 seconds timeout
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    
    // Add error handling for the stream
    uploadStream.on('error', reject);
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

router.delete('/:id', async (req, res) => {
  try {
    console.log('Attempting to delete product with ID:', req.params.id); // Debug log
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ID format:', req.params.id);
      return res.status(400).json({ 
        success: false,
        error: 'Invalid product ID format' 
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      console.log('Product not found with ID:', req.params.id);
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }

    // Delete Cloudinary images first
    try {
      for (const variant of product.variants) {
        for (const imageUrl of variant.images) {
          try {
            const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
            console.log('Deleting Cloudinary image:', publicId);
            await cloudinary.uploader.destroy(publicId);
          } catch (cloudinaryErr) {
            console.error('Error deleting Cloudinary image:', cloudinaryErr);
          }
        }
      }
    } catch (cloudinaryErr) {
      console.error('Cloudinary deletion error:', cloudinaryErr);
    }

    // Delete from MongoDB
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    console.log('Deleted product from DB:', deletedProduct);

    res.json({ 
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (err) {
    console.error('Full delete error:', {
      message: err.message,
      stack: err.stack,
      params: req.params
    });
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});
// Add this PUT route for updating products
router.put('/:id', upload.array('images'), async (req, res) => {
  try {
    const codAvailable = req.body.codAvailable === 'true'; 
    const { name, price, category, subCategory, sizes } = req.body;
    const colors = Array.isArray(req.body.colors) ? req.body.colors : [req.body.colors];
    const quantities = Array.isArray(req.body.quantities)
    
  ? req.body.quantities.map(q => q === '' ? 0 : parseInt(q, 10))
  : [req.body.quantities === '' ? 0 : parseInt(req.body.quantities, 10)];    const existingImages = Array.isArray(req.body.existingImages) ? 
      req.body.existingImages : [req.body.existingImages].filter(Boolean);

    // Find existing product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

     product.codAvailable = codAvailable;

    // Group new images by color
    const colorGroups = {};
    req.files.forEach((file, index) => {
      const color = colors[index];
      if (!colorGroups[color]) {
        colorGroups[color] = {
          images: [],
          quantity: quantities[index] || 0
        };
      }
      colorGroups[color].images.push(file);
    });

    // Upload new images to Cloudinary
    const newVariants = [];
    for (const [color, data] of Object.entries(colorGroups)) {
      const imageUrls = [];
      for (const file of data.images) {
        const result = await streamUpload(file.buffer, {
          folder: 'products',
          public_id: `${name}-${color}-${Date.now()}`,
          overwrite: false
        });
        imageUrls.push(result.secure_url);
      }
      
      newVariants.push({
        color,
        quantity: data.quantity,
        images: imageUrls
      });
    }

    // Combine existing and new variants
    const updatedVariants = [
      ...existingImages.map((img, i) => ({
        color: colors[i],
        quantity: quantities[i],
        images: Array.isArray(img) ? img : [img]
      })),
      ...newVariants
    ];

    // Update product
    product.name = name;
    product.price = price;
    product.category = category;
    product.subCategory = subCategory;
    product.sizes = sizes.split(',').map(s => s.trim());
    product.variants = updatedVariants;

    const savedProduct = await product.save();
    res.status(200).json(savedProduct);
  } catch (err) {
    console.error('[PRODUCT UPDATE ERROR]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Add this new route for deleting variants
router.patch('/:id/variants', async (req, res) => {
  try {
    const { variantIndex } = req.body;
    
    // Validate input
    if (variantIndex === undefined || variantIndex < 0) {
      return res.status(400).json({ error: 'Invalid variant index' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if variant exists
    if (variantIndex >= product.variants.length) {
      return res.status(400).json({ error: 'Variant index out of range' });
    }

    // Get the variant to be deleted for Cloudinary cleanup
    const variantToDelete = product.variants[variantIndex];

    // Delete images from Cloudinary
    try {
      for (const imageUrl of variantToDelete.images) {
        const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (cloudinaryErr) {
      console.error('Cloudinary deletion error:', cloudinaryErr);
    }

    // Remove the variant from the array
    product.variants.splice(variantIndex, 1);

    // If no variants left, delete the entire product
    if (product.variants.length === 0) {
      await Product.findByIdAndDelete(req.params.id);
      return res.json({ 
        success: true,
        message: 'Last variant deleted - product removed'
      });
    }

    // Save the updated product
    await product.save();

    res.json({ 
      success: true,
      message: 'Variant deleted successfully'
    });

  } catch (err) {
    console.error('Variant deletion error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
});

router.post('/', upload.array('images'), async (req, res) => {
  try {
      const codAvailable = req.body.codAvailable === 'true';
    const { name, price, category, subCategory, sizes } = req.body;
    const colors = Array.isArray(req.body.colors) 
      ? req.body.colors 
      : [req.body.colors];
  const quantities = Array.isArray(req.body.quantities)
  ? req.body.quantities.map(q => q === '' ? 0 : parseInt(q, 10))
  : [req.body.quantities === '' ? 0 : parseInt(req.body.quantities, 10)];
    // Group images by color
    const colorGroups = {};
    req.files.forEach((file, index) => {
      const color = colors[index];
      if (!colorGroups[color]) {
        colorGroups[color] = {
          images: [],
          quantity: quantities[index] || 0
        };
      }
      colorGroups[color].images.push(file);
    });

    // Upload images to Cloudinary
    const variants = [];
    for (const [color, data] of Object.entries(colorGroups)) {
      const imageUrls = [];
      for (const file of data.images) {
        const result = await streamUpload(file.buffer, {
          folder: 'products',
          public_id: `${name}-${color}-${Date.now()}`,
          overwrite: false
        });
        imageUrls.push(result.secure_url);
      }
      
      variants.push({
        color,
        quantity: data.quantity,
        images: imageUrls
      });
    }

    // Create new product
const newProduct = new Product({
  name,
  price,
  codAvailable,
  codAvailable: req.body.codAvailable === 'true', // Convert string to boolean
  category,
  subCategory,
  sizes: sizes.split(',').map(s => s.trim()),
  variants
});


    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error('[PRODUCT UPLOAD ERROR]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add this new route to your Products.js routes file
router.get('/stats', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const outOfStock = await Product.countDocuments({
      'variants.quantity': { $lte: 0 }
    });
    
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    // Get recent activity (last 3 updated products)
    const recentActivity = await Product.find()
      .sort({ updatedAt: -1 })
      .limit(3)
      .select('name updatedAt variants.color variants.quantity');
    
    const categoryStats = {};
    categories.forEach(cat => {
      categoryStats[cat._id] = cat.count;
    });

    res.json({
      totalProducts,
      outOfStock,
      categories: categoryStats,
      recentActivity: recentActivity.map(product => ({
        name: product.name,
        updatedAt: product.updatedAt,
        colors: product.variants.map(v => v.color).join(', '),
        stock: product.variants.reduce((sum, v) => sum + v.quantity, 0)
      }))
    });
    
  } catch (err) {
    console.error('[STATS ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { search, category, subCategory } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

if (category) {
  query.category = { $regex: new RegExp(`^${category}$`, 'i') };
}

if (subCategory) {
  query.subCategory = { $regex: new RegExp(`^${subCategory}$`, 'i') };
}

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router; 