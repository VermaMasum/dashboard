const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Set a default JWT_SECRET if not provided (for development only)
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-change-in-production';

// @desc    Employee login
// @route   POST /api/employee-auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Employee login attempt for email:', email);
    
    const user = await User.findOne({ email });
    console.log('Employee found:', user ? 'Yes' : 'No');
    
    if (user) {
      const passwordMatch = await user.matchPassword(password);
      console.log('Password match:', passwordMatch);
      
      if (passwordMatch) {
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
          expiresIn: '30d',
        });
        console.log('✅ Employee login successful for email:', email, 'Role:', user.role);
        res.json({
          _id: user._id,
          username: user.username,
          role: user.role,
          token,
        });
      } else {
        console.log('Invalid password for employee:', email);
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      console.log('Employee not found with email:', email);
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get employee profile
// @route   GET /api/employee-auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
