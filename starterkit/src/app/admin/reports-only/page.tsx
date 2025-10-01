"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Assessment,
  Refresh,
  Search,
  Person,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/utils/axios";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

interface Report {
  _id: string;
  date: string;
  project: {
    _id: string;
    name: string;
  } | null;
  employee: {
    _id: string;
    username: string;
  } | null;
  details: string;
  hoursWorked: number;
  title: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
}

interface Employee {
  _id: string;
  username: string;
  role: string;
}

const ReportsOnly = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // View states - using tabs instead of filters
  const [timePeriod, setTimePeriod] = useState<"day" | "week" | "month">("day");
  const [viewCategory, setViewCategory] = useState<"project" | "employee" | "all">("all");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Report details modal state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 30 seconds to get live updates
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

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

      setReports(reportsRes.data);
      setProjects(projectsRes.data);
      setEmployees(employeesRes.data);
    } catch (err: any) {
      console.error("❌ Error fetching data:", err);
      console.error("❌ Error response:", err.response);
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleTimePeriodChange = (
    event: React.MouseEvent<HTMLElement>,
    newPeriod: "day" | "week" | "month" | null
  ) => {
    if (newPeriod !== null) {
      setTimePeriod(newPeriod);
    }
  };

  const handleViewCategoryChange = (
    event: React.MouseEvent<HTMLElement>,
    newCategory: "project" | "employee" | "all" | null
  ) => {
    if (newCategory !== null) {
      setViewCategory(newCategory);
    }
  };

  const handleOpenReportDetails = (report: Report) => {
    console.log("🔍 Selected report before:", selectedReport);
    alert(`Clicked on report: ${report.title || "Untitled Report"}`);
    setSelectedReport(report);
    setReportDialogOpen(true);
    console.log("🔍 Modal should be open now");
  };

  const handleCloseReportDetails = () => {
    setSelectedReport(null);
    setReportDialogOpen(false);
  };

  // Helper function to get date range based on time period
  const getDateRange = (period: "day" | "week" | "month") => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case "day":
        return {
          start: startOfDay,
          end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case "week":
        const startOfWeek = new Date(startOfDay);
        const dayOfWeek = startOfWeek.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startOfWeek.setDate(startOfWeek.getDate() + mondayOffset);
        return {
          start: startOfWeek,
          end: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
        };
      case "month":
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        return {
          start: startOfMonth,
          end: endOfMonth
        };
      default:
        return { start: null, end: null };
    }
  };

  // Filter reports based on search, view category, and time period
  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.employee?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.project?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by time period
    const dateRange = getDateRange(timePeriod);
    const reportDate = new Date(report.date);
    const matchesTimePeriod = !dateRange.start || !dateRange.end || 
      (reportDate >= dateRange.start && reportDate <= dateRange.end);

    // Filter by view category
    let matchesViewCategory = true;
    if (viewCategory === "project") {
      matchesViewCategory = !!report.project;
    } else if (viewCategory === "employee") {
      matchesViewCategory = !!report.employee;
    }
    
    return matchesSearch && matchesTimePeriod && matchesViewCategory;
  });

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
    <PageContainer title="Reports" description="View and manage reports">
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                Reports
              </Typography>
              <Typography variant="body1" color="text.secondary">
                View and analyze employee reports
                {filteredReports.length !== reports.length && (
                  <Chip 
                    label={`${filteredReports.length} of ${reports.length} reports`} 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 2 }} 
                  />
                )}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchData}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Filters and Search */}
          <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
            <TextField
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
              }}
              sx={{ minWidth: 250 }}
            />
            
            <ToggleButtonGroup
              value={timePeriod}
              exclusive
              onChange={handleTimePeriodChange}
              aria-label="time period"
              size="small"
            >
              <ToggleButton value="day" aria-label="day">
                Today
              </ToggleButton>
              <ToggleButton value="week" aria-label="week">
                This Week
              </ToggleButton>
              <ToggleButton value="month" aria-label="month">
                This Month
              </ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup
              value={viewCategory}
              exclusive
              onChange={handleViewCategoryChange}
              aria-label="view category"
              size="small"
            >
              <ToggleButton value="all" aria-label="all">
                All Reports
              </ToggleButton>
              <ToggleButton value="project" aria-label="project">
                By Project
              </ToggleButton>
              <ToggleButton value="employee" aria-label="employee">
                By Employee
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Statistics Cards */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Card sx={{ minWidth: 150 }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Assessment color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography color="textSecondary" variant="body2">
                        Total Reports
                      </Typography>
                      <Typography variant="h6">{filteredReports.length}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              
              <Card sx={{ minWidth: 150 }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Assessment color="secondary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography color="textSecondary" variant="body2">
                        Total Hours
                      </Typography>
                      <Typography variant="h6">
                        {filteredReports.reduce((sum, report) => sum + report.hoursWorked, 0)}h
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ minWidth: 150 }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Person color="success" sx={{ mr: 1 }} />
                    <Box>
                      <Typography color="textSecondary" variant="body2">
                        Active Employees
                      </Typography>
                      <Typography variant="h6">
                        {new Set(filteredReports.map(r => r.employee?._id).filter(Boolean)).size}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ minWidth: 150 }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Assessment color="warning" sx={{ mr: 1 }} />
                    <Box>
                      <Typography color="textSecondary" variant="body2">
                        Active Projects
                      </Typography>
                      <Typography variant="h6">
                        {new Set(filteredReports.map(r => r.project?._id).filter(Boolean)).size}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>

        {/* Reports Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "grey.50" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Project</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Details</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Hours</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          {searchQuery ? "No reports found matching your search" : "No reports available"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((report) => (
                      <TableRow key={report._id} hover>
                        <TableCell>
                          {new Date(report.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Person sx={{ fontSize: 16, color: "text.secondary" }} />
                            {report.employee?.username || "Unknown"}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {report.project ? (
                            <Chip
                              label={report.project.name}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ) : (
                            <Typography color="text.secondary" variant="body2">
                              No Project
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {report.title || "Untitled Report"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 300 }}>
                            {report.details || "No details provided"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {report.hoursWorked}h
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => handleOpenReportDetails(report)}
                            sx={{ textTransform: "none" }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Report Details Dialog */}
        <Dialog
          open={reportDialogOpen}
          onClose={handleCloseReportDetails}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Report Details
          </DialogTitle>
          <DialogContent>
            {selectedReport && (
              <Box sx={{ pt: 1 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    {selectedReport.title || "Untitled Report"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(selectedReport.date).toLocaleDateString()}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                    Employee
                  </Typography>
                  <Typography variant="body2">
                    {selectedReport.employee?.username || "Unknown"}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                    Project
                  </Typography>
                  <Typography variant="body2">
                    {selectedReport.project?.name || "No project assigned"}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                    Hours Worked
                  </Typography>
                  <Typography variant="body2">
                    {selectedReport.hoursWorked} hours
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                    Details
                  </Typography>
                  <Typography variant="body2">
                    {selectedReport.details || "No details provided"}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReportDetails}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default ReportsOnly;
