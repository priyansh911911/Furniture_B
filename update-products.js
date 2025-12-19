const mongoose = require('mongoose');
require('dotenv').config();

// Generate unique product ID
const generateProductId = () => {
  return 'FUR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const Product = require('./models/Product');
    
    // Find products without productId
    const productsWithoutId = await Product.find({ productId: { $exists: false } });
    
    console.log(`Found ${productsWithoutId.length} products without productId`);
    
    // Update each product with a unique ID
    for (let product of productsWithoutId) {
      product.productId = generateProductId();
      await product.save();
      console.log(`Updated product: ${product.name} with ID: ${product.productId}`);
    }
    
    console.log('All products updated successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });