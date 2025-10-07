// const express = require('express');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const { protect } = require('../middleware/auth');

// const router = express.Router();

// // @desc    Register user
// // @route   POST /api/auth/register
// // @access  Public
// router.post('/register', async (req, res) => {
//   const { username, password, role } = req.body;
//   const userExists = await User.findOne({ username });
//   if (userExists) {
//     res.status(400).json({ message: 'User already exists' });
//   } else {
//     const user = await User.create({
//       username,
//       password,
//       role,
//     });
//     if (user) {
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//         expiresIn: '30d',
//       });
//       res.status(201).json({
//         _id: user._id,
//         username: user.username,
//         role: user.role,
//         token,
//       });
//     } else {
//       res.status(400).json({ message: 'Invalid user data' });
//     }
//   }
// });

// // @desc    Auth user & get token
// // @route   POST /api/auth/login
// // @access  Public
// router.post('/login', async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     console.log('🔐 Admin login attempt for username:', username);

//     const user = await User.findOne({ username });
//     console.log('👤 User found:', user ? 'Yes' : 'No');

//     if (user) {
//       console.log('🔍 User details:', {
//         username: user.username,
//         role: user.role,
//         hasPassword: !!user.password
//       });

//       const passwordMatch = await user.matchPassword(password);
//       console.log('🔑 Password match:', passwordMatch);

//       if (passwordMatch) {
//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//           expiresIn: '30d',
//         });
//         console.log('✅ Admin login successful for user:', username);
//         res.json({
//           _id: user._id,
//           username: user.username,
//           role: user.role,
//           token,
//         });
//       } else {
//         console.log('❌ Invalid password for user:', username);
//         res.status(401).json({ message: 'Invalid username or password' });
//       }
//     } else {
//       console.log('❌ User not found:', username);
//       res.status(401).json({ message: 'Invalid username or password' });
//     }
//   } catch (error) {
//     console.error('❌ Login error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // @desc    Get user profile
// // @route   GET /api/auth/profile
// // @access  Private
// router.get('/profile', protect, async (req, res) => {
//   const user = await User.findById(req.user._id);
//   if (user) {
//     res.json({
//       _id: user._id,
//       username: user.username,
//       role: user.role,
//     });
//   } else {
//     res.status(404).json({ message: 'User not found' });
//   }
// });

// // @desc    Get all users (with optional role filter)
// // @route   GET /api/users
// // @access  Private (Admin/SuperAdmin only)
// router.get('/', protect, async (req, res) => {
//   try {
//     // Check if user is admin or superAdmin
//     if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     const { role } = req.query;
//     console.log('🔍 Fetching users with role filter:', role);

//     let query = {};
//     if (role) {
//       query.role = role;
//     }

//     const users = await User.find(query).select('-password');
//     console.log('👥 Total users found:', users.length);
//     res.json(users);
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // @desc    Get all users (unified endpoint for all user types)
// // @route   GET /api/users/all
// // @access  Private (Admin/SuperAdmin only)
// router.get('/all', protect, async (req, res) => {
//   try {
//     // Check if user is admin or superAdmin
//     if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     console.log('🔍 Fetching all users (unified endpoint)');

//     // Get all users from User model (includes admin, superAdmin, and employees)
//     const allUsers = await User.find({}).select('-password').sort({ role: 1, username: 1 });

//     // Organize users by role for better structure
//     const usersByRole = {
//       superAdmin: allUsers.filter(user => user.role === 'superAdmin'),
//       admin: allUsers.filter(user => user.role === 'admin'),
//       employee: allUsers.filter(user => user.role === 'employee')
//     };

//     const response = {
//       total: allUsers.length,
//       byRole: usersByRole,
//       all: allUsers
//     };

//     console.log('👥 Unified users response:', {
//       total: response.total,
//       superAdmin: usersByRole.superAdmin.length,
//       admin: usersByRole.admin.length,
//       employee: usersByRole.employee.length
//     });

//     res.json(response);
//   } catch (error) {
//     console.error('Error fetching all users:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // @desc    Get comprehensive user data with statistics
// // @route   GET /api/users/comprehensive
// // @access  Private (Admin/SuperAdmin only)
// router.get('/comprehensive', protect, async (req, res) => {
//   try {
//     // Check if user is admin or superAdmin
//     if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     console.log('🔍 Fetching comprehensive user data');

//     // Get all users
//     const allUsers = await User.find({}).select('-password').sort({ role: 1, username: 1 });

//     // Get additional statistics
//     const Report = require('../models/Report');
//     const Project = require('../models/Project');

