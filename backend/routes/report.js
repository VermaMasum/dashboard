const express = require("express");
const Report = require("../models/Report");
const { protect, admin, superAdmin } = require("../middleware/auth");

const router = express.Router();

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private (admin and superAdmin)
router.get("/", protect, async (req, res) => {
  if (req.user.role === "admin" || req.user.role === "superAdmin") {
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
    const reports = await Report.find(query)
      .populate("project", "name")
      .populate("employee", "username");
    res.json(reports);
  } else {
    res.status(401).json({ message: "Not authorized" });
  }
});

// @desc    Create a report
// @route   POST /api/reports
// @access  Private/Admin
router.post("/", protect, async (req, res) => {
  if (req.user.role === "admin" || req.user.role === "superAdmin") {
    try {
      const { date, project, employee, details, hoursWorked } = req.body;
      const report = new Report({
        date,
        project,
        employee,
        details,
        hoursWorked,
      });
      const createdReport = await report.save();
      await createdReport.populate('project', 'name');
      await createdReport.populate('employee', 'username');
      res.status(201).json(createdReport);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.status(401).json({ message: "Not authorized" });
  }
});

// @desc    Update a report
// @route   PUT /api/reports/:id
// @access  Private/Admin
router.put("/:id", protect, async (req, res) => {
  if (req.user.role === "admin" || req.user.role === "superAdmin") {
    try {
      const { date, project, employee, details, hoursWorked } = req.body;
      const report = await Report.findById(req.params.id);
      if (report) {
        report.date = date || report.date;
        report.project = project || report.project;
        report.employee = employee || report.employee;
        report.details = details || report.details;
        report.hoursWorked = hoursWorked || report.hoursWorked;
        const updatedReport = await report.save();
        await updatedReport.populate('project', 'name');
        await updatedReport.populate('employee', 'username');
        res.json(updatedReport);
      } else {
        res.status(404).json({ message: 'Report not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.status(401).json({ message: "Not authorized" });
  }
});

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private/Admin
router.delete("/:id", protect, async (req, res) => {
  if (req.user.role === "admin" || req.user.role === "superAdmin") {
    try {
      const report = await Report.findById(req.params.id);
      if (report) {
        await report.deleteOne();
        res.json({ message: 'Report removed' });
      } else {
        res.status(404).json({ message: 'Report not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.status(401).json({ message: "Not authorized" });
  }
});

module.exports = router;
