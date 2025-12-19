const express = require('express');
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');
const router = express.Router();

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    const contact = new Contact({
      name,
      email,
      phone,
      message
    });
    
    await contact.save();
    res.status(201).json({ message: 'Contact form submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all contacts (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;