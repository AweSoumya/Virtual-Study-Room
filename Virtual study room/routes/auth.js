const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
require('dotenv').config();

// Helper function for validation
const validateRegistration = (name, email, password) => {
  const errors = [];
  if (!name || !email || !password) {
    errors.push('Please fill in all fields.');
  }
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }
  // Add more validations if necessary
  return errors;
};

// Create and return JWT
const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Register User
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  const validationErrors = validateRegistration(name, email, password);
  if (validationErrors.length) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ name, email, password });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create and return JWT
    const token = createToken(user._id);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create and return JWT
    const token = createToken(user._id);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
