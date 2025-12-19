const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  productDbId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'closed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inquiry', inquirySchema);