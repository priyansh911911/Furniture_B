const express = require('express');
const Inquiry = require('../models/Inquiry');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// Submit inquiry (public)
router.post('/', async (req, res) => {
  try {
    const { productId, customerEmail, customerPhone } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const inquiry = new Inquiry({
      productDbId: productId,
      productId: product.productId,
      productName: product.name,
      customerEmail,
      customerPhone
    });

    await inquiry.save();
    res.status(201).json({ message: 'Inquiry submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all inquiries (admin only)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const skip = (page - 1) * limit;
    
    const inquiries = await Inquiry.find()
      .populate('productDbId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Inquiry.countDocuments();
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      inquiries,
      currentPage: parseInt(page),
      totalPages,
      total
    });
  } catch (error) {
    console.error('Inquiries error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update inquiry status (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;