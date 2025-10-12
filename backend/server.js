const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./db.js");

const app = express();

const startserver = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("⚠️  Server will continue but authentication will fail");
  }
};

// Configure CORS to allow multiple origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://3.111.194.111:3000",
      "http://3.111.194.111",
      "http://3.111.194.111:80",
      "http://3.111.194.111:443",
      "https://3.111.194.111",
      "https://3.111.194.111:80",
      "https://3.111.194.111:443",
    ];

console.log("🔒 Allowed Origins:", allowedOrigins);

// Add wildcard support for development (allows any IP on port 3000)
const corsOptions = {
  origin: function (origin, callback) {
    console.log("🌐 CORS request from origin:", origin);
    
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      console.log("✅ Allowing request with no origin");
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log("✅ Origin allowed:", origin);
      callback(null, true);
    }
    // In development, allow any localhost or common IP ranges
    else if (
      process.env.NODE_ENV !== "production" &&
      (origin.match(/^http:\/\/localhost:\d+$/) ||
        origin.match(/^http:\/\/127\.0\.0\.1:\d+$/) ||
        origin.match(/^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/) ||
        origin.match(/^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/) ||
        origin.match(/^http:\/\/3\.\d+\.\d+\.\d+(:\d+)?$/) ||
        origin.match(/^https:\/\/3\.\d+\.\d+\.\d+(:\d+)?$/))
    ) {
      console.log("✅ Origin allowed by regex:", origin);
      callback(null, true);
    } else {
      console.log("❌ CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Log CORS configuration
console.log("🔒 CORS Configuration:");
console.log("   Allowed Origins:", allowedOrigins);
console.log("   Development mode: Allowing local network IPs");

// Import routes
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/project");
const reportRoutes = require("./routes/report");
const employeeRoutes = require("./routes/employee");
const employeeAuthRoutes = require("./routes/employeeAuth");
const dashboardRoutes = require("./routes/dashboard");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authRoutes); // Use auth routes for user management
app.use("/api/projects", projectRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/employee-auth", employeeAuthRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

// Test endpoint to verify server is working
app.post("/api/test", (req, res) => {
  console.log("🧪 Test endpoint hit!");
  res.json({ message: "Backend server is working!", timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

// Start database connection first, then start server
startserver().then(() => {
  // 👇 Listen on all network interfaces
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
    console.log(`🔗 Backend API: http://0.0.0.0:${PORT}/api`);
    console.log(`📊 Ready to accept requests`);
  });
}).catch((error) => {
  console.error("❌ Failed to start server:", error.message);
  process.exit(1);
});
