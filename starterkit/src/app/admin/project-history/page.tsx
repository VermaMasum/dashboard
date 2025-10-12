"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Snackbar,
} from "@mui/material";
import {
  Edit,
  CheckCircle,
  PlayCircle,
  PauseCircle,
} from "@mui/icons-material";
import axios from "@/utils/axios";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

interface TimeEntry {
  _id: string;
  project: { _id: string; name: string; status?: string };
  employee: { _id: string; username: string };
  duration: number;
  date: string;
  description: string;
  category: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  date: string;
  createdAt: string;
  employees?: (string | { _id: string; username: string })[];
}

interface Employee {
  _id: string;
  username: string;
  email: string;
}

const ProjectHistory = () => {
  const [allTimeEntries, setAllTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Status editing
  const [statusEditDialog, setStatusEditDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Dropdown filter state
  const [selectedStatus, setSelectedStatus] = useState<string>("in progress");

  // Project selection and editing state
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [editForm, setEditForm] = useState({
    duration: 0,
    description: "",
    category: "",
    employeeId: "",
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setAnalyticsLoading(true);
      const [reportsRes, projectsRes, employeesRes] = await Promise.all([
        axios.get("/reports"),
        axios.get("/projects"),
        axios.get("/users/all"),
      ]);

      let allReports = reportsRes.data;
      const allProjects = projectsRes.data;
      const allUsers = employeesRes.data.all || employeesRes.data;
      const employeeUsers = Array.isArray(allUsers)
        ? allUsers.filter((user: any) => user.role === "employee")
        : [];

      // Process reports
      allReports = allReports.map((report: any) => ({
        ...report,
        duration:
          report.duration ||
          (report.hoursWorked ? report.hoursWorked * 60 : 0) ||
          0,
        description:
          report.description ||
          report.details ||
          report.title ||
          "No description provided",
        category: report.category || "General",
        employee: report.employee || {
          _id: "unknown",
          username: "Unknown Employee",
        },
        project: report.project || { _id: "unknown", name: "General Work" },
      }));

      // Sort by date (newest first)
      allReports.sort(
        (a: TimeEntry, b: TimeEntry) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setAllTimeEntries(allReports);
      setProjects(allProjects);
      setEmployees(employeeUsers);
    } catch (err: any) {
      console.error("Error fetching analytics data:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const getProjectAnalytics = () => {
    const projectStats = projects.map((project) => {
      const projectEntries = allTimeEntries.filter(
        (entry) => entry.project?._id === project._id
      );
      const totalMinutes = projectEntries.reduce(
        (sum, entry) => sum + (entry.duration || 0),
        0
      );
      const uniqueEmployees = new Set(
        projectEntries.map((entry) => entry.employee?._id)
      ).size;
      const totalDays = new Set(projectEntries.map((entry) => entry.date)).size;

      return {
        project,
        totalHours: totalMinutes / 60,
        totalMinutes,
        entryCount: projectEntries.length,
        uniqueEmployees,
        totalDays,
        entries: projectEntries,
      };
    });

    return projectStats.sort((a, b) => b.totalHours - a.totalHours);
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedProject || !newStatus) return;

    try {
      setError("");
      await axios.put(`/projects/${selectedProject._id}`, {
        status: newStatus,
      });

      // Update local state
      setProjects((prev) =>
        prev.map((project) =>
          project._id === selectedProject._id
            ? { ...project, status: newStatus }
            : project
        )
      );

      setStatusEditDialog(false);
      setSelectedProject(null);
      setNewStatus("");
      setSuccessMessage("Project status updated successfully!");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update project status"
      );
    }
  };

  const openStatusEdit = (project: Project) => {
    setSelectedProject(project);
    setNewStatus(project.status);
    setStatusEditDialog(true);
  };

  const openEditDialog = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setEditForm({
      duration: entry.duration,
      description: entry.description,
      category: entry.category,
      employeeId: entry.employee._id,
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingEntry) return;

    try {
      setError("");
      await axios.put(`/reports/${editingEntry._id}`, editForm);

      // Update local state
      setAllTimeEntries((prev) =>
        prev.map((entry) =>
          entry._id === editingEntry._id
            ? {
                ...entry,
                duration: editForm.duration,
                description: editForm.description,
                category: editForm.category,
                employee:
                  employees.find((emp) => emp._id === editForm.employeeId) ||
                  entry.employee,
              }
            : entry
        )
      );

      setEditDialogOpen(false);
      setEditingEntry(null);
      setSuccessMessage("Time entry updated successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update time entry");
    }
  };

  // Filter projects based on dropdown
  const filteredProjects = projects.filter((p) => {
    if (selectedStatus === "not started")
      return p.status === "not started" || !p.status;
    return p.status === selectedStatus;
  });

  if (analyticsLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Project History...
        </Typography>
      </Box>
    );
  }

  return (
    <PageContainer
      title="Project History"
      description="Manage project status and view project analytics"
    >
      <Box sx={{ p: 3 }}>
        {/* Breadcrumbs */}
        {/* <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          href="/admin/dashboard"
          color="inherit"
          sx={{ textDecoration: "none" }}
        >
          Admin
        </Link>
        <Typography color="text.primary">Project History</Typography>
      </Breadcrumbs> */}

        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ mb: 3 }}
          color="#1976D2"
        >
          Project History
        </Typography>

        {/* Dropdown Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="Status Filter"
            >
              <MenuItem value="not started">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PauseCircle sx={{ color: "#9e9e9e" }} />
                  Not Started
                </Box>
              </MenuItem>
              <MenuItem value="in progress">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PlayCircle sx={{ color: "#ff9800" }} />
                  In Progress
                </Box>
              </MenuItem>
              <MenuItem value="completed">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircle sx={{ color: "#4caf50" }} />
                  Completed
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>Select Project</InputLabel>
            <Select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              label="Select Project"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {projects.map((project) => (
                <MenuItem key={project._id} value={project._id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Project Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Total Hours</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Created Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Team Size</TableCell>
                {/* <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => {
                  const projectStats = getProjectAnalytics().find(
                    (stat) => stat.project._id === project._id
                  );

                  const effectiveStatus =
                    !projectStats ||
                    (projectStats.totalHours === 0 &&
                      projectStats.totalDays === 0)
                      ? "not started"
                      : project.status || "not started";

                  const assignedEmployees = Array.isArray(project.employees)
                    ? project.employees.filter(
                        (emp) => typeof emp === "object" && emp !== null
                      )
                    : [];

                  return (
                    <TableRow
                      key={project._id}
                      sx={{ "&:hover": { backgroundColor: "#e1f5fe" } }}
                    >
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold">
                          {project.name}
                        </Typography>
                      </TableCell>
                      {/* <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {project.description || "No description provided"}
                      </Typography>
                    </TableCell> */}
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="primary"
                        >
                          {projectStats
                            ? `${projectStats.totalHours.toFixed(1)}h`
                            : "0h"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(
                            project.date || project.createdAt
                          ).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {assignedEmployees.length} members
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => openStatusEdit(project)}
                        >
                          Edit Status
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No projects in &quot;{selectedStatus}&quot; status
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Project History for Selected Project */}
        {selectedProjectId && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              📋 Time Entries for{" "}
              {projects.find((p) => p._id === selectedProjectId)?.name}
            </Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Duration (hours)
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Description
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
                    {/* <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allTimeEntries
                    .filter((entry) => entry.project._id === selectedProjectId)
                    .map((entry) => (
                      <TableRow
                        key={entry._id}
                        sx={{ "&:hover": { backgroundColor: "#e1f5fe" } }}
                      >
                        <TableCell>{entry.employee.username}</TableCell>
                        <TableCell>
                          {new Date(entry.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {(entry.duration / 60).toFixed(1)}
                        </TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.category}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => openEditDialog(entry)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Status Edit Dialog */}
        <Dialog
          open={statusEditDialog}
          onClose={() => setStatusEditDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Update Project Status</DialogTitle>
          <DialogContent>
            {selectedProject && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {selectedProject.name}
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Project Status</InputLabel>
                  <Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    label="Project Status"
                  >
                    <MenuItem value="not started">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PauseCircle sx={{ color: "#9e9e9e" }} />
                        Not Started
                      </Box>
                    </MenuItem>
                    <MenuItem value="in progress">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PlayCircle sx={{ color: "#ff9800" }} />
                        In Progress
                      </Box>
                    </MenuItem>
                    <MenuItem value="completed">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CheckCircle sx={{ color: "#4caf50" }} />
                        Completed
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusEditDialog(false)}>Cancel</Button>
            <Button onClick={handleStatusUpdate} variant="contained">
              Update Status
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Time Entry Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Time Entry</DialogTitle>
          <DialogContent>
            {editingEntry && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {editingEntry.project.name} - {editingEntry.employee.username}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="Duration (minutes)"
                    type="number"
                    value={editForm.duration}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    fullWidth
                  />
                  <TextField
                    label="Description"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    fullWidth
                  />
                  <TextField
                    label="Category"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>Employee</InputLabel>
                    <Select
                      value={editForm.employeeId}
                      onChange={(e) =>
                        setEditForm({ ...editForm, employeeId: e.target.value })
                      }
                      label="Employee"
                    >
                      {employees.map((emp) => (
                        <MenuItem key={emp._id} value={emp._id}>
                          {emp.username}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary">
                    Project Status: {editingEntry?.project?.status || "Not Set"}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} variant="contained">
              Update Entry
            </Button>
          </DialogActions>
        </Dialog>

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError("")}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setError("")}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>

        {/* Success Snackbar */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSuccessMessage("")}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>
    </PageContainer>
  );
};

export default ProjectHistory;
