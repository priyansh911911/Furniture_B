const mongoose = require('mongoose');

// Generate unique product ID
const generateProductId = () => {
  return 'FUR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
};

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number
  },
  category: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  mainImageIndex: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  isNew: {
    type: Boolean,
    default: false
  },
  inStock: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

productSchema.pre('save', function(next) {
  if (!this.productId) {
    this.productId = generateProductId();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);