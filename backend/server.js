const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./db.js");
const startserver = async () => {
  await connectDB();
  console.log("database connected successfully");
};
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection is handled by db.js - no need for duplicate connection

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
startserver();
