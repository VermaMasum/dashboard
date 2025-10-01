"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Grid,
} from "@mui/material";
import { Add, Edit, Delete, Assessment, FilterList } from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/utils/axios";

interface Report {
  _id: string;
  date: string;
  details: string;
  hoursWorked: number;
  project?: {
    _id: string;
    name: string;
  };
  employee?: {
    _id: string;
    username: string;
  };
}

interface Project {
  _id: string;
  name: string;
  description: string;
  employees?: Employee[];
}

interface Employee {
  _id: string;
  username: string;
  role: string;
}

const DailyReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reportDialog, setReportDialog] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [formData, setFormData] = useState({
    project: "",
    employee: "",
    details: "",
    hoursWorked: 0,
    date: new Date().toISOString().split("T")[0],
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedProject, setSelectedProject] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  // Debug: Monitor projects state changes
  useEffect(() => {
    console.log("📊 Projects state updated:", projects);
    console.log("📊 Projects count in state:", projects.length);
  }, [projects]);

  // Debug: Monitor filter changes
  useEffect(() => {
    console.log(
      "📊 Filter state updated - selectedDate:",
      selectedDate,
      "selectedProject:",
      selectedProject
    );
  }, [selectedDate, selectedProject]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("📊 Fetching reports data...");

      const [reportsRes, projectsRes, employeesRes] = await Promise.all([
        axios.get("/reports"),
        axios.get("/projects"),
        axios.get("/users?role=employee"),
      ]);

      console.log("📊 Reports data:", reportsRes.data);
      console.log("📊 Projects data:", projectsRes.data);
      console.log("📊 Employees data:", employeesRes.data);

      // Debug: Check report dates
      reportsRes.data.forEach((report: Report, index: number) => {
        console.log(`📊 Report ${index + 1}:`, {
          id: report._id,
          date: report.date,
          dateType: typeof report.date,
          dateString: new Date(report.date).toDateString(),
          dateISO: new Date(report.date).toISOString(),
        });
      });

      setReports(reportsRes.data);
      setProjects(projectsRes.data);
      setEmployees(employeesRes.data);

      // Debug: Check if projects are being set correctly
      console.log("📊 Projects state will be set to:", projectsRes.data);
      console.log("📊 Projects count:", projectsRes.data.length);
    } catch (err: any) {
      console.error("❌ Error fetching data:", err);
      console.error("❌ Error response:", err.response);
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (report?: Report) => {
    if (report) {
      setEditingReport(report);
      setFormData({
        project: report.project?._id || "",
        employee: report.employee?._id || "",
        details: report.details,
        hoursWorked: report.hoursWorked,
        date: report.date.split("T")[0],
      });
    } else {
      setEditingReport(null);
      setFormData({
        project: "",
        employee: "",
        details: "",
        hoursWorked: 0,
        date: new Date().toISOString().split("T")[0],
      });
    }
    setReportDialog(true);
  };

  const handleCloseDialog = () => {
    setReportDialog(false);
    setEditingReport(null);
    setFormData({
      project: "",
      employee: "",
      details: "",
      hoursWorked: 0,
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingReport) {
        await axios.put(`/reports/${editingReport._id}`, formData);
        setSuccess("Report updated successfully");
      } else {
        await axios.post("/reports", formData);
        setSuccess("Report created successfully");
      }
      handleCloseDialog();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save report");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await axios.delete(`/reports/${id}`);
        setSuccess("Report deleted successfully");
        fetchData();
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete report");
      }
    }
  };

  const todayReports = reports.filter((r) => {
    const reportDate = new Date(r.date);
    const today = new Date();
    return reportDate.toDateString() === today.toDateString();
  });
  const totalHoursToday = todayReports.reduce(
    (sum, report) => sum + report.hoursWorked,
    0
  );

  const filteredReports = reports.filter((report) => {
    // Handle date filtering more robustly
    let reportDate;

    // Handle date parsing
    reportDate = new Date(report.date);

    // Single date filtering logic
    const filterDate = new Date(selectedDate);

    // Compare dates by setting time to start of day
    const reportDateOnly = new Date(
      reportDate.getFullYear(),
      reportDate.getMonth(),
      reportDate.getDate()
    );
    const filterDateOnly = new Date(
      filterDate.getFullYear(),
      filterDate.getMonth(),
      filterDate.getDate()
    );

    const dateMatch = reportDateOnly.getTime() === filterDateOnly.getTime();

    const projectMatch =
      !selectedProject || report.project?._id === selectedProject;

    // Debug: Log filtering details
    console.log("🔍 Filtering report:", {
      reportId: report._id,
      reportDate: report.date,
      reportDateType: typeof report.date,
      selectedDate,
      dateMatch,
      projectMatch,
      finalMatch: dateMatch && projectMatch,
    });

    return dateMatch && projectMatch;
  });

  // Debug: Monitor filtered reports
  useEffect(() => {
    console.log("📊 Filtered reports count:", filteredReports.length);
  }, [filteredReports]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        {/* <Typography variant="h4" sx={ fontWeight: "bold", color: "#1976D2"}>
          Project Details
        </Typography> */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Report
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Today&apos;s Reports
                  </Typography>
                  <Typography variant="h4">{todayReports.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Hours Today
                  </Typography>
                  <Typography variant="h4">{totalHoursToday}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Reports
                  </Typography>
                  <Typography variant="h4">{reports.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Projects
                  </Typography>
                  <Typography variant="h4">{projects.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
        <TextField
          type="date"
          label="Select Date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200 }}
        />
        <Button
          variant="outlined"
          onClick={() =>
            setSelectedDate(new Date().toISOString().split("T")[0])
          }
          size="small"
        >
          Today
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            setSelectedDate(yesterday.toISOString().split("T")[0]);
          }}
          size="small"
        >
          Yesterday
        </Button>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Project</InputLabel>
          <Select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            label="Filter by Project"
            disabled={loading}
          >
            <MenuItem value="">All Projects</MenuItem>
            {loading ? (
              <MenuItem disabled>Loading projects...</MenuItem>
            ) : projects.length === 0 ? (
              <MenuItem disabled>No projects available</MenuItem>
            ) : (
              projects.map((project) => (
                <MenuItem key={project._id} value={project._id}>
                  {project.name} ({project.employees?.length || 0} employees)
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          onClick={() => {
            setSelectedProject("");
            setSelectedDate(new Date().toISOString().split("T")[0]);
          }}
          size="small"
          disabled={!selectedProject}
        >
          Clear Filters
        </Button>
      </Box>

      {/* Filter Status */}
      {/* <Box mb={2}> */}
      {/* <Typography variant="body2" color="textSecondary">
          Showing reports for: <strong>{new Date(selectedDate).toLocaleDateString()}</strong>
          {selectedProject && (
            <>
              {' '}from project: <strong>{projects.find(p => p._id === selectedProject)?.name || 'Unknown'}</strong>
            </>
          )}
          {' '}({filteredReports.length} reports found)
        </Typography> */}

      {/* Debug: Show available dates */}
      {/* <Box mt={1}>
          <Typography variant="caption" color="textSecondary">
            Available dates in reports:{" "}
            {Array.from(
              new Set(reports.map((r) => new Date(r.date).toDateString()))
            )
              .sort()
              .join(", ")}
          </Typography>
        </Box> */}
      {/* </Box> */}

      {/* Reports Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Hours</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.map((report) => (
              <TableRow key={report._id}>
                <TableCell>
                  {new Date(report.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={report.project?.name || "No Project"}
                    color="primary"
                    size="small"
                  />
                </TableCell>
                <TableCell>{report.employee?.username || "Unknown"}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200 }}>
                    {report.details}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {report.hoursWorked}h
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(report)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(report._id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Report Dialog */}
      <Dialog
        open={reportDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingReport ? "Edit Report" : "Create New Report"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Project</InputLabel>
              <Select
                value={formData.project}
                onChange={(e) =>
                  setFormData({ ...formData, project: e.target.value })
                }
                required
              >
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.name} ({project.employees?.length || 0} employees)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Employee</InputLabel>
              <Select
                value={formData.employee}
                onChange={(e) =>
                  setFormData({ ...formData, employee: e.target.value })
                }
                required
              >
                {(() => {
                  // Only show employees who are assigned to the selected project
                  const selectedProject = projects.find(
                    (p) => p._id === formData.project
                  );
                  const assignedEmployees = selectedProject?.employees || [];

                  console.log("🔍 Employee filtering debug:", {
                    selectedProjectId: formData.project,
                    selectedProject: selectedProject,
                    assignedEmployees: assignedEmployees,
                    allEmployees: employees.length,
                  });

                  if (!formData.project) {
                    return (
                      <MenuItem disabled>
                        Please select a project first
                      </MenuItem>
                    );
                  }

                  if (assignedEmployees.length === 0) {
                    return (
                      <MenuItem disabled>
                        No employees assigned to this project
                      </MenuItem>
                    );
                  }

                  return assignedEmployees.map((employee: Employee) => {
                    // employee is already populated with username and _id
                    return (
                      <MenuItem key={employee._id} value={employee._id}>
                        {employee.username} ({employee.role || "employee"})
                      </MenuItem>
                    );
                  });
                })()}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Details"
              value={formData.details}
              onChange={(e) =>
                setFormData({ ...formData, details: e.target.value })
              }
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              type="number"
              label="Hours Worked"
              value={formData.hoursWorked}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hoursWorked: Number(e.target.value),
                })
              }
              margin="normal"
              inputProps={{ min: 0, max: 24, step: 0.5 }}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingReport ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DailyReports;
