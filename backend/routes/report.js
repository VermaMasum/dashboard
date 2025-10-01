const express = require("express");
const Report = require("../models/Report");
const { protect, admin, superAdmin } = require("../middleware/auth");

const router = express.Router();

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private (admin and superAdmin)
router.get("/", protect, async (req, res) => {
  try {
    const { date, project, startDate, endDate } = req.query;
    let query = {};

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    // Handle date range filtering for admin time tracker
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      query.date = { $gte: start, $lte: end };
    }

    if (project) {
      query.project = project;
    }
    
    // If user is employee, only show their own reports
    if (req.user.role === "employee") {
      query.employee = req.user._id;
      console.log('🔍 Employee filtering reports for user ID:', req.user._id);
    }
    // If user is admin or superAdmin, show all reports
    
    const reports = await Report.find(query)
      .populate("project", "name")
      .populate("employee", "username");
    
    console.log('📊 Reports query result:', reports.length, 'reports');
    if (reports.length > 0) {
      console.log('📊 Sample report:', {
        id: reports[0]._id,
        employee: reports[0].employee,
        project: reports[0].project
      });
    }
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a report
// @route   POST /api/reports
// @access  Private/Admin
router.post("/", protect, async (req, res) => {
  try {
    const { date, project, employee, details, hoursWorked, title } = req.body;
    
    // For employees, use their own ID as the employee field
    const employeeId = req.user.role === "employee" ? req.user._id : employee;
    
    const report = new Report({
      date,
      project,
      employee: employeeId,
      details,
      hoursWorked,
      title: title || 'Daily Report', // Add title field
    });
    const createdReport = await report.save();
    await createdReport.populate('project', 'name');
    await createdReport.populate('employee', 'username');
    res.status(201).json(createdReport);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update a report
// @route   PUT /api/reports/:id
// @access  Private/Admin
router.put("/:id", protect, async (req, res) => {
  try {
    const { date, project, employee, details, hoursWorked, title } = req.body;
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Check if employee is trying to edit their own report
    if (req.user.role === "employee" && report.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this report' });
    }
    
    report.date = date || report.date;
    report.project = project || report.project;
    report.title = title || report.title;
    report.details = details || report.details;
    report.hoursWorked = hoursWorked || report.hoursWorked;
    
    // Only admins can change the employee field
    if (req.user.role === "admin" || req.user.role === "superAdmin") {
      report.employee = employee || report.employee;
    }
    
    const updatedReport = await report.save();
    await updatedReport.populate('project', 'name');
    await updatedReport.populate('employee', 'username');
    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private/Admin
router.delete("/:id", protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Check if employee is trying to delete their own report
    if (req.user.role === "employee" && report.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this report' });
    }
    
    await report.deleteOne();
    res.json({ message: 'Report removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get weekly reports summary
// @route   GET /api/reports/weekly
// @access  Private
router.get("/weekly", protect, async (req, res) => {
  try {
    const { weekStart, weekEnd, employee } = req.query;
    
    // Calculate week start and end dates if not provided
    let startDate, endDate;
    
    if (weekStart && weekEnd) {
      startDate = new Date(weekStart);
      endDate = new Date(weekEnd);
    } else {
      // Default to current week (Monday to Sunday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday as 0
      
      startDate = new Date(today);
      startDate.setDate(today.getDate() + mondayOffset);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    }
    
    console.log('📅 Weekly Reports - Date Range:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startDateLocal: startDate.toLocaleDateString(),
      endDateLocal: endDate.toLocaleDateString()
    });
    
    let query = {
      date: { $gte: startDate, $lte: endDate }
    };
    
    // Filter by employee if specified or if user is employee
    if (employee) {
      query.employee = employee;
    } else if (req.user.role === "employee") {
      query.employee = req.user._id;
    }
    
    const reports = await Report.find(query)
      .populate("project", "name description")
      .populate("employee", "username")
      .sort({ date: 1 });
    
    // Group reports by day and project
    const weeklyData = {
      weekStart: startDate,
      weekEnd: endDate,
      totalHours: 0,
      totalReports: reports.length,
      dailyBreakdown: {},
      projectBreakdown: {},
      employeeBreakdown: {}
    };
    
    // Initialize daily breakdown
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      const dayKey = day.toISOString().split('T')[0];
      weeklyData.dailyBreakdown[dayKey] = {
        date: day,
        dayName: day.toLocaleDateString('en-US', { weekday: 'long' }),
        hours: 0,
        reports: 0,
        projects: new Set()
      };
    }
    
    // Process each report
    reports.forEach(report => {
      const reportDate = new Date(report.date);
      const dayKey = reportDate.toISOString().split('T')[0];
      const projectId = report.project._id.toString();
      const employeeId = report.employee._id.toString();
      
      // Update totals
      weeklyData.totalHours += report.hoursWorked;
      
      // Update daily breakdown
      if (weeklyData.dailyBreakdown[dayKey]) {
        weeklyData.dailyBreakdown[dayKey].hours += report.hoursWorked;
        weeklyData.dailyBreakdown[dayKey].reports += 1;
        weeklyData.dailyBreakdown[dayKey].projects.add(projectId);
      }
      
      // Update project breakdown
      if (!weeklyData.projectBreakdown[projectId]) {
        weeklyData.projectBreakdown[projectId] = {
          project: report.project,
          hours: 0,
          reports: 0,
          employees: new Set()
        };
      }
      weeklyData.projectBreakdown[projectId].hours += report.hoursWorked;
      weeklyData.projectBreakdown[projectId].reports += 1;
      weeklyData.projectBreakdown[projectId].employees.add(employeeId);
      
      // Update employee breakdown
      if (!weeklyData.employeeBreakdown[employeeId]) {
        weeklyData.employeeBreakdown[employeeId] = {
          employee: report.employee,
          hours: 0,
          reports: 0,
          projects: new Set()
        };
      }
      weeklyData.employeeBreakdown[employeeId].hours += report.hoursWorked;
      weeklyData.employeeBreakdown[employeeId].reports += 1;
      weeklyData.employeeBreakdown[employeeId].projects.add(projectId);
    });
    
    // Convert Sets to Arrays for JSON serialization
    Object.values(weeklyData.dailyBreakdown).forEach(day => {
      day.projects = Array.from(day.projects);
    });
    
    Object.values(weeklyData.projectBreakdown).forEach(project => {
      project.employees = Array.from(project.employees);
    });
    
    Object.values(weeklyData.employeeBreakdown).forEach(employee => {
      employee.projects = Array.from(employee.projects);
    });
    
    res.json(weeklyData);
  } catch (error) {
    console.error('Error fetching weekly reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get monthly reports summary
// @route   GET /api/reports/monthly
// @access  Private
router.get("/monthly", protect, async (req, res) => {
  try {
    const { month, year, employee } = req.query;
    
    // Calculate month start and end dates if not provided
    let startDate, endDate;
    
    if (month && year) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      // Default to current month
      const today = new Date();
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    
    console.log('📅 Monthly Reports - Date Range:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startDateLocal: startDate.toLocaleDateString(),
      endDateLocal: endDate.toLocaleDateString(),
      month: month,
      year: year
    });
    
    let query = {
      date: { $gte: startDate, $lte: endDate }
    };
    
    // Filter by employee if specified or if user is employee
    if (employee) {
      query.employee = employee;
    } else if (req.user.role === "employee") {
      query.employee = req.user._id;
    }
    
    const reports = await Report.find(query)
      .populate("project", "name description")
      .populate("employee", "username")
      .sort({ date: 1 });
    
    // Group reports by week, day, and project
    const monthlyData = {
      monthStart: startDate,
      monthEnd: endDate,
      totalHours: 0,
      totalReports: reports.length,
      weeklyBreakdown: {},
      dailyBreakdown: {},
      projectBreakdown: {},
      employeeBreakdown: {}
    };
    
    // Initialize weekly breakdown (4-5 weeks per month)
    const currentDate = new Date(startDate);
    let weekNumber = 1;
    
    while (currentDate <= endDate) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(currentDate.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekKey = `week${weekNumber}`;
      monthlyData.weeklyBreakdown[weekKey] = {
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd),
        weekNumber: weekNumber,
        hours: 0,
        reports: 0,
        projects: new Set(),
        employees: new Set()
      };
      
      currentDate.setDate(currentDate.getDate() + 7);
      weekNumber++;
    }
    
    // Initialize daily breakdown
    const daysInMonth = endDate.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(startDate.getFullYear(), startDate.getMonth(), day);
      const dayKey = dayDate.toISOString().split('T')[0];
      monthlyData.dailyBreakdown[dayKey] = {
        date: dayDate,
        dayName: dayDate.toLocaleDateString('en-US', { weekday: 'long' }),
        dayNumber: day,
        hours: 0,
        reports: 0,
        projects: new Set()
      };
    }
    
    // Process each report
    reports.forEach(report => {
      const reportDate = new Date(report.date);
      const dayKey = reportDate.toISOString().split('T')[0];
      const projectId = report.project._id.toString();
      const employeeId = report.employee._id.toString();
      
      // Update totals
      monthlyData.totalHours += report.hoursWorked;
      
      // Update weekly breakdown
      const weekNumber = Math.ceil((reportDate.getDate() + new Date(reportDate.getFullYear(), reportDate.getMonth(), 1).getDay()) / 7);
      const weekKey = `week${weekNumber}`;
      if (monthlyData.weeklyBreakdown[weekKey]) {
        monthlyData.weeklyBreakdown[weekKey].hours += report.hoursWorked;
        monthlyData.weeklyBreakdown[weekKey].reports += 1;
        monthlyData.weeklyBreakdown[weekKey].projects.add(projectId);
        monthlyData.weeklyBreakdown[weekKey].employees.add(employeeId);
      }
      
      // Update daily breakdown
      if (monthlyData.dailyBreakdown[dayKey]) {
        monthlyData.dailyBreakdown[dayKey].hours += report.hoursWorked;
        monthlyData.dailyBreakdown[dayKey].reports += 1;
        monthlyData.dailyBreakdown[dayKey].projects.add(projectId);
      }
      
      // Update project breakdown
      if (!monthlyData.projectBreakdown[projectId]) {
        monthlyData.projectBreakdown[projectId] = {
          project: report.project,
          hours: 0,
          reports: 0,
          employees: new Set()
        };
      }
      monthlyData.projectBreakdown[projectId].hours += report.hoursWorked;
      monthlyData.projectBreakdown[projectId].reports += 1;
      monthlyData.projectBreakdown[projectId].employees.add(employeeId);
      
      // Update employee breakdown
      if (!monthlyData.employeeBreakdown[employeeId]) {
        monthlyData.employeeBreakdown[employeeId] = {
          employee: report.employee,
          hours: 0,
          reports: 0,
          projects: new Set()
        };
      }
      monthlyData.employeeBreakdown[employeeId].hours += report.hoursWorked;
      monthlyData.employeeBreakdown[employeeId].reports += 1;
      monthlyData.employeeBreakdown[employeeId].projects.add(projectId);
    });
    
    // Convert Sets to Arrays for JSON serialization
    Object.values(monthlyData.weeklyBreakdown).forEach(week => {
      week.projects = Array.from(week.projects);
      week.employees = Array.from(week.employees);
    });
    
    Object.values(monthlyData.dailyBreakdown).forEach(day => {
      day.projects = Array.from(day.projects);
    });
    
    Object.values(monthlyData.projectBreakdown).forEach(project => {
      project.employees = Array.from(project.employees);
    });
    
    Object.values(monthlyData.employeeBreakdown).forEach(employee => {
      employee.projects = Array.from(employee.projects);
    });
    
    res.json(monthlyData);
  } catch (error) {
    console.error('Error fetching monthly reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
