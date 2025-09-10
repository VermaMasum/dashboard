const express = require('express');
const Report = require('../models/Report');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get employee dashboard data
// @route   GET /api/dashboard/employee
// @access  Private (Employee only)
router.get('/employee', protect, async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ message: 'Access denied - employees only' });
    }

    console.log('📊 Fetching dashboard data for employee:', req.user.username, 'ID:', req.user._id);

    // Fetch employee's reports and projects in parallel
    const [reports, projects] = await Promise.all([
      Report.find({ employee: req.user._id })
        .populate('project', 'name')
        .populate('employee', 'username')
        .sort({ date: -1 }),
      Project.find({ employees: req.user._id })
        .populate('employees', 'username')
    ]);

    console.log('📊 Found reports:', reports.length, 'projects:', projects.length);

    // Calculate dashboard stats
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const todayReports = reports.filter(report => {
      const reportDate = new Date(report.date);
      return reportDate >= todayStart && reportDate < todayEnd;
    });

    const totalHoursToday = todayReports.reduce((sum, report) => sum + (report.hoursWorked || 0), 0);
    const totalHours = reports.reduce((sum, report) => sum + (report.hoursWorked || 0), 0);

    const stats = {
      totalReports: todayReports.length,
      totalHours: totalHoursToday,
      currentProjects: projects.length,
      thisWeekHours: reports.length, // Can be refined to actual week calculation
    };

    // Get recent reports (last 5)
    const recentReports = reports.slice(0, 5);

    res.json({
      stats,
      recentReports,
      projects,
      reports
    });

  } catch (error) {
    console.error('Error fetching employee dashboard data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
