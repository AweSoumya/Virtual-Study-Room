const express = require('express');
const jwt = require('jsonwebtoken');
const Classroom = require('../models/Classroom');
const User = require('../models/User');
const router = express.Router();

// Middleware to verify token
function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId; // Set the user ID in the request
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

// Create Classroom
router.post('/create', auth, async (req, res) => {
  const { name } = req.body;

  // Validate input
  if (!name) {
    return res.status(400).json({ msg: 'Classroom name is required' });
  }

  try {
    const classroom = new Classroom({ name, teacher: req.user });
    await classroom.save();
    res.json(classroom);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Join Classroom
router.post('/join/:id', auth, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ msg: 'Classroom not found' });
    }

    if (classroom.students.includes(req.user)) {
      return res.status(400).json({ msg: 'User already joined this classroom' });
    }

    classroom.students.push(req.user);
    await classroom.save();
    res.json(classroom);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// List Classrooms
router.get('/', auth, async (req, res) => {
  try {
    const classrooms = await Classroom.find({}).populate('teacher', 'name').populate('students', 'name');
    res.json(classrooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
