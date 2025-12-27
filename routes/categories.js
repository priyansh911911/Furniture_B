const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Get all categories with counts (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    
    // Update counts from products
    for (let category of categories) {
      const count = await Product.countDocuments({ category: category.name });
      category.count = count;
      await category.save();
    }
    
    res.json(categories);
  } catch (error) {
    console.error('Categories error:', error);
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

// Update category (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name: newName } = req.body;
    
    if (!newName) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    const category = await Category.findByIdAndUpdate(
      id, 
      { name: newName }, 
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if any products use this category
    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      return res.status(400).json({ message: `Cannot delete category. ${productCount} products are using this category.` });
    }
    
    await Category.findByIdAndDelete(id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;