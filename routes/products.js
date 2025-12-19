const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 8 } = req.query;
    const query = category ? { category } : {};
    
    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .maxTimeMS(8000)
      .lean();
    
    const total = await Product.countDocuments(query).maxTimeMS(8000);
    
    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    if (error.name === 'MongooseError' || error.message.includes('buffering timed out')) {
      return res.status(503).json({ message: 'Database temporarily unavailable', error: 'Connection timeout' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get single product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create product (admin only)
router.post('/', auth, upload.array('images', 4), async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, discount, isNew, mainImageIndex } = req.body;
    
    const images = req.files ? req.files.map(file => file.filename) : [];
    
    const product = new Product({
      name,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category,
      images,
      mainImageIndex: mainImageIndex ? Number(mainImageIndex) : 0,
      discount: discount ? Number(discount) : 0,
      isNew: isNew === 'true'
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product (admin only)
router.put('/:id', auth, upload.array('images', 4), async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, discount, isNew, mainImageIndex } = req.body;
    
    const updateData = {
      name,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category,
      discount: discount ? Number(discount) : 0,
      isNew: isNew === 'true',
      mainImageIndex: mainImageIndex ? Number(mainImageIndex) : 0
    };

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.filename);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;