"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Paper,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Assessment,
  Work,
  Person,
  TrendingUp,
  Add,
  Assignment,
  Home,
  Edit,
  Delete,
  Visibility,
  People,
  AccessTime,
  CalendarToday,
  DateRange,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/contexts/DashboardContext";
import axios from "@/utils/axios";

interface EmployeeStats {
  totalReports: number;
  totalHours: number;
  currentProjects: number;
  thisWeekHours: number;
}

interface RecentReport {
  _id: string;
  date: string;
  hoursWorked: number;
  details: string;
  project: {
    _id: string;
    name: string;
  };
}

interface Project {
  _id: string;
  name: string;
  description: string;
  date: string;
  employees: any[];
}

interface Report {
  _id: string;
  date: string;
  hoursWorked: number;
  details: string;
  project: {
    _id: string;
    name: string;
  };
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

const EmployeeDashboardSimple = () => {
  const { user } = useAuth();
  const { activeTab, setActiveTab } = useDashboard();
  const [stats, setStats] = useState<EmployeeStats>({
    totalReports: 0,
    totalHours: 0,
    currentProjects: 0,
    thisWeekHours: 0,
  });
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Projects data
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectReports, setProjectReports] = useState<Report[]>([]);

  // Reports data
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    project: "",
    date: "",
    details: "",
    hoursWorked: 0,
  });

  // Dialog states
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  // Filter states
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportView, setReportView] = useState("daily");

  // Project details modal
  const [projectDetailsOpen, setProjectDetailsOpen] = useState(false);
  const [selectedProjectDetails, setSelectedProjectDetails] =
    useState<Project | null>(null);
  const [projectReportsForModal, setProjectReportsForModal] = useState<
    Report[]
  >([]);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      console.log(
        "📊 Fetching employee dashboard data for:",
        user?.username,
        "ID:",
        user?.id
      );

      // Try to use the dedicated dashboard endpoint for better performance
      try {
        const dashboardResponse = await axios.get("/dashboard/employee");
        console.log("📊 Dashboard endpoint response:", dashboardResponse.data);

        const {
          stats: dashboardStats,
          recentReports: dashboardRecentReports,
          projects: dashboardProjects,
          reports: dashboardReports,
        } = dashboardResponse.data;

        setStats(dashboardStats);
        setRecentReports(dashboardRecentReports);
        setProjects(dashboardProjects);
        setReports(dashboardReports);
        setProjectReports(dashboardReports);
        setFilteredReports(dashboardReports);

        console.log("✅ Used dashboard endpoint successfully");
        return; // Exit early if dashboard endpoint works
      } catch (dashboardError) {
        console.log(
          "⚠️ Dashboard endpoint not available, falling back to individual endpoints"
        );
      }

      // Fallback: Fetch employee's reports and projects (backend will filter for employee automatically)
      const [reportsResponse, projectsResponse] = await Promise.all([
        axios.get("/reports"),
        axios.get("/projects"),
      ]);

      console.log("📊 Employee reports response:", reportsResponse.data);
      console.log("📊 Employee projects response:", projectsResponse.data);

      // Data is already filtered by backend for employees
      const employeeReports = reportsResponse.data;
      const assignedProjects = projectsResponse.data;

      console.log("📊 Employee reports:", employeeReports);
      console.log("📊 Assigned projects:", assignedProjects);

      // Calculate today's reports
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      const todayReports = employeeReports.filter((report: any) => {
        const reportDate = new Date(report.date);
        return reportDate >= todayStart && reportDate < todayEnd;
      });

      const totalHoursToday = todayReports.reduce(
        (sum: number, report: any) => sum + (report.hoursWorked || 0),
        0
      );
      const totalHours = employeeReports.reduce(
        (sum: number, report: any) => sum + (report.hoursWorked || 0),
        0
      );

      setStats({
        totalReports: todayReports.length,
        totalHours: totalHoursToday,
        currentProjects: assignedProjects.length,
        thisWeekHours: employeeReports.length,
      });

      setRecentReports(employeeReports.slice(0, 5));
      setProjects(assignedProjects);
      setReports(employeeReports);
      setProjectReports(employeeReports);
      setFilteredReports(employeeReports);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenReportDialog = () => {
    setFormData({
      project: "",
      date: new Date().toISOString().split("T")[0], // Default to today
      details: "",
      hoursWorked: 0,
    });
    setEditingReport(null);
    setReportDialogOpen(true);
  };

  const handleCloseReportDialog = () => {
    setReportDialogOpen(false);
    setEditingReport(null);
  };

  const handleSaveReport = async () => {
    try {
      const reportData = {
        project: formData.project,
        date: formData.date,
        details: formData.details,
        hoursWorked: formData.hoursWorked,
      };

      if (editingReport) {
        await axios.put(`/reports/${editingReport._id}`, reportData);
      } else {
        await axios.post("/reports", reportData);
      }

      handleCloseReportDialog();
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error saving report:", error);
    }
  };

  // Filter reports
  const filterReports = React.useCallback(() => {
    let filtered = reports;

    if (selectedProject) {
      filtered = filtered.filter(
        (report) => report.project._id === selectedProject
      );
    }

    if (selectedDate) {
      filtered = filtered.filter((report) => {
        const reportDate = new Date(report.date).toISOString().split("T")[0];
        return reportDate === selectedDate;
      });
    }

    setFilteredReports(filtered);
  }, [selectedProject, selectedDate, reports]);

  // Project details handlers
  const handleViewProjectDetails = async (project: Project) => {
    try {
      setSelectedProjectDetails(project);

      // Fetch reports for this specific project
      const projectReportsResponse = await axios.get(
        `/reports?project=${project._id}`
      );
      setProjectReportsForModal(projectReportsResponse.data);

      setProjectDetailsOpen(true);
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  const handleCloseProjectDetails = () => {
    setProjectDetailsOpen(false);
    setSelectedProjectDetails(null);
    setProjectReportsForModal([]);
  };

  // Calculate total hours for a project
  const calculateProjectTotalHours = (projectId: string) => {
    return reports
      .filter((report) => report.project._id === projectId)
      .reduce((total, report) => total + (report.hoursWorked || 0), 0);
  };

  // Helper function to get week start and end dates
  const getWeekRange = (date: Date) => {
    const dayOfWeek = date.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { start: monday, end: sunday };
  };

  // Helper function to get month start and end dates
  const getMonthRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    return { start, end };
  };

  // Filter reports by week
  const getWeeklyReports = (weekDate: Date) => {
    const { start, end } = getWeekRange(weekDate);
    return reports.filter((report) => {
      const reportDate = new Date(report.date);
      return reportDate >= start && reportDate <= end;
    });
  };

  // Filter reports by month
  const getMonthlyReports = (monthDate: Date) => {
    const { start, end } = getMonthRange(monthDate);
    return reports.filter((report) => {
      const reportDate = new Date(report.date);
      return reportDate >= start && reportDate <= end;
    });
  };

  useEffect(() => {
    filterReports();
  }, [selectedProject, selectedDate, reports, filterReports]);

  // Update reportView when activeTab changes
  useEffect(() => {
    if (activeTab === 2) setReportView("daily");
    else if (activeTab === 3) setReportView("weekly");
    else if (activeTab === 4) setReportView("monthly");
  }, [activeTab]);

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
    <Box>
      {/* Simple Title */}
      <Box mb={4}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="700"
              color="text.primary"
              gutterBottom
            >
              Employee Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage your projects and reports
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={reportView}
            exclusive
            onChange={(event, newView) => {
              if (newView !== null) {
                setReportView(newView);
                // Switch to the appropriate tab
                if (newView === "daily") setActiveTab(2);
                else if (newView === "weekly") setActiveTab(3);
                else if (newView === "monthly") setActiveTab(4);
              }
            }}
            sx={{
              "& .MuiToggleButton-root": {
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                px: 3,
                py: 1,
                textTransform: "none",
                fontWeight: 500,
                "&.Mui-selected": {
                  backgroundColor: "#1976d2",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                },
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              },
            }}
          >
            <ToggleButton value="daily">Daily</ToggleButton>
            <ToggleButton value="weekly">Weekly</ToggleButton>
            <ToggleButton value="monthly">Monthly</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Tabs Interface */}
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="dashboard tabs"
          >
            <Tab label="Overview" />
            <Tab label="Project Details" />
            <Tab label="Daily Reports" />
            <Tab label="Weekly Reports" />
            <Tab label="Monthly Reports" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ mt: 3 }}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Welcome to your dashboard!
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Use the tabs above to navigate between different sections.
              </Typography>

              {/* Employee Profile Summary */}
              <Card
                sx={{ mb: 3, background: "white", border: "1px solid #e0e0e0" }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={3}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "#1976d2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2rem",
                        color: "white",
                      }}
                    >
                      {user?.username?.charAt(0).toUpperCase() || "E"}
                    </Box>
                    <Box>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        gutterBottom
                        color="primary"
                      >
                        {user?.username || "Employee"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Employee ID: {user?.id || "N/A"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Role: Employee
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Recent Projects */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Projects
                  </Typography>
                  {projects.length === 0 ? (
                    <Typography
                      color="text.secondary"
                      textAlign="center"
                      py={2}
                    >
                      No projects assigned yet.
                    </Typography>
                  ) : (
                    <List>
                      {projects.slice(0, 3).map((project) => (
                        <ListItem key={project._id} divider>
                          <ListItemIcon>
                            <Work color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={project.name}
                            secondary={
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {project.description || "No description"}
                                </Typography>
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={1}
                                  mt={1}
                                >
                                  <People fontSize="small" color="action" />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {project.employees?.length || 0} members
                                  </Typography>
                                  <AccessTime fontSize="small" color="action" />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {calculateProjectTotalHours(project._id)}h
                                    total
                                  </Typography>
                                </Box>
                              </Box>
                            }
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleViewProjectDetails(project)}
                            title="View Details"
                          >
                            <Visibility />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>

              {/* Recent Reports */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Reports
                  </Typography>
                  {recentReports.length === 0 ? (
                    <Typography
                      color="text.secondary"
                      textAlign="center"
                      py={2}
                    >
                      No reports submitted yet.
                    </Typography>
                  ) : (
                    <List>
                      {recentReports.slice(0, 3).map((report) => (
                        <ListItem key={report._id} divider>
                          <ListItemIcon>
                            <Assessment color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="subtitle2">
                                  {report.project.name}
                                </Typography>
                                <Chip
                                  label={`${report.hoursWorked}h`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {new Date(report.date).toLocaleDateString()}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mt: 0.5 }}
                                >
                                  {report.details}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Project Details Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                My Projects
              </Typography>
              {projects.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  No projects assigned to you yet.
                </Typography>
              ) : (
                <Card>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <strong>Project Name</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Description</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Date</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Works With</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Total Hours</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Actions</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {projects.map((project) => (
                          <TableRow key={project._id} hover>
                            <TableCell>
                              <Typography
                                variant="subtitle2"
                                fontWeight="medium"
                              >
                                {project.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ maxWidth: 200 }}
                              >
                                {project.description || "No description"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(project.date).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <People fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {project.employees?.length || 0} member(s)
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <AccessTime fontSize="small" color="action" />
                                <Typography variant="body2" fontWeight="medium">
                                  {calculateProjectTotalHours(project._id)}h
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                color="primary"
                                onClick={() =>
                                  handleViewProjectDetails(project)
                                }
                                title="View Details"
                              >
                                <Visibility />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              )}
            </Box>
          )}

          {/* Daily Reports Tab */}
          {activeTab === 2 && (
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6">Daily Reports</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenReportDialog()}
                >
                  Add Report
                </Button>
              </Box>

              {/* Filters */}
              <Box display="flex" gap={2} mb={3} flexWrap="wrap">
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
                <TextField
                  type="date"
                  label="Date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 200 }}
                />
              </Box>

              {/* Reports Table */}
              {filteredReports.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  No reports found. Try adjusting your filters or add a new
                  report.
                </Typography>
              ) : (
                <Card>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Project</TableCell>
                          <TableCell>Hours</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredReports.map((report) => (
                          <TableRow key={report._id} hover>
                            <TableCell>
                              {new Date(report.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={report.project.name}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {report.hoursWorked}h
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ maxWidth: 200 }}
                              >
                                {report.details}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingReport(report);
                                  setFormData({
                                    project: report.project._id,
                                    date: new Date(report.date)
                                      .toISOString()
                                      .split("T")[0],
                                    details: report.details,
                                    hoursWorked: report.hoursWorked,
                                  });
                                  setReportDialogOpen(true);
                                }}
                              >
                                <Edit />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              )}
            </Box>
          )}

          {/* Weekly Reports Tab */}
          {activeTab === 3 && (
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6">Weekly Reports</Typography>
                <Button
                  variant="contained"
                  startIcon={<CalendarToday />}
                  onClick={() =>
                    (window.location.href = "/employee/weekly-reports")
                  }
                >
                  View Full Weekly Reports
                </Button>
              </Box>

              {/* Weekly Filters */}
              <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                <TextField
                  type="date"
                  label="From Date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 200 }}
                />
                <TextField
                  type="date"
                  label="To Date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 200 }}
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
              </Box>

              {/* Weekly Summary */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {fromDate && toDate
                      ? `Reports from ${new Date(
                          fromDate
                        ).toLocaleDateString()} to ${new Date(
                          toDate
                        ).toLocaleDateString()}`
                      : "This Week's Summary"}
                  </Typography>
                  {(() => {
                    let filteredReports = reports;

                    // Filter by date range if provided
                    if (fromDate && toDate) {
                      const startDate = new Date(fromDate);
                      const endDate = new Date(toDate);
                      endDate.setHours(23, 59, 59, 999); // Include the entire end date

                      filteredReports = reports.filter((report) => {
                        const reportDate = new Date(report.date);
                        return reportDate >= startDate && reportDate <= endDate;
                      });
                    } else {
                      // Default to current week if no date range
                      const weekDate = new Date();
                      filteredReports = getWeeklyReports(weekDate);
                    }

                    // Filter by project if selected
                    if (selectedProject) {
                      filteredReports = filteredReports.filter(
                        (report) => report.project._id === selectedProject
                      );
                    }

                    return (
                      <Box display="flex" gap={3} flexWrap="wrap">
                        <Box>
                          <Typography
                            variant="h4"
                            color="primary"
                            fontWeight="bold"
                          >
                            {filteredReports.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Reports This Week
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="h4"
                            color="primary"
                            fontWeight="bold"
                          >
                            {filteredReports.reduce(
                              (total, report) =>
                                total + (report.hoursWorked || 0),
                              0
                            )}
                            h
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Hours This Week
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="h4"
                            color="primary"
                            fontWeight="bold"
                          >
                            {
                              new Set(
                                filteredReports.map(
                                  (report) => report.project._id
                                )
                              ).size
                            }
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Active Projects
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Weekly Reports Table */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Weekly Activity
                  </Typography>
                  {(() => {
                    let filteredReports = reports;

                    // Filter by date range if provided
                    if (fromDate && toDate) {
                      const startDate = new Date(fromDate);
                      const endDate = new Date(toDate);
                      endDate.setHours(23, 59, 59, 999); // Include the entire end date

                      filteredReports = reports.filter((report) => {
                        const reportDate = new Date(report.date);
                        return reportDate >= startDate && reportDate <= endDate;
                      });
                    } else {
                      // Default to current week if no date range
                      const weekDate = new Date();
                      filteredReports = getWeeklyReports(weekDate);
                    }

                    // Filter by project if selected
                    if (selectedProject) {
                      filteredReports = filteredReports.filter(
                        (report) => report.project._id === selectedProject
                      );
                    }

                    return filteredReports.length === 0 ? (
                      <Typography
                        color="text.secondary"
                        textAlign="center"
                        py={2}
                      >
                        No reports found for the selected date range.
                      </Typography>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Project</TableCell>
                              <TableCell>Hours</TableCell>
                              <TableCell>Description</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredReports.map((report) => (
                              <TableRow key={report._id} hover>
                                <TableCell>
                                  {new Date(report.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={report.project.name}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                  >
                                    {report.hoursWorked}h
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{ maxWidth: 200 }}
                                  >
                                    {report.details}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    );
                  })()}
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Monthly Reports Tab */}
          {activeTab === 4 && (
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6">Monthly Reports</Typography>
                <Button
                  variant="contained"
                  startIcon={<DateRange />}
                  onClick={() =>
                    (window.location.href = "/employee/monthly-reports")
                  }
                >
                  View Full Monthly Reports
                </Button>
              </Box>

              {/* Monthly Filters */}
              <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                <TextField
                  type="month"
                  label="Select Month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 200 }}
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
              </Box>

              {/* Monthly Summary */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {selectedMonth
                      ? `${new Date(selectedMonth + "-01").toLocaleDateString(
                          "en-US",
                          { month: "long", year: "numeric" }
                        )} Summary`
                      : "This Month's Summary"}
                  </Typography>
                  {(() => {
                    const monthDate = selectedMonth
                      ? new Date(selectedMonth + "-01")
                      : new Date();
                    const monthlyReports = getMonthlyReports(monthDate);
                    const filteredReports = selectedProject
                      ? monthlyReports.filter(
                          (report) => report.project._id === selectedProject
                        )
                      : monthlyReports;

                    return (
                      <Box display="flex" gap={3} flexWrap="wrap">
                        <Box>
                          <Typography
                            variant="h4"
                            color="primary"
                            fontWeight="bold"
                          >
                            {filteredReports.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Reports This Month
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="h4"
                            color="primary"
                            fontWeight="bold"
                          >
                            {filteredReports.reduce(
                              (total, report) =>
                                total + (report.hoursWorked || 0),
                              0
                            )}
                            h
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Hours This Month
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="h4"
                            color="primary"
                            fontWeight="bold"
                          >
                            {
                              new Set(
                                filteredReports.map(
                                  (report) => report.project._id
                                )
                              ).size
                            }
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Active Projects
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="h4"
                            color="primary"
                            fontWeight="bold"
                          >
                            {filteredReports.length > 0
                              ? Math.round(
                                  (filteredReports.reduce(
                                    (total, report) =>
                                      total + (report.hoursWorked || 0),
                                    0
                                  ) /
                                    filteredReports.length) *
                                    10
                                ) / 10
                              : 0}
                            h
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Avg Hours/Report
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Monthly Reports Table */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monthly Activity
                  </Typography>
                  {(() => {
                    const monthDate = selectedMonth
                      ? new Date(selectedMonth + "-01")
                      : new Date();
                    const monthlyReports = getMonthlyReports(monthDate);
                    const filteredReports = selectedProject
                      ? monthlyReports.filter(
                          (report) => report.project._id === selectedProject
                        )
                      : monthlyReports;

                    return filteredReports.length === 0 ? (
                      <Typography
                        color="text.secondary"
                        textAlign="center"
                        py={2}
                      >
                        No reports found for the selected month.
                      </Typography>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Project</TableCell>
                              <TableCell>Hours</TableCell>
                              <TableCell>Description</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredReports.map((report) => (
                              <TableRow key={report._id} hover>
                                <TableCell>
                                  {new Date(report.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={report.project.name}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                  >
                                    {report.hoursWorked}h
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{ maxWidth: 200 }}
                                  >
                                    {report.details}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    );
                  })()}
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      </Box>

      {/* Add/Edit Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={handleCloseReportDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingReport ? "Edit Report" : "Add New Report"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
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
              fullWidth
              type="date"
              label="Date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
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
              inputProps={{ min: 0, max: 24, step: 0.5 }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Work Details"
              value={formData.details}
              onChange={(e) =>
                setFormData({ ...formData, details: e.target.value })
              }
              placeholder="Describe what you worked on..."
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

      {/* Project Details Dialog */}
      <Dialog
        open={projectDetailsOpen}
        onClose={handleCloseProjectDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Project Details</DialogTitle>
        <DialogContent>
          {selectedProjectDetails && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedProjectDetails.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedProjectDetails.description}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Date Created
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedProjectDetails.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Team Size
                  </Typography>
                  <Typography variant="body1">
                    {selectedProjectDetails.employees?.length || 0} members
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Hours
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="medium"
                    color="primary"
                  >
                    {calculateProjectTotalHours(selectedProjectDetails._id)}h
                  </Typography>
                </Box>
              </Box>

              {/* Team Members */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Team Members
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedProjectDetails.employees?.map(
                      (emp: any, index: number) => (
                        <Chip
                          key={index}
                          label={emp.username || "Unknown"}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* Project Reports */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Project Reports ({projectReportsForModal.length})
                  </Typography>
                  {projectReportsForModal.length === 0 ? (
                    <Typography
                      color="text.secondary"
                      textAlign="center"
                      py={2}
                    >
                      No reports found for this project.
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Employee</TableCell>
                            <TableCell>Hours</TableCell>
                            <TableCell>Description</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {projectReportsForModal.map((report) => (
                            <TableRow key={report._id}>
                              <TableCell>
                                {new Date(report.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={report.employee?.username || "Unknown"}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {report.hoursWorked}h
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{ maxWidth: 200 }}
                                >
                                  {report.details}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProjectDetails} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDashboardSimple;
