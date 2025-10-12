const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Set a default JWT_SECRET if not provided (for development only)
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-change-in-production';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET not set in environment variables. Using default secret (NOT SECURE FOR PRODUCTION)');
}

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, password, role, email, phone, department } = req.body;

    if (!username || !password || !role)
      return res
        .status(400)
        .json({ message: "Username, password, and role are required" });

    const userExists = await User.findOne({ username });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      username,
      password,
      role,
      email,
      phone,
      department,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    console.log("✅ User registered successfully:", username);
    res
      .status(201)
      .json({ _id: user._id, username: user.username, role: user.role, token });
  } catch (error) {
    console.error("❌ Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    console.log("🔐 Login attempt received");
    const { username, password } = req.body;
    
    if (!username || !password) {
      console.log("❌ Missing username or password");
      return res
        .status(400)
        .json({ message: "Username and password required" });
    }

    console.log("🔍 Looking for user:", username);
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log("❌ User not found:", username);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    console.log("👤 User found, checking password...");
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      console.log("❌ Invalid password for user:", username);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    console.log("🔑 Password correct, generating token...");
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    console.log("✅ User logged in successfully:", username, "Role:", user.role);
    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    console.error("❌ Error stack:", error.stack);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      errno: error.errno,
      syscall: error.syscall
    });
    res.status(500).json({ 
      message: "Server error", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Get logged-in user profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
      phone: user.phone,
      department: user.department,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users (admin/superAdmin only)
router.get("/all-users", protect, async (req, res) => {
  try {
    if (!["admin", "superAdmin"].includes(req.user.role))
      return res.status(403).json({ message: "Access denied" });

    const users = await User.find({})
      .select("-password")
      .sort({ role: 1, username: 1 });
    res.json(users);
  } catch (error) {
    console.error("Fetch all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get users (with optional role filter) - admin/superAdmin only
router.get("/", protect, async (req, res) => {
  try {
    console.log("🔍 GET /users - Fetching users");
    console.log("🔍 Request query:", req.query);
    console.log("🔍 User making request:", req.user.username, req.user.role);

    if (!["admin", "superAdmin"].includes(req.user.role)) {
      console.log("❌ Access denied - user role:", req.user.role);
      return res.status(403).json({ message: "Access denied" });
    }

    const { role } = req.query;
    console.log("🔍 Fetching users with role filter:", role);

    let query = {};
    if (role) {
      query.role = role;
    }

    console.log("🔍 Database query:", query);
    const users = await User.find(query)
      .select("-password")
      .sort({ role: 1, username: 1 });
    console.log("👥 Total users found in database:", users.length);
    console.log("👥 Users:", users.map(u => ({ username: u.username, role: u.role })));
    res.json(users);
  } catch (error) {
    console.error("❌ Fetch users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users - admin/superAdmin only (for /users/all endpoint)
router.get("/all", protect, async (req, res) => {
  try {
    console.log("🔍 Fetching all users via /all endpoint");
    
    // Check if user is admin or superAdmin
    if (!["admin", "superAdmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find({}).select("-password");
    console.log("👥 Total users found via /all:", users.length);
    
    res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new user - admin/superAdmin only
router.post("/", protect, async (req, res) => {
  try {
    console.log("🔍 POST /users - Creating new user");
    console.log("🔍 Request body:", req.body);
    console.log("🔍 User making request:", req.user.username, req.user.role);

    if (!["admin", "superAdmin"].includes(req.user.role)) {
      console.log("❌ Access denied - user role:", req.user.role);
      return res.status(403).json({ message: "Access denied" });
    }

    const { username, password, role, email, phone, department } = req.body;

    if (!username || !password) {
      console.log("❌ Missing required fields - username:", !!username, "password:", !!password);
      return res.status(400).json({ message: "Username and password are required" });
    }

    console.log("🔍 Checking if user exists:", username);
    const userExists = await User.findOne({ username });
    if (userExists) {
      console.log("❌ User already exists:", username);
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("🔍 Creating new user in database...");
    const user = await User.create({
      username,
      password,
      role: role || "employee",
      email: email || "",
      phone: phone || "",
      department: department || "",
    });

    console.log("✅ User created successfully in database:", username, "ID:", user._id);
    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
      phone: user.phone,
      department: user.department,
    });
  } catch (error) {
    console.error("❌ Create user error:", error);
    console.error("❌ Error details:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user - admin/superAdmin only
router.put("/:id", protect, async (req, res) => {
  try {
    if (!["admin", "superAdmin"].includes(req.user.role))
      return res.status(403).json({ message: "Access denied" });

    const { username, password, role, email, phone, department } = req.body;
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Update fields
    if (username) user.username = username;
    if (password) user.password = password; // Will be hashed by pre-save hook
    if (role) user.role = role;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;

    await user.save();

    console.log("✅ User updated successfully:", user.username);
    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
      phone: user.phone,
      department: user.department,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user - admin/superAdmin only
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!["admin", "superAdmin"].includes(req.user.role))
      return res.status(403).json({ message: "Access denied" });

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(req.params.id);
    console.log("✅ User deleted successfully:", user.username);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get comprehensive user data with statistics
// @route   GET /api/users/comprehensive
// @access  Private (Admin/SuperAdmin only)
router.get("/comprehensive", protect, async (req, res) => {
  try {
    // Check if user is admin or superAdmin
    if (!["admin", "superAdmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    console.log("🔍 Fetching comprehensive user data");

    // Get all users
    const allUsers = await User.find({})
      .select("-password")
      .sort({ role: 1, username: 1 });

    // Get additional statistics
    const Report = require("../models/Report");
    const Project = require("../models/Project");

    // Get report and project statistics
    const [totalReports, totalProjects, recentReports] = await Promise.all([
      Report.countDocuments(),
      Project.countDocuments(),
      Report.find({})
        .populate("employee", "username")
        .sort({ date: -1 })
        .limit(5),
    ]);

    // Calculate user statistics
    const userStats = {
      total: allUsers.length,
      superAdmin: allUsers.filter((user) => user.role === "superAdmin").length,
      admin: allUsers.filter((user) => user.role === "admin").length,
      employee: allUsers.filter((user) => user.role === "employee").length,
    };

    // Organize users by role
    const usersByRole = {
      superAdmin: allUsers.filter((user) => user.role === "superAdmin"),
      admin: allUsers.filter((user) => user.role === "admin"),
      employee: allUsers.filter((user) => user.role === "employee"),
    };

    const response = {
      users: {
        total: userStats.total,
        byRole: usersByRole,
        all: allUsers,
        statistics: userStats,
      },
      system: {
        totalReports,
        totalProjects,
        recentReports: recentReports.map((report) => ({
          id: report._id,
          title: report.title,
          employee: report.employee?.username || "Unknown",
          date: report.date,
          hoursWorked: report.hoursWorked,
        })),
      },
      timestamp: new Date().toISOString(),
    };

    console.log("👥 Comprehensive users response:", {
      totalUsers: response.users.total,
      totalReports: response.system.totalReports,
      totalProjects: response.system.totalProjects,
    });

    res.json(response);
  } catch (error) {
    console.error("Error fetching comprehensive user data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

// // routes/auth.js
// const express = require("express");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const { protect, admin, superAdmin } = require("../middleware/auth");

// const router = express.Router();

// /**
//  * @desc    Register a new user
//  * @route   POST /api/auth/register
//  * @access  Public
//  */
// router.post("/register", async (req, res) => {
//   try {
//     const { username, password, role, email, phone, department } = req.body;

//     if (!username || !password || !role) {
//       return res
//         .status(400)
//         .json({ message: "Username, password, and role are required" });
//     }

//     const userExists = await User.findOne({ username });
//     if (userExists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const user = await User.create({
//       username,
//       password,
//       role,
//       email: email || "",
//       phone: phone || "",
//       department: department || "",
//     });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "30d",
//     });

//     res.status(201).json({
//       _id: user._id,
//       username: user.username,
//       role: user.role,
//       token,
//     });
//   } catch (error) {
//     console.error("❌ Register error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /**
//  * @desc    Login user
//  * @route   POST /api/auth/login
//  * @access  Public
//  */
// router.post("/login", async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res
//         .status(400)
//         .json({ message: "Please provide username and password" });
//     }

//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid username or password" });
//     }

//     const isMatch = await user.matchPassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid username or password" });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "30d",
//       }
//     );

//     res.json({
//       _id: user._id,
//       username: user.username,
//       role: user.role,
//       token,
//     });
//   } catch (error) {
//     console.error("❌ Login error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /**
//  * @desc    Get logged-in user profile
//  * @route   GET /api/auth/profile
//  * @access  Private
//  */
// router.get("/profile", protect, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select("-password");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({
//       _id: user._id,
//       username: user.username,
//       role: user.role,
//       email: user.email,
//       phone: user.phone,
//       department: user.department,
//     });
//   } catch (error) {
//     console.error("❌ Profile fetch error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /**
//  * @desc    Get all users (admin/superAdmin)
//  * @route   GET /api/users
//  * @access  Private (Admin/SuperAdmin)
//  */
// router.get("/all-users", protect, async (req, res) => {
//   try {
//     if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const users = await User.find({})
//       .select("-password")
//       .sort({ role: 1, username: 1 });

//     res.json(users);
//   } catch (error) {
//     console.error("❌ Fetch all users error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;

////////////
// const express = require("express");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const { protect } = require("../middleware/auth");

// const router = express.Router();

// // @desc    Register user
// // @route   POST /api/auth/register
// // @access  Public
// router.post("/register", async (req, res) => {
//   const { username, password, role } = req.body;
//   const userExists = await User.findOne({ username });
//   if (userExists) {
//     res.status(400).json({ message: "User already exists" });
//   } else {
//     const user = await User.create({
//       username,
//       password,
//       role,
//     });
//     if (user) {
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//         expiresIn: "30d",
//       });
//       res.status(201).json({
//         _id: user._id,
//         username: user.username,
//         role: user.role,
//         token,
//       });
//     } else {
//       res.status(400).json({ message: "Invalid user data" });
//     }
//   }
// });

// // @desc    Auth user & get token
// // @route   POST /api/auth/login
// // @access  Public
// router.post("/login", async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     console.log("🔐 Admin login attempt for username:", username);

//     const user = await User.findOne({ username });
//     console.log("👤 User found:", user ? "Yes" : "No");

//     if (user) {
//       console.log("🔍 User details:", {
//         username: user.username,
//         role: user.role,
//         hasPassword: !!user.password,
//       });

//       const passwordMatch = await user.matchPassword(password);
//       console.log("🔑 Password match:", passwordMatch);

//       if (passwordMatch) {
//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//           expiresIn: "30d",
//         });
//         console.log("✅ Admin login successful for user:", username);
//         res.json({
//           _id: user._id,
//           username: user.username,
//           role: user.role,
//           token,
//         });
//       } else {
//         console.log("❌ Invalid password for user:", username);
//         res.status(401).json({ message: "Invalid username or password" });
//       }
//     } else {
//       console.log("❌ User not found:", username);
//       res.status(401).json({ message: "Invalid username or password" });
//     }
//   } catch (error) {
//     console.error("❌ Login error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // @desc    Get user profile
// // @route   GET /api/auth/profile
// // @access  Private
// router.get("/profile", protect, async (req, res) => {
//   const user = await User.findById(req.user._id);
//   if (user) {
//     res.json({
//       _id: user._id,
//       username: user.username,
//       role: user.role,
//     });
//   } else {
//     res.status(404).json({ message: "User not found" });
//   }
// });

// // @desc    Get all users (with optional role filter)
// // @route   GET /api/users
// // @access  Private (Admin/SuperAdmin only)
// router.get("/", protect, async (req, res) => {
//   try {
//     // Check if user is admin or superAdmin
//     if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const { role } = req.query;
//     console.log("🔍 Fetching users with role filter:", role);

//     let query = {};
//     if (role) {
//       query.role = role;
//     }

//     const users = await User.find(query).select("-password");
//     console.log("👥 Total users found:", users.length);
//     res.json(users);
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // @desc    Get all users (unified endpoint for all user types)
// // @route   GET /api/users/all
// // @access  Private (Admin/SuperAdmin only)
// router.get("/all", protect, async (req, res) => {
//   try {
//     // Check if user is admin or superAdmin
//     if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     console.log("🔍 Fetching all users (unified endpoint)");

//     // Get all users from User model (includes admin, superAdmin, and employees)
//     const allUsers = await User.find({})
//       .select("-password")
//       .sort({ role: 1, username: 1 });

//     // Organize users by role for better structure
//     const usersByRole = {
//       superAdmin: allUsers.filter((user) => user.role === "superAdmin"),
//       admin: allUsers.filter((user) => user.role === "admin"),
//       employee: allUsers.filter((user) => user.role === "employee"),
//     };

//     const response = {
//       total: allUsers.length,
//       byRole: usersByRole,
//       all: allUsers,
//     };

//     console.log("👥 Unified users response:", {
//       total: response.total,
//       superAdmin: usersByRole.superAdmin.length,
//       admin: usersByRole.admin.length,
//       employee: usersByRole.employee.length,
//     });

//     res.json(response);
//   } catch (error) {
//     console.error("Error fetching all users:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // @desc    Get comprehensive user data with statistics
// // @route   GET /api/users/comprehensive
// // @access  Private (Admin/SuperAdmin only)
// router.get("/comprehensive", protect, async (req, res) => {
//   try {
//     // Check if user is admin or superAdmin
//     if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     console.log("🔍 Fetching comprehensive user data");

//     // Get all users
//     const allUsers = await User.find({})
//       .select("-password")
//       .sort({ role: 1, username: 1 });

//     // Get additional statistics
//     const Report = require("../models/Report");
//     const Project = require("../models/Project");

//     // Get report and project statistics
//     const [totalReports, totalProjects, recentReports] = await Promise.all([
//       Report.countDocuments(),
//       Project.countDocuments(),
//       Report.find({})
//         .populate("employee", "username")
//         .sort({ date: -1 })
//         .limit(5),
//     ]);

//     // Calculate user statistics
//     const userStats = {
//       total: allUsers.length,
//       superAdmin: allUsers.filter((user) => user.role === "superAdmin").length,
//       admin: allUsers.filter((user) => user.role === "admin").length,
//       employee: allUsers.filter((user) => user.role === "employee").length,
//     };

//     // Organize users by role
//     const usersByRole = {
//       superAdmin: allUsers.filter((user) => user.role === "superAdmin"),
//       admin: allUsers.filter((user) => user.role === "admin"),
//       employee: allUsers.filter((user) => user.role === "employee"),
//     };

//     const response = {
//       users: {
//         total: userStats.total,
//         byRole: usersByRole,
//         all: allUsers,
//         statistics: userStats,
//       },
//       system: {
//         totalReports,
//         totalProjects,
//         recentReports: recentReports.map((report) => ({
//           id: report._id,
//           title: report.title,
//           employee: report.employee?.username || "Unknown",
//           date: report.date,
//           hoursWorked: report.hoursWorked,
//         })),
//       },
//       timestamp: new Date().toISOString(),
//     };

//     console.log("👥 Comprehensive users response:", {
//       totalUsers: response.users.total,
//       totalReports: response.system.totalReports,
//       totalProjects: response.system.totalProjects,
//     });

//     res.json(response);
//   } catch (error) {
//     console.error("Error fetching comprehensive user data:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // @desc    Create new user
// // @route   POST /api/users
// // @access  Private (Admin/SuperAdmin only)
// router.post("/", protect, async (req, res) => {
//   try {
//     // Check if user is admin or superAdmin
//     if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const { username, password, role, email, phone, department } = req.body;

//     // Check if user already exists
//     const userExists = await User.findOne({ username });
//     if (userExists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const user = await User.create({
//       username,
//       password,
//       role: role || "employee",
//       email: email || "",
//       phone: phone || "",
//       department: department || "",
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
//       res.status(400).json({ message: "Invalid user data" });
//     }
//   } catch (error) {
//     console.error("Error creating user:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // @desc    Update user
// // @route   PUT /api/users/:id
// // @access  Private (Admin/SuperAdmin only)
// router.put("/:id", protect, async (req, res) => {
//   try {
//     // Check if user is admin or superAdmin
//     if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const { username, password, role, email, phone, department } = req.body;
//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
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
//     console.error("Error updating user:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // @desc    Delete user
// // @route   DELETE /api/users/:id
// // @access  Private (Admin/SuperAdmin only)
// router.delete("/:id", protect, async (req, res) => {
//   try {
//     // Check if user is admin or superAdmin
//     if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     await User.findByIdAndDelete(req.params.id);
//     res.json({ message: "User deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting user:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;
