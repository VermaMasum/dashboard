const express = require('express');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const adminOrSuperAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superAdmin')) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized' });
  }
};

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin
router.get('/', protect, adminOrSuperAdmin, async (req, res) => {
  try {
    const employees = await Employee.find({}).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

 // @desc    Get employee by ID
 // @route   GET /api/employees/:id
 // @access  Private/Admin
router.get('/:id', protect, adminOrSuperAdmin, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

 // @desc    Create new employee
 // @route   POST /api/employees
 // @access  Private/Admin
router.post('/', protect, adminOrSuperAdmin, async (req, res) => {
  const { username, password, role = 'employee', email = '', phone = '', department = '' } = req.body;
  try {
    const employeeExists = await Employee.findOne({ username });
    if (employeeExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    // Create employee in Employee collection
    const newEmployee = new Employee({
      username,
      password,
      role,
      email,
      phone,
      department,
    });
    const createdEmployee = await newEmployee.save();

    // Also create user login credentials in User collection
    const newUser = new User({
      username,
      password,
      role: 'employee'
    });
    await newUser.save();

    res.status(201).json({
      _id: createdEmployee._id,
      username: createdEmployee.username,
      role: createdEmployee.role,
      email: createdEmployee.email,
      phone: createdEmployee.phone,
      department: createdEmployee.department,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

 // @desc    Update employee
 // @route   PUT /api/employees/:id
 // @access  Private/Admin
router.put('/:id', protect, adminOrSuperAdmin, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee) {
      employee.username = req.body.username || employee.username;
      employee.role = req.body.role || employee.role;
      employee.email = req.body.email !== undefined ? req.body.email : employee.email;
      employee.phone = req.body.phone !== undefined ? req.body.phone : employee.phone;
      employee.department = req.body.department !== undefined ? req.body.department : employee.department;
      if (req.body.password) {
        employee.password = req.body.password;
      }
      const updatedEmployee = await employee.save();
      res.json({
        _id: updatedEmployee._id,
        username: updatedEmployee.username,
        role: updatedEmployee.role,
        email: updatedEmployee.email,
        phone: updatedEmployee.phone,
        department: updatedEmployee.department,
      });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

 // @desc    Delete employee
 // @route   DELETE /api/employees/:id
 // @access  Private/Admin
router.delete('/:id', protect, adminOrSuperAdmin, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee) {
      await employee.deleteOne();
      res.json({ message: 'Employee removed' });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
