const express = require("express");
const Report = require("../models/Report");
const { protect, admin, superAdmin } = require("../middleware/auth");

const router = express.Router();

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private (admin and superAdmin)
router.get("/", protect, async (req, res) => {
  try {
    const { date, project } = req.query;
    let query = {};
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    if (project) {
      query.project = project;
    }
    
    // If user is employee, only show their own reports
    if (req.user.role === "employee") {
      query.employee = req.user._id;
    }
    // If user is admin or superAdmin, show all reports
    
    const reports = await Report.find(query)
      .populate("project", "name")
      .populate("employee", "username");
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

module.exports = router;
