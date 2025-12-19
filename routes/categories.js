const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Get all categories with counts (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().maxTimeMS(8000).lean();
    
    // Get counts efficiently with aggregation
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        try {
          const count = await Product.countDocuments({ category: category.name }).maxTimeMS(5000);
          return { ...category, count };
        } catch (err) {
          return { ...category, count: 0 };
        }
      })
    );
    
    res.json(categoriesWithCounts);
  } catch (error) {
    console.error('Categories error:', error);
    if (error.name === 'MongooseError' || error.message.includes('buffering timed out')) {
      return res.status(503).json({ message: 'Database temporarily unavailable', error: 'Connection timeout' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create category (admin only)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    const category = new Category({
      name,
      image: req.file ? req.file.filename : null
    });
    
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category image (admin only)
router.put('/:name', auth, upload.single('image'), async (req, res) => {
  try {
    const { name } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }
    
    let category = await Category.findOne({ name });
    
    if (!category) {
      // Create new category if it doesn't exist
      category = new Category({
        name,
        image: req.file.filename
      });
    } else {
      category.image = req.file.filename;
    }
    
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category (admin only)
router.delete('/:name', auth, async (req, res) => {
  try {
    const { name } = req.params;
    
    // Check if any products use this category
    const productCount = await Product.countDocuments({ category: name });
    if (productCount > 0) {
      return res.status(400).json({ message: `Cannot delete category. ${productCount} products are using this category.` });
    }
    
    const category = await Category.findOneAndDelete({ name });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;