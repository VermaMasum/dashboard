const express = require('express');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Employee login
// @route   POST /api/employee-auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Employee login attempt for username:', username);
    
    const employee = await Employee.findOne({ username });
    console.log('Employee found:', employee ? 'Yes' : 'No');
    
    if (employee) {
      const passwordMatch = await employee.matchPassword(password);
      console.log('Password match:', passwordMatch);
      
      if (passwordMatch) {
        const token = jwt.sign({ id: employee._id }, process.env.JWT_SECRET, {
          expiresIn: '30d',
        });
        console.log('Employee login successful for user:', username);
        res.json({
          _id: employee._id,
          username: employee.username,
          role: employee.role,
          token,
        });
      } else {
        console.log('Invalid password for employee:', username);
        res.status(401).json({ message: 'Invalid username or password' });
      }
    } else {
      console.log('Employee not found:', username);
      res.status(401).json({ message: 'Invalid username or password' });
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
    const employee = await Employee.findById(req.user._id);
    if (employee) {
      res.json({
        _id: employee._id,
        username: employee.username,
        role: employee.role,
        createdAt: employee.createdAt,
      });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