//     // Get report and project statistics
//     const [totalReports, totalProjects, recentReports] = await Promise.all([
//       Report.countDocuments(),
//       Project.countDocuments(),
//       Report.find({}).populate('employee', 'username').sort({ date: -1 }).limit(5)
//     ]);

//     // Calculate user statistics
//     const userStats = {
//       total: allUsers.length,
//       superAdmin: allUsers.filter(user => user.role === 'superAdmin').length,
//       admin: allUsers.filter(user => user.role === 'admin').length,
//       employee: allUsers.filter(user => user.role === 'employee').length
//     };

//     // Organize users by role
//     const usersByRole = {
//       superAdmin: allUsers.filter(user => user.role === 'superAdmin'),
//       admin: allUsers.filter(user => user.role === 'admin'),
//       employee: allUsers.filter(user => user.role === 'employee')
//     };

//     const response = {
//       users: {
//         total: userStats.total,
//         byRole: usersByRole,
//         all: allUsers,
//         statistics: userStats
//       },
//       system: {
//         totalReports,
//         totalProjects,
//         recentReports: recentReports.map(report => ({
//           id: report._id,
//           title: report.title,
//           employee: report.employee?.username || 'Unknown',
//           date: report.date,
//           hoursWorked: report.hoursWorked
//         }))
//       },
//       timestamp: new Date().toISOString()
//     };

//     console.log('👥 Comprehensive users response:', {
//       totalUsers: response.users.total,
//       totalReports: response.system.totalReports,
//       totalProjects: response.system.totalProjects
//     });

//     res.json(response);
//   } catch (error) {
//     console.error('Error fetching comprehensive user data:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // @desc    Create new user
// // @route   POST /api/users
// // @access  Private (Admin/SuperAdmin only)
// router.post('/', protect, async (req, res) => {
//   try {
//     // Check if user is admin or superAdmin
//     if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     const { username, password, role, email, phone, department } = req.body;

//     // Check if user already exists
//     const userExists = await User.findOne({ username });
//     if (userExists) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const user = await User.create({
//       username,
//       password,
//       role: role || 'employee',
//       email: email || '',
//       phone: phone || '',
//       department: department || '',
//     });

//     if (user) {
//       res.status(201).json({
//         _id: user._id,
//         username: user.username,
//         role: user.role,
//         email: user.email,
//         phone: user.phone,
//         department: user.department,
//       });
//     } else {
//       res.status(400).json({ message: 'Invalid user data' });
//     }
//   } catch (error) {
//     console.error('Error creating user:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // @desc    Update user
// // @route   PUT /api/users/:id
// // @access  Private (Admin/SuperAdmin only)
// router.put('/:id', protect, async (req, res) => {
//   try {
//     // Check if user is admin or superAdmin
//     if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     const { username, password, role, email, phone, department } = req.body;
//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Update fields
//     if (username) user.username = username;
//     if (password) user.password = password;
//     if (role) user.role = role;
//     if (email !== undefined) user.email = email;
//     if (phone !== undefined) user.phone = phone;
//     if (department !== undefined) user.department = department;

//     await user.save();

//     res.json({
//       _id: user._id,
//       username: user.username,
//       role: user.role,
//       email: user.email,
//       phone: user.phone,
//       department: user.department,
//     });
//   } catch (error) {
//     console.error('Error updating user:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // @desc    Delete user
// // @route   DELETE /api/users/:id
// // @access  Private (Admin/SuperAdmin only)
// router.delete('/:id', protect, async (req, res) => {
//   try {
//     // Check if user is admin or superAdmin
//     if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     await User.findByIdAndDelete(req.params.id);
//     res.json({ message: 'User deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting user:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===================================================================
// AUTH ROUTES
// ===================================================================

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ message: "Invalid username or password" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid username or password" });

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

// ===================================================================
// USER MANAGEMENT ROUTES (for Admin / SuperAdmin)
// ===================================================================

// @route   GET /api/auth/users
// @desc    Get all users
// @access  Private (admin/superadmin)
router.get("/users", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

// @route   GET /api/auth/users/:id
// @desc    Get user by ID
// @access  Private (admin/superadmin)
router.get("/users/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Server error fetching user" });
  }
});

// @route   PUT /api/auth/users/:id
// @desc    Update user (role or info)
// @access  Private (admin/superadmin)
router.put("/users/:id", protect, admin, async (req, res) => {
  try {
    const { username, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error updating user" });
  }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete user
// @access  Private (admin/superadmin)
router.delete("/users/:id", protect, admin, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error deleting user" });
  }
});

export default router;
