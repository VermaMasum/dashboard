"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  IconButton,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { Add } from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/utils/axios";

interface Project {
  _id: string;
  name: string;
  description: string;
}

interface Report {
  _id: string;
  project: {
    _id: string;
    name: string;
  };
  date: string;
  details: string;
  hoursWorked: number;
  employee: {
    _id: string;
    username: string;
  };
}

interface FormData {
  project: string;
  date: string;
  details: string;
  hoursWorked: number;
}

const EmployeeReports = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  // Track project status for filtering
  const [projectStatusMap, setProjectStatusMap] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [reportView, setReportView] = useState("daily");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filter states - Set defaults to current date/week/month
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [fromDate, setFromDate] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(today.getDate() + mondayOffset);
    return monday.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(today.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return sunday.toISOString().split("T")[0];
  });

  // Dialog states
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [viewReportDialog, setViewReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [formData, setFormData] = useState<FormData>({
    project: "",
    date: "",
    details: "",
    hoursWorked: 0,
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching reports data for user:", user?.username);

      const [projectsResponse, reportsResponse] = await Promise.all([
        axios.get("/projects"),
        axios.get("/reports"),
      ]);

      console.log("📋 Projects response:", projectsResponse.data);
      console.log("📊 Reports response:", reportsResponse.data);
      console.log("📊 Reports sample:", reportsResponse.data[0]);
      console.log("📊 Total reports count:", reportsResponse.data.length);

      // Handle both paginated and non-paginated responses
      const projectsData = projectsResponse.data.data || projectsResponse.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setReports(reportsResponse.data);
      // Build a map of projectId -> status
      const statusMap: Record<string, string> = {};
      projectsData.forEach((project: any) => {
        statusMap[project._id] = project.status || "unknown";
      });
      setProjectStatusMap(statusMap);

      console.log("📊 Project status map:", statusMap);
    } catch (error: any) {
      console.error("❌ Error fetching data:", error);
      console.error("Error details:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getWeekRange = (date: string) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    console.log(
      "📅 Week range for date",
      date,
      ":",
      monday.toISOString(),
      "to",
      sunday.toISOString()
    );
    return { start: monday, end: sunday };
  };

  const getMonthRange = (month: string) => {
    const [year, monthNum] = month.split("-");
    const start = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const end = new Date(parseInt(year), parseInt(monthNum), 0);
    console.log(
      "📅 Month range for",
      month,
      ":",
      start.toISOString(),
      "to",
      end.toISOString()
    );
    return { start, end };
  };

  // Filter functions
  const getDailyReports = () => {
    let filtered = reports;
    console.log("📊 Daily reports - Total reports:", reports.length);
    console.log("📊 Daily reports - Selected date:", selectedDate);
    console.log("📊 Daily reports - Selected project:", selectedProject);

    // Filter by project if selected
    if (selectedProject) {
      filtered = filtered.filter(
        (report) => report.project && report.project._id === selectedProject
      );
      console.log("📊 After project filter:", filtered.length);
    }

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter((report) => {
        const reportDate = new Date(report.date).toISOString().split("T")[0];
        const selectedDateFormatted = new Date(selectedDate)
          .toISOString()
          .split("T")[0];
        const matches = reportDate === selectedDateFormatted;
        console.log("📊 Date comparison:", {
          reportDate,
          selectedDateFormatted,
          matches,
          reportId: report._id,
        });
        return matches;
      });
      console.log("📊 After date filter:", filtered.length);
    }

    console.log("📊 Final daily reports count:", filtered.length);
    return filtered;
  };

  const getWeeklyReports = () => {
    let filtered = reports;

    // Filter by project if selected
    if (selectedProject) {
      filtered = filtered.filter(
        (report) => report.project && report.project._id === selectedProject
      );
    }

    // Filter by date range
    if (fromDate && toDate) {
      filtered = filtered.filter((report) => {
        const reportDate = new Date(report.date).toISOString().split("T")[0];
        const fromDateFormatted = new Date(fromDate)
          .toISOString()
          .split("T")[0];
        const toDateFormatted = new Date(toDate).toISOString().split("T")[0];
        return reportDate >= fromDateFormatted && reportDate <= toDateFormatted;
      });
    }

    return filtered;
  };

  const getMonthlyReports = () => {
    let filtered = reports;

    // Filter by project if selected
    if (selectedProject) {
      filtered = filtered.filter(
        (report) => report.project && report.project._id === selectedProject
      );
    }

    // Filter by month
    if (selectedMonth) {
      const { start, end } = getMonthRange(selectedMonth);
      filtered = filtered.filter((report) => {
        const reportDate = new Date(report.date);
        return reportDate >= start && reportDate <= end;
      });
    }

    return filtered;
  };

  // Dialog handlers
  const handleOpenReportDialog = (report?: Report) => {
    if (report) {
      setEditingReport(report);
      setFormData({
        project: report.project?._id || "",
        date: report.date,
        details: report.details,
        hoursWorked: report.hoursWorked,
      });
    } else {
      setEditingReport(null);
      setFormData({
        project: "",
        date: new Date().toISOString().split("T")[0],
        details: "",
        hoursWorked: 0,
      });
    }
    setReportDialogOpen(true);
  };

  const handleCloseReportDialog = () => {
    setReportDialogOpen(false);
    setEditingReport(null);
    setFormData({
      project: "",
      date: "",
      details: "",
      hoursWorked: 0,
    });
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setViewReportDialog(true);
  };

  const handleCloseViewReportDialog = () => {
    setViewReportDialog(false);
    setSelectedReport(null);
  };

  const handleSaveReport = async () => {
    // Prevent saving for projects not 'in progress' or 'completed'
    const selectedProjectStatus = (projectStatusMap[formData.project] || "")
      .trim()
      .toLowerCase();
    if (
      !(
        selectedProjectStatus === "in progress" ||
        selectedProjectStatus === "completed"
      )
    ) {
      setError(
        "You cannot add a time entry for a project that is not in progress or completed."
      );
      return;
    }
    try {
      setError(""); // Clear any previous errors
      if (editingReport) {
        await axios.put(`/reports/${editingReport._id}`, formData);
        setSuccess("Report updated successfully!");
      } else {
        await axios.post("/reports", formData);
        setSuccess("Report added successfully!");
      }
      await fetchData();
      handleCloseReportDialog();
    } catch (error: any) {
      console.error("Error saving report:", error);
      setError(
        error.response?.data?.message ||
          "Failed to save report. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          Reports
        </Typography>

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

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          {/* Toggle Button Group - Left Side */}
          <ToggleButtonGroup
            value={reportView}
            exclusive
            onChange={(event, newView) => {
              if (newView !== null) {
                setReportView(newView);
              }
            }}
            sx={{
              "& .MuiToggleButton-root": {
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                px: 3,
                py: 1.5,
                textTransform: "none",
                fontWeight: "bold",
                "&.Mui-selected": {
                  backgroundColor: "#2196F3",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#1976D2",
                  },
                },
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              },
            }}
          >
            <ToggleButton value="daily">Daily Reports</ToggleButton>
            <ToggleButton value="weekly">Weekly Reports</ToggleButton>
            <ToggleButton value="monthly">Monthly Reports</ToggleButton>
          </ToggleButtonGroup>

          {/* Add Report Button - Right Side */}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenReportDialog()}
            sx={{
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              color: "white",
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": {
                background: "linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)",
              },
            }}
          >
            Add Report
          </Button>
        </Box>
      </Box>

      {/* Spacing below toggle buttons */}
      <Box sx={{ mb: 3 }} />

      {/* Daily Reports */}
      {reportView === "daily" && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Daily Reports ({getDailyReports().length} reports)
            </Typography>

            {/* Filters */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 3,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <TextField
                label="Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Project</InputLabel>
                <Select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  label="Project"
                >
                  <MenuItem value="">All Projects</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                onClick={() => {
                  const today = new Date();
                  setSelectedDate(today.toISOString().split("T")[0]);
                  setSelectedProject("");
                }}
                sx={{ minWidth: 120 }}
              >
                Reset to Today
              </Button>
            </Box>

            {/* Daily Reports Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Project</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Details</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Hours</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getDailyReports().map((report) => (
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
                      <TableCell
                        sx={{
                          maxWidth: "300px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={report.details}
                      >
                        {report.details}
                      </TableCell>
                      <TableCell>{report.hoursWorked}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleViewReport(report)}
                          color="primary"
                          size="small"
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Weekly Reports */}
      {reportView === "weekly" && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Weekly Reports ({getWeeklyReports().length} reports)
            </Typography>

            {/* Filters */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 3,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <TextField
                label="From Date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
              <TextField
                label="To Date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Project</InputLabel>
                <Select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  label="Project"
                >
                  <MenuItem value="">All Projects</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                onClick={() => {
                  const today = new Date();
                  const monday = new Date(today);
                  const dayOfWeek = today.getDay();
                  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                  monday.setDate(today.getDate() + mondayOffset);
                  const sunday = new Date(monday);
                  sunday.setDate(monday.getDate() + 6);
                  setFromDate(monday.toISOString().split("T")[0]);
                  setToDate(sunday.toISOString().split("T")[0]);
                  setSelectedProject("");
                }}
                sx={{ minWidth: 120 }}
              >
                Reset to This Week
              </Button>
            </Box>

            {/* Weekly Reports Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Project</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Details</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Hours</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getWeeklyReports().map((report) => (
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
                      <TableCell
                        sx={{
                          maxWidth: "300px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={report.details}
                      >
                        {report.details}
                      </TableCell>
                      <TableCell>{report.hoursWorked}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleViewReport(report)}
                          color="primary"
                          size="small"
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Monthly Reports */}
      {reportView === "monthly" && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Monthly Reports ({getMonthlyReports().length} reports)
            </Typography>

            {/* Filters */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 3,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <TextField
                label="Month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
                placeholder="YYYY-MM"
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Project</InputLabel>
                <Select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  label="Project"
                >
                  <MenuItem value="">All Projects</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                onClick={() => {
                  const today = new Date();
                  setSelectedMonth(
                    `${today.getFullYear()}-${String(
                      today.getMonth() + 1
                    ).padStart(2, "0")}`
                  );
                  setSelectedProject("");
                }}
                sx={{ minWidth: 120 }}
              >
                Reset to This Month
              </Button>
            </Box>

            {/* Monthly Reports Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Project</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Details</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Hours</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getMonthlyReports().map((report) => (
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
                      <TableCell
                        sx={{
                          maxWidth: "300px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={report.details}
                      >
                        {report.details}
                      </TableCell>
                      <TableCell>{report.hoursWorked}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleViewReport(report)}
                          color="primary"
                          size="small"
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* View Report Dialog */}
      <Dialog
        open={viewReportDialog}
        onClose={handleCloseViewReportDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
            >
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedReport.date).toLocaleDateString()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Project
                </Typography>
                <Typography variant="body1">
                  {selectedReport.project?.name || "No Project"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Details
                </Typography>
                <Box
                  sx={{
                    maxHeight: "200px",
                    overflow: "auto",
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    padding: 1,
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {selectedReport.details}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Hours Worked
                </Typography>
                <Typography variant="body1">
                  {selectedReport.hoursWorked}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Employee
                </Typography>
                <Typography variant="body1">
                  {selectedReport.employee?.username || "Unknown"}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewReportDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={handleCloseReportDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingReport ? "Edit Report" : "Add New Report"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Project</InputLabel>
              <Select
                value={formData.project}
                onChange={(e) =>
                  setFormData({ ...formData, project: e.target.value })
                }
                label="Project"
              >
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Details"
              multiline
              rows={3}
              value={formData.details}
              onChange={(e) =>
                setFormData({ ...formData, details: e.target.value })
              }
              fullWidth
            />

            <TextField
              label="Hours Worked"
              type="number"
              value={formData.hoursWorked}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hoursWorked: parseFloat(e.target.value) || 0,
                })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportDialog}>Cancel</Button>
          <Button onClick={handleSaveReport} variant="contained">
            {editingReport ? "Update Report" : "Add Report"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeReports;
