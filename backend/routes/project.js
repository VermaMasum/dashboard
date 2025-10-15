const express = require("express");
const Project = require("../models/Project");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private (admin, superAdmin, and employees)
router.get("/", protect, async (req, res) => {
  try {
    const { date } = req.query;
    let query = {};
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    // If user is employee, only show projects they are assigned to
    if (req.user.role === "employee") {
      query.employees = req.user._id;
      console.log("🔍 Employee filtering projects for user ID:", req.user._id);
    }
    // If user is admin or superAdmin, show all projects

    const projects = await Project.find(query).populate(
      "employees",
      "username"
    );
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
router.post("/", protect, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
    return res.status(401).json({ message: "Not authorized" });
  }
  console.log("Request body:", req.body);
  const { name, description, date, employees, status } = req.body;
  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "Project name is required" });
  }
  let employeeIds = [];
  if (employees) {
    if (Array.isArray(employees)) {
      employeeIds = employees;
    } else if (typeof employees === "string") {
      try {
        employeeIds = JSON.parse(employees);
      } catch (e) {
        employeeIds = [];
      }
    }
  }
  const project = new Project({
    name,
    description,
    date,
    employees: employeeIds,
    status: status || "not started",
  });
  const createdProject = await project.save();
  await createdProject.populate("employees", "username");
  res.status(201).json(createdProject);
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
router.put("/:id", protect, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
    return res.status(401).json({ message: "Not authorized" });
  }
  try {
    console.log(
      "PUT request for project",
      req.params.id,
      "with body:",
      req.body
    );
    const { name, description, employees, status } = req.body;
    const project = await Project.findById(req.params.id);
    if (project) {
      if (name !== undefined) project.name = name;
      if (description !== undefined) project.description = description;
      if (employees !== undefined) project.employees = employees;
      if (status !== undefined) project.status = status;
      const updatedProject = await project.save();
      await updatedProject.populate("employees", "username");
      console.log("Updated project:", updatedProject);
      res.json(updatedProject);
    } else {
      res.status(404).json({ message: "Project not found" });
    }
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
router.delete("/:id", protect, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
    return res.status(401).json({ message: "Not authorized" });
  }
  const project = await Project.findByIdAndDelete(req.params.id);
  if (project) {
    res.json({ message: "Project removed" });
  } else {
    res.status(404).json({ message: "Project not found" });
  }
});

// @desc    Assign employee to project
// @route   POST /api/projects/:id/assign
// @access  Private/Admin
router.post("/:id/assign", protect, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
    return res.status(401).json({ message: "Not authorized" });
  }
  try {
    const { employeeId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (!project.employees.includes(employeeId)) {
      project.employees.push(employeeId);
      await project.save();
    }
    await project.populate("employees", "username role");
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Unassign employee from project
// @route   POST /api/projects/:id/unassign
// @access  Private/Admin
router.post("/:id/unassign", protect, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
    return res.status(401).json({ message: "Not authorized" });
  }
  try {
    const { employeeId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    project.employees = project.employees.filter(
      (id) => id.toString() !== employeeId
    );
    await project.save();
    await project.populate("employees", "username role");
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get all projects assigned to a specific employee
// @route   GET /api/projects/:employeeId/assign
// @access  Private (admin, superAdmin, and employees)
router.get("/:employeeId/assign", protect, async (req, res) => {
  try {
    const { employeeId } = req.params;

    // If logged-in user is an employee, they can only fetch their own projects
    if (
      req.user.role === "employee" &&
      req.user._id.toString() !== employeeId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view other employee's projects" });
    }

    const projects = await Project.find({ employees: employeeId }).populate(
      "employees",
      "username role"
    );

    if (!projects || projects.length === 0) {
      return res
        .status(404)
        .json({ message: "No projects found for this employee" });
    }

    res.json(projects);
  } catch (error) {
    console.error("Error fetching employee projects:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
