const express = require("express");
const cors = require("cors");

const app = express();

// Configure CORS
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Mock data for testing
const mockUsers = [
  { _id: '1', username: 'admin', role: 'admin', email: 'admin@company.com' },
  { _id: '2', username: 'employee1', role: 'employee', email: 'emp1@company.com' }
];

const mockReports = [
  { _id: '1', employee: '2', project: 'Project 1', hoursWorked: 8, date: new Date().toISOString() },
  { _id: '2', employee: '2', project: 'Project 2', hoursWorked: 6, date: new Date().toISOString() }
];

const mockProjects = [
  { _id: '1', name: 'Project 1', employees: ['2'] },
  { _id: '2', name: 'Project 2', employees: ['2'] }
];

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  // Mock user
  req.user = { _id: '1', username: 'admin', role: 'admin' };
  next();
};

// Routes
app.get("/", (req, res) => {
  res.send("API is running - Simple Version");
});

// Mock login endpoint
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.json({
      token: 'mock-jwt-token-12345',
      _id: '1',
      username: 'admin',
      role: 'admin'
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Mock dashboard endpoint
app.get("/api/users/comprehensive", mockAuth, (req, res) => {
  res.json({
    users: {
      total: mockUsers.length,
      statistics: {
        employee: 1,
        admin: 1,
        superAdmin: 0
      }
    },
    system: {
      totalProjects: mockProjects.length,
      totalReports: mockReports.length,
      recentReports: mockReports.slice(0, 5)
    }
  });
});

// Mock reports endpoint
app.get("/api/reports", mockAuth, (req, res) => {
  res.json(mockReports);
});

// Mock projects endpoint
app.get("/api/projects", mockAuth, (req, res) => {
  res.json(mockProjects);
});

const PORT = 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Simple Server running on http://0.0.0.0:${PORT}`);
  console.log(`✅ No database required - using mock data`);
});

module.exports = app;
