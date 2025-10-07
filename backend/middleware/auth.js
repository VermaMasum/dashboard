// routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("🔐 Attempting login for user:", username); // log username

    if (!username || !password) {
      console.log("❌ Missing username or password in request body");
      return res
        .status(400)
        .json({ message: "Please provide username and password" });
    }

    const user = await User.findOne({ username });

    console.log("👤 User fetched from DB:", user); // log user object

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await user.matchPassword(password);
    console.log("🔑 Password match:", isMatch); // log password comparison result

    if (!isMatch) {
      console.log("❌ Invalid password for user:", username);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    console.log("✅ Token generated for user:", username);

    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const Employee = require('../models/Employee');

// const protect = async (req, res, next) => {
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     try {
//       token = req.headers.authorization.split(' ')[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Find user in User model (all users including employees are now in User model)
//       let user = await User.findById(decoded.id).select('-password');

//       if (!user) {
//         return res.status(401).json({ message: 'User not found' });
//       }
//       console.log('🔍 Authenticated user:', {
//         id: user._id,
//         username: user.username,
//         role: user.role,
//         model: user.constructor.modelName
//       });
//       req.user = user;
//       next();
//     } catch (error) {
//       return res.status(401).json({ message: 'Not authorized, token failed' });
//     }
//   } else {
//     return res.status(401).json({ message: 'Not authorized, no token' });
//   }
// };

// const admin = (req, res, next) => {
//   if (req.user && req.user.role === 'admin') {
//     next();
//   } else {
//     res.status(401).json({ message: 'Not authorized as admin' });
//   }
// };

// const superAdmin = (req, res, next) => {
//   if (req.user && req.user.role === 'superAdmin') {
//     next();
//   } else {
//     res.status(401).json({ message: 'Not authorized as superAdmin' });
//   }
// };

// module.exports = { protect, admin, superAdmin };
