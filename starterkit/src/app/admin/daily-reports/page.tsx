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
  Snackbar,
  Pagination,
  Stack,
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
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData(currentPage, pagination.limit);
  }, [currentPage]);

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

  const fetchData = async (page = 1, limit = 5) => {
    try {
      setLoading(true);
      console.log("📊 Fetching reports data...");

      const [reportsRes, projectsRes, employeesRes] = await Promise.all([
        axios.get(`/reports?page=${page}&limit=${limit}`),
        axios.get("/projects"),
        axios.get("/users?role=employee"),
      ]);

      console.log("📊 Reports data:", reportsRes.data);
      console.log("📊 Projects data:", projectsRes.data);
      console.log("📊 Employees data:", employeesRes.data);

      const newReports = reportsRes.data.data || [];
      const newPagination = {
        total: reportsRes.data.total || 0,
        page: reportsRes.data.page || 1,
        limit: reportsRes.data.limit || 5,
        totalPages: reportsRes.data.totalPages || 0,
      };

      console.log("Setting reports:", newReports);
      console.log("Setting pagination:", newPagination);

      setReports(newReports);
      setPagination(newPagination);
      setCurrentPage(newPagination.page);
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
      fetchData(currentPage, pagination.limit);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save report");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await axios.delete(`/reports/${id}`);
        setSuccess("Report deleted successfully");
        fetchData(currentPage, pagination.limit);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete report");
      }
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
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

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSuccess("")}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>

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
            {reports.map((report) => (
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

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Stack spacing={2}>
          <Pagination
            count={pagination.totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
          <Typography variant="body2" color="textSecondary" textAlign="center">
            Showing {reports.length} of {pagination.total} reports
          </Typography>
        </Stack>
      </Box>

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
