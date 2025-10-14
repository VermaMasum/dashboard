"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Fab,
  Snackbar,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  PlayArrow,
  Pause,
  Settings,
  CalendarToday,
  ArrowBack,
  ArrowForward,
  Refresh,
  ExpandMore,
  ExpandLess,
  Visibility,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/utils/axios";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const COLORS = ["#2196f3", "#e91e63", "#4caf50", "#ff9800", "#9c27b0"];

interface TimeEntry {
  _id: string;
  project: {
    _id: string;
    name: string;
    status?: "not started" | "in progress" | "completed";
    description?: string;
  };
  employee: {
    _id: string;
    username: string;
  };
  category: string;
  description: string;
  duration: number; // in minutes
  date: string;
  startTime?: string;
  endTime?: string;
  isRunning?: boolean;
  status?: "not started" | "in progress" | "completed"; // Task status
  // Additional properties for project summary functionality
  isProjectSummary?: boolean;
  entries?: TimeEntry[];
}

interface Project {
  _id: string;
  name: string;
  description: string;
  status: "not started" | "in progress" | "completed";
}

const EmployeeTimeTracker = () => {
  const { user, loading: authLoading } = useAuth();

  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dialog states
  const [addEntryDialog, setAddEntryDialog] = useState(false);
  const [editEntryDialog, setEditEntryDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  // Form states
  const [selectedProject, setSelectedProject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<
    "not started" | "in progress" | "completed"
  >("not started");

  // Filter states
  const [filterProject, setFilterProject] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");

  // Expand/collapse states
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(
    new Set()
  );

  // Day details dialog state
  const [dayDetailsDialog, setDayDetailsDialog] = useState(false);
  const [selectedDayForDetails, setSelectedDayForDetails] =
    useState<Date | null>(null);

  // Daily summary dialog state
  const [dailySummaryOpen, setDailySummaryOpen] = useState(false);
  const [selectedDayForSummary, setSelectedDayForSummary] =
    useState<Date | null>(null);
  const [selectedDayEntries, setSelectedDayEntries] = useState<TimeEntry[]>([]);

  // Date picker dialog state
  const [datePickerDialogOpen, setDatePickerDialogOpen] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedViewModeForCalendar, setSelectedViewModeForCalendar] =
    useState<"day" | "week" | "month">("month");

  const getDateRange = (date: Date, mode: string) => {
    const targetDate = new Date(date);

    switch (mode) {
      case "day":
        return {
          startDate: new Date(targetDate),
          endDate: new Date(targetDate),
        };

      case "week":
        const weekStart = new Date(targetDate);
        const dayOfWeek = targetDate.getDay();
        weekStart.setDate(targetDate.getDate() - dayOfWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        return {
          startDate: weekStart,
          endDate: weekEnd,
        };

      case "month":
        const monthStart = new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          1
        );
        const monthEnd = new Date(
          targetDate.getFullYear(),
          targetDate.getMonth() + 1,
          0
        );

        return {
          startDate: monthStart,
          endDate: monthEnd,
        };

      default:
        return {
          startDate: new Date(targetDate),
          endDate: new Date(targetDate),
        };
    }
  };

  const fetchData = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Fetch projects (only once, not dependent on date)
      if (projects.length === 0) {
        const projectsRes = await axios.get(`/projects/${user.id}/assign`);
        const allProjects = projectsRes.data;
        setProjects(allProjects);
        // Filter out projects with "not started" status for time entry
        const activeProjects = allProjects.filter(
          (project: Project) => project.status !== "not started"
        );
        setFilteredProjects(activeProjects);
      }

      // Calculate date range based on current view mode
      const { startDate, endDate } = getDateRange(currentDate, viewMode);

      // Fetch reports with date range parameters
      const reportsRes = await axios.get("/reports", {
        params: {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          employee: user.id,
        },
      });

      let allReports = reportsRes.data;

      // Debug: Log the raw data
      console.log("Employee - Raw reports data:", allReports);

      // Ensure duration and description are properly set for each report
      allReports = allReports.map((report: any) => {
        // Debug: Log each report
        console.log("Employee - Processing report:", report);

        return {
          ...report,
          duration:
            report.duration ||
            (report.hoursWorked ? report.hoursWorked * 60 : 0) ||
            0,
          // Fix: Only use fallback if description is null/undefined, not if it's an empty string
          // Handle both 'description' and 'details' fields from backend
          description:
            report.description !== null && report.description !== undefined
              ? report.description
              : report.details !== null && report.details !== undefined
              ? report.details
              : report.title || "No description provided",
          category: report.category || "General",
          // Ensure project object is properly set
          project: report.project || { _id: "unknown", name: "General Work" },
        };
      });

      console.log("Employee - Processed reports:", allReports);

      // Apply project filter if selected
      if (filterProject) {
        allReports = allReports.filter(
          (report: any) => report.project._id === filterProject
        );
      }

      console.log("Employee - Final time entries set:", allReports);
      setTimeEntries(allReports);
    } catch (err: any) {
      console.error("Error fetching time tracker data:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch data"
      );
    } finally {
      setLoading(false);
    }
  }, [currentDate, viewMode, filterProject, user, projects.length]);

  useEffect(() => {
    if (user) {
      setFilterEmployee(user.id);
    }
  }, [user]);

  useEffect(() => {
    console.log("Employee - useEffect triggered:", {
      currentDate,
      viewMode,
      filterProject,
    });
    fetchData();
  }, [fetchData]);

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Access control
  if (!user || user.role !== "employee") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Typography variant="h4" color="error">
          Access Denied
        </Typography>
      </Box>
    );
  }

  const formatDuration = (minutes: number) => {
    if (!minutes || isNaN(minutes) || minutes < 0) {
      return "0:00";
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${String(mins).padStart(2, "0")}`;
  };

  // Format duration as hours (decimal)
  const formatDurationAsHours = (minutes: number) => {
    if (!minutes || isNaN(minutes) || minutes < 0) {
      return "0.0";
    }
    const hours = minutes / 60;
    return hours.toFixed(1);
  };

  // Calculate total hours for current view
  const calculateTotalHours = () => {
    if (viewMode === "day") {
      // Filter entries for the exact currentDate only
      const filteredEntries = timeEntries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate.toDateString() === currentDate.toDateString();
      });
      const totalMinutes = filteredEntries.reduce((sum, entry) => {
        return sum + (entry.duration || 0);
      }, 0);
      return formatDurationAsHours(totalMinutes) + "h";
    } else {
      const { startDate, endDate } = getDateRange(currentDate, viewMode);
      const filteredEntries = timeEntries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });
      const totalMinutes = filteredEntries.reduce((sum, entry) => {
        return sum + (entry.duration || 0);
      }, 0);
      return formatDurationAsHours(totalMinutes) + "h";
    }
  };

  const getWeekDays = () => {
    const weekStart = new Date(currentDate);
    const dayOfWeek = currentDate.getDay();
    weekStart.setDate(currentDate.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const handleDateChange = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);

    switch (viewMode) {
      case "day":
        newDate.setDate(
          currentDate.getDate() + (direction === "next" ? 1 : -1)
        );
        break;
      case "week":
        newDate.setDate(
          currentDate.getDate() + (direction === "next" ? 7 : -7)
        );
        break;
      case "month":
        newDate.setMonth(
          currentDate.getMonth() + (direction === "next" ? 1 : -1)
        );
        break;
    }

    setCurrentDate(newDate);
  };

  const handleCalendarClick = (mode: "day" | "week" | "month") => {
    setSelectedViewModeForCalendar(mode);
    setTempSelectedDate(currentDate.toISOString().split("T")[0]);
    setDatePickerDialogOpen(true);
  };

  const handleDateSelect = () => {
    const selectedDate = new Date(tempSelectedDate);
    setCurrentDate(selectedDate);
    setViewMode(selectedViewModeForCalendar);
    setDatePickerDialogOpen(false);
  };

  const handleReturnToToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEntry = () => {
    setSelectedEntry(null);
    setSelectedProject("");
    setCategory("");
    setDescription("");
    setDuration("");
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setStatus("not started");
    setAddEntryDialog(true);
  };

  const getSelectedProjectStatus = () => {
    const project = projects.find((p) => p._id === selectedProject);
    return project?.status || "Not Set";
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setSelectedProject(entry.project._id);
    setCategory(entry.category || "");
    setDescription(entry.description);
    // Ensure duration is a valid number before formatting
    const validDuration =
      entry.duration && !isNaN(entry.duration) ? entry.duration : 0;
    setDuration(formatDuration(validDuration));
    setSelectedDate(entry.date);
    setStatus(entry.status || "not started");
    setEditEntryDialog(true);
  };

  const handleViewDetails = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setDetailsDialog(true);
  };

  const handleSaveEntry = async () => {
    try {
      setError(""); // Clear any previous errors
      // Parse duration properly
      let durationInMinutes = 0;
      if (duration && duration.includes(":")) {
        const [hours, minutes] = duration.split(":").map(Number);
        durationInMinutes = (hours || 0) * 60 + (minutes || 0);
      } else if (duration) {
        // Handle case where duration is just a number (hours)
        durationInMinutes = parseFloat(duration) * 60;
      }

      const entryData = {
        project: selectedProject,
        category: category,
        details: description, // Backend expects 'details' field, not 'description'
        description: description, // Keep description for frontend compatibility
        duration: durationInMinutes,
        hoursWorked: durationInMinutes / 60, // Also set hoursWorked for compatibility
        date: selectedDate,
        employee: user?.id,
        status: status, // Add status field
      };

      if (selectedEntry) {
        // Check if this is a project summary entry (not a real database entry)
        if (
          selectedEntry.isProjectSummary ||
          selectedEntry._id.startsWith("project-summary-")
        ) {
          console.log(
            "Employee - Cannot update project summary entry, this is a read-only view"
          );
          setError(
            "Cannot update project summary. Please edit individual entries instead."
          );
          return;
        }

        // Update existing entry
        console.log(
          "Employee - Updating entry:",
          selectedEntry._id,
          "with data:",
          entryData
        );
        const response = await axios.put(
          `/reports/${selectedEntry._id}`,
          entryData
        );
        console.log("Employee - Update response:", response.data);
        setSuccess("Time entry updated successfully!");
      } else {
        // Create new entry
        console.log("Employee - Creating new entry with data:", entryData);
        const response = await axios.post("/reports", entryData);
        console.log("Employee - Create response:", response.data);
        setSuccess("Time entry added successfully!");
      }

      setAddEntryDialog(false);
      setEditEntryDialog(false);

      // Clear form state
      setSelectedEntry(null);
      setSelectedProject("");
      setCategory("");
      setDescription("");
      setDuration("");
      setSelectedDate(new Date().toISOString().split("T")[0]);
      setStatus("not started");

      // Force refresh data after update
      console.log("Employee - Refreshing data after save...");
      await fetchData();
    } catch (err: any) {
      console.error("Error saving time entry:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to save entry"
      );
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      setError(""); // Clear any previous errors
      console.log("Employee - Deleting entry:", entryId);
      const response = await axios.delete(`/reports/${entryId}`);
      console.log("Employee - Delete response:", response.data);
      setSuccess("Time entry deleted successfully!");

      // Force refresh data after delete
      console.log("Employee - Refreshing data after delete...");
      await fetchData();
    } catch (err: any) {
      console.error("Error deleting time entry:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to delete entry"
      );
    }
  };

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode("day");
  };

  const handleDaySummaryClick = (date: Date) => {
    const dayEntries = timeEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === date.toDateString();
    });

    setSelectedDayForSummary(date);
    setSelectedDayEntries(dayEntries);
    setDailySummaryOpen(true);
  };

  const toggleExpanded = (entryId: string) => {
    setExpandedEntries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const handleDayDetailsClick = (date: Date) => {
    setSelectedDayForDetails(date);
    setDayDetailsDialog(true);
  };

  const handleRefreshData = async () => {
    console.log("Employee - Manual refresh triggered");
    // Clear projects cache to force refetch
    setProjects([]);
    setFilteredProjects([]);
    await fetchData();
  };

  // Note: Project status updates are handled by admin only
  // Employees can only view project status, not change it

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not started":
        return "#f44336"; // Red
      case "in progress":
        return "#ff9800"; // Orange
      case "completed":
        return "#4caf50"; // Green
      default:
        return "#9e9e9e"; // Gray
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "not started":
        return "⏸️";
      case "in progress":
        return "▶️";
      case "completed":
        return "✅";
      default:
        return "❓";
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageContainer
      title="Time Tracker"
      description="Track and manage your time entries"
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Box sx={{ p: 3, width: "100%", maxWidth: "1200px" }}>
          {/* Breadcrumbs */}
          {/* <Breadcrumbs sx={{ mb: 3 }}>
            <Link
              href="/employee/overview"
              color="inherit"
              sx={{ textDecoration: "none" }}
            >
              Employee
            </Link>
            <Typography color="text.primary">Time Tracker</Typography>
          </Breadcrumbs> */}

          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ mb: 2 }}
              color="#1976D2"
            >
              Time Tracker
            </Typography>

            {/* Combined Header with Navigation, Date, View Toggle and Controls */}
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ py: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  {/* Left Corner - View Toggle (Month/Week/Day) */}
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(event, newViewMode) => {
                      if (newViewMode !== null) {
                        setViewMode(newViewMode);
                      }
                    }}
                    size="small"
                    sx={{
                      "& .MuiToggleButton-root": {
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        px: 2,
                        py: 0.5,
                        minWidth: "80px",
                        textTransform: "none",
                        fontWeight: "bold",
                        fontSize: "0.8rem",
                        "&.Mui-selected": {
                          backgroundColor: "#1976D2",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "#1565C0",
                          },
                        },
                        "&:not(.Mui-selected)": {
                          backgroundColor: "#f5f5f5",
                          color: "#666",
                          "&:hover": {
                            backgroundColor: "#e0e0e0",
                          },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="month">Month</ToggleButton>
                    <ToggleButton value="week">Week</ToggleButton>
                    <ToggleButton value="day">Day</ToggleButton>
                  </ToggleButtonGroup>

                  {/* Center - Date Display, Total Hours, and Project Filter */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Date Picker with Calendar Icon */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarToday
                        sx={{ color: "#1976D2", fontSize: "1.2rem" }}
                      />
                      <TextField
                        type="date"
                        value={currentDate.toISOString().split("T")[0]}
                        onChange={(e) =>
                          setCurrentDate(new Date(e.target.value))
                        }
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "32px",
                            fontSize: "0.85rem",
                            "& fieldset": {
                              borderColor: "#e0e0e0",
                            },
                            "&:hover fieldset": {
                              borderColor: "#1976D2",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1976D2",
                            },
                          },
                          "& .MuiInputBase-input": {
                            padding: "6px 8px",
                            fontSize: "0.85rem",
                          },
                        }}
                      />
                    </Box>

                    {/* Total Hours Display */}
                    <Box
                      sx={{
                        backgroundColor: "#e3f2fd",
                        px: 1.2,
                        py: 0.4,
                        borderRadius: 1,
                        border: "1px solid #2196f3",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.7rem" }}
                      >
                        Total{" "}
                        {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}{" "}
                        Hours:
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="primary"
                        sx={{ fontSize: "0.9rem" }}
                      >
                        {calculateTotalHours()}
                      </Typography>
                    </Box>

                    {/* Project Filter */}
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel>Filter by Project</InputLabel>
                      <Select
                        value={filterProject}
                        onChange={(e) => setFilterProject(e.target.value)}
                        label="Filter by Project"
                      >
                        <MenuItem value="">All Projects</MenuItem>
                        {filteredProjects.map((project) => (
                          <MenuItem key={project._id} value={project._id}>
                            {project.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Right Corner - Action Buttons */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* <IconButton
                      onClick={handleRefreshData}
                      size="small"
                      sx={{
                        backgroundColor: "#f5f5f5",
                        "&:hover": { backgroundColor: "#e0e0e0" },
                      }}
                      title="Refresh Data"
                    >
                      <Refresh />
                    </IconButton> */}

                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={handleAddEntry}
                      sx={{
                        background:
                          "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                        color: "white",
                        borderRadius: 2,
                        px: 2,
                        py: 0.8,
                        fontSize: "0.85rem",
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)",
                        },
                      }}
                    >
                      Add Entry
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
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

          {/* Month View */}
          {viewMode === "month" && (
            <Box>
              {/* Month Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                  gap: 2,
                }}
              >
                <IconButton
                  onClick={() => handleDateChange("prev")}
                  size="large"
                >
                  <ArrowBack />
                </IconButton>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </Typography>
                <IconButton
                  onClick={() => handleDateChange("next")}
                  size="large"
                >
                  <ArrowForward />
                </IconButton>
              </Box>

              {/* Day headers */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  backgroundColor: "#f5f5f5",
                  borderRadius: 1,
                  mb: 1,
                  py: 1,
                }}
              >
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <Typography
                      key={day}
                      align="center"
                      fontWeight="bold"
                      sx={{ color: "#666" }}
                    >
                      {day}
                    </Typography>
                  )
                )}
              </Box>

              {/* Clean Calendar Grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                {(() => {
                  const year = currentDate.getFullYear();
                  const month = currentDate.getMonth();
                  const firstDay = new Date(year, month, 1);
                  const startDate = new Date(firstDay);
                  startDate.setDate(startDate.getDate() - firstDay.getDay());

                  const days = [];
                  for (let i = 0; i < 42; i++) {
                    const dayDate = new Date(startDate);
                    dayDate.setDate(startDate.getDate() + i);
                    const isCurrentMonth = dayDate.getMonth() === month;
                    const isToday =
                      dayDate.toDateString() === new Date().toDateString();

                    // Get entries for this day
                    const dayEntries = timeEntries.filter((entry) => {
                      const entryDate = new Date(entry.date);
                      return (
                        entryDate.toDateString() === dayDate.toDateString()
                      );
                    });

                    // Debug: Log entries for days that have data
                    if (dayEntries.length > 0) {
                      console.log(
                        "Employee - Month day entries for",
                        dayDate.toDateString(),
                        ":",
                        dayEntries
                      );
                    }

                    days.push(
                      <Box
                        key={i}
                        sx={{
                          minHeight: 120,
                          border: "1px solid #e0e0e0",
                          backgroundColor: "#fff",
                          p: 1,
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "#f8f9fa",
                          },
                        }}
                        onClick={() =>
                          dayEntries.length > 0
                            ? handleDaySummaryClick(dayDate)
                            : handleDayClick(dayDate)
                        }
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "bold",
                            color: isCurrentMonth
                              ? isToday
                                ? "primary.main"
                                : "text.primary"
                              : "text.disabled",
                            mb: 1,
                          }}
                        >
                          {dayDate.getDate()}
                        </Typography>

                        {/* Show total hours and projects for the day */}
                        {dayEntries.length > 0 && (
                          <Box
                            sx={{
                              backgroundColor: "#2196f3",
                              color: "white",
                              borderRadius: 1,
                              p: 0.5,
                              mb: 0.5,
                              cursor: "pointer",
                              fontSize: 10,
                              fontWeight: "bold",
                              textAlign: "center",
                              "&:hover": {
                                opacity: 0.8,
                              },
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: "bold" }}
                            >
                              Total:{" "}
                              {formatDurationAsHours(
                                dayEntries.reduce(
                                  (sum, entry) => sum + (entry.duration || 0),
                                  0
                                )
                              )}
                              h
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                opacity: 0.9,
                                fontSize: "9px",
                                mt: 0.5,
                              }}
                            >
                              {
                                new Set(
                                  dayEntries.map(
                                    (entry) => entry.project?._id || "general"
                                  )
                                ).size
                              }{" "}
                              project
                              {new Set(
                                dayEntries.map(
                                  (entry) => entry.project?._id || "general"
                                )
                              ).size !== 1
                                ? "s"
                                : ""}{" "}
                              • {dayEntries.length} task
                              {dayEntries.length !== 1 ? "s" : ""}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  }
                  return days;
                })()}
              </Box>
            </Box>
          )}

          {/* Day View */}
          {viewMode === "day" && (
            <Box>
              {/* Day View Header */}
              <Box
                sx={{
                  backgroundColor: "#f5f5f5",
                  p: 2,
                  borderRadius: 1,
                  mb: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {currentDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Typography>
                {/* Total Hours for Day */}
                {/* Removed duplicate Total Day Hours box to avoid duplication */}
              </Box>

              {/* Day Summary Block */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {(() => {
                  const dayEntries = timeEntries.filter(
                    (entry) =>
                      new Date(entry.date).toDateString() ===
                      currentDate.toDateString()
                  );

                  console.log(
                    "Employee - Day entries for",
                    currentDate.toDateString(),
                    ":",
                    dayEntries
                  );

                  if (dayEntries.length === 0) {
                    return (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No work entries found for this day.
                        </Typography>
                      </Box>
                    );
                  }

                  return (
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #2196f3 0%, #21CBF3 100%)",
                        color: "white",
                        borderRadius: 2,
                        p: 3,
                        cursor: "pointer",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 4,
                          opacity: 0.9,
                        },
                        transition: "all 0.3s ease",
                      }}
                      onClick={() => handleDayDetailsClick(currentDate)}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          sx={{ mb: 1 }}
                        >
                          Daily Summary
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                          {currentDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 4,
                            mt: 2,
                          }}
                        >
                          <Box sx={{ textAlign: "center" }}>
                            <Typography variant="h3" fontWeight="bold">
                              {formatDurationAsHours(
                                dayEntries.reduce(
                                  (sum, entry) => sum + (entry.duration || 0),
                                  0
                                )
                              )}
                              h
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Total Hours
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: "center" }}>
                            <Typography variant="h3" fontWeight="bold">
                              {
                                new Set(
                                  dayEntries.map(
                                    (entry) => entry.project?._id || "general"
                                  )
                                ).size
                              }
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Project
                              {new Set(
                                dayEntries.map(
                                  (entry) => entry.project?._id || "general"
                                )
                              ).size !== 1
                                ? "s"
                                : ""}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: "center" }}>
                            <Typography variant="h3" fontWeight="bold">
                              {dayEntries.length}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Task{dayEntries.length !== 1 ? "s" : ""}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{ mt: 2, opacity: 0.8 }}
                        >
                          Click to view detailed breakdown
                        </Typography>
                      </Box>
                    </Card>
                  );
                })()}
              </Box>
            </Box>
          )}

          {/* Week View */}
          {viewMode === "week" && (
            <Box>
              {/* Week View Header */}
              <Box
                sx={{
                  backgroundColor: "#f5f5f5",
                  p: 2,
                  borderRadius: 1,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <IconButton
                  onClick={() => handleDateChange("prev")}
                  size="large"
                >
                  <ArrowBack />
                </IconButton>
                <Typography variant="h6" fontWeight="bold">
                  Week of{" "}
                  {getWeekDays()[0].toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  -{" "}
                  {getWeekDays()[6].toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Typography>
                <IconButton
                  onClick={() => handleDateChange("next")}
                  size="large"
                >
                  <ArrowForward />
                </IconButton>
              </Box>

              {/* Week View - Compact Calendar Grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 1,
                  minHeight: "400px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: 1,
                  p: 1,
                }}
              >
                {/* Day Headers */}
                {getWeekDays().map((day, index) => (
                  <Box
                    key={index}
                    sx={{
                      textAlign: "center",
                      p: 1,
                      backgroundColor:
                        day.toDateString() === currentDate.toDateString()
                          ? "#f0f8ff"
                          : "white",
                      borderRadius: 1,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="text.secondary"
                    >
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {day.getDate()}
                    </Typography>
                  </Box>
                ))}

                {/* Task Blocks for each day */}
                {getWeekDays().map((day, dayIndex) => {
                  const dayEntries = timeEntries.filter((entry) => {
                    const entryDate = new Date(entry.date);
                    return entryDate.toDateString() === day.toDateString();
                  });

                  console.log(
                    "Employee - Week day entries for",
                    day.toDateString(),
                    ":",
                    dayEntries
                  );

                  return (
                    <Box
                      key={dayIndex}
                      sx={{
                        minHeight: "300px",
                        backgroundColor: "white",
                        borderRadius: 1,
                        border: "1px solid #e0e0e0",
                        p: 1,
                        position: "relative",
                      }}
                    >
                      {dayEntries.length > 0 && (
                        <Box
                          sx={{
                            backgroundColor: "#2196f3",
                            color: "white",
                            borderRadius: 1,
                            p: 0.5,
                            mb: 0.5,
                            cursor: "pointer",
                            fontSize: 10,
                            fontWeight: "bold",
                            textAlign: "center",
                            "&:hover": {
                              opacity: 0.8,
                            },
                          }}
                          onClick={() => handleDaySummaryClick(day)}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: "bold" }}
                          >
                            Total:{" "}
                            {formatDurationAsHours(
                              dayEntries.reduce(
                                (sum, entry) => sum + (entry.duration || 0),
                                0
                              )
                            )}
                            h
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              opacity: 0.9,
                              fontSize: "9px",
                              mt: 0.5,
                            }}
                          >
                            {
                              new Set(
                                dayEntries.map(
                                  (entry) => entry.project?._id || "general"
                                )
                              ).size
                            }{" "}
                            project
                            {new Set(
                              dayEntries.map(
                                (entry) => entry.project?._id || "general"
                              )
                            ).size !== 1
                              ? "s"
                              : ""}{" "}
                            • {dayEntries.length} task
                            {dayEntries.length !== 1 ? "s" : ""}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Add/Edit Entry Dialog */}
          <Dialog
            open={addEntryDialog || editEntryDialog}
            onClose={() => {
              setAddEntryDialog(false);
              setEditEntryDialog(false);
            }}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {selectedEntry ? "Edit Time Entry" : "Add Time Entry"}
            </DialogTitle>
            <DialogContent>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
              >
                <FormControl fullWidth>
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    label="Project"
                  >
                    {filteredProjects.map((project) => (
                      <MenuItem key={project._id} value={project._id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Development, Testing, Meeting"
                />

                <TextField
                  fullWidth
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Describe what you worked on..."
                />

                <TextField
                  fullWidth
                  label="Hours Worked"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 8:00"
                />

                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />

                <Typography variant="body2" color="text.secondary">
                  Project Status: {getSelectedProjectStatus()}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setAddEntryDialog(false);
                  setEditEntryDialog(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEntry} variant="contained">
                {selectedEntry ? "Update" : "Add"} Entry
              </Button>
            </DialogActions>
          </Dialog>

          {/* Details Dialog */}
          <Dialog
            open={detailsDialog}
            onClose={() => setDetailsDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Time Entry Details</DialogTitle>
            <DialogContent>
              {selectedEntry && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mt: 1,
                  }}
                >
                  {selectedEntry.isProjectSummary ? (
                    // Show project summary with individual entries
                    <>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {selectedEntry.project?.name || "Project Summary"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total:{" "}
                          {formatDurationAsHours(selectedEntry.duration || 0)}h
                          • {selectedEntry.entries?.length || 0} entries
                        </Typography>
                      </Box>

                      {selectedEntry.entries &&
                        selectedEntry.entries.length > 0 && (
                          <Box>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              sx={{ mb: 2 }}
                            >
                              Individual Entries:
                            </Typography>
                            {selectedEntry.entries.map(
                              (entry: any, index: number) => (
                                <Box
                                  key={entry._id || index}
                                  sx={{
                                    border: "1px solid #e0e0e0",
                                    borderRadius: 1,
                                    p: 2,
                                    mb: 2,
                                    backgroundColor: "#f9f9f9",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <Box sx={{ flex: 1 }}>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        Entry {index + 1}
                                      </Typography>
                                      <Typography
                                        variant="body1"
                                        fontWeight="bold"
                                        sx={{
                                          display: "-webkit-box",
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: "vertical",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }}
                                      >
                                        {entry.description || "No description"}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        Category: {entry.category || "General"}{" "}
                                        • Duration:{" "}
                                        {formatDurationAsHours(
                                          entry.duration || 0
                                        )}
                                        h
                                      </Typography>
                                      {entry.status && (
                                        <Chip
                                          label={entry.status.toUpperCase()}
                                          size="small"
                                          sx={{
                                            backgroundColor: getStatusColor(
                                              entry.status
                                            ),
                                            color: "white",
                                            fontWeight: "bold",
                                            mt: 1,
                                          }}
                                        />
                                      )}
                                    </Box>
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => {
                                          setDetailsDialog(false);
                                          handleEditEntry(entry);
                                        }}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        onClick={() => {
                                          if (
                                            window.confirm(
                                              "Are you sure you want to delete this entry?"
                                            )
                                          ) {
                                            handleDeleteEntry(entry._id);
                                            setDetailsDialog(false);
                                          }
                                        }}
                                      >
                                        Delete
                                      </Button>
                                    </Box>
                                  </Box>
                                </Box>
                              )
                            )}
                          </Box>
                        )}
                    </>
                  ) : (
                    // Show individual entry details
                    <>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Project
                        </Typography>
                        <Typography variant="body1">
                          {selectedEntry.project?.name || "General Work"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Category
                        </Typography>
                        <Typography variant="body1">
                          {selectedEntry.category || "General"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Description
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {selectedEntry.description ||
                            "No description provided."}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body1">
                          {formatDurationAsHours(selectedEntry.duration || 0)}h
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Date
                        </Typography>
                        <Typography variant="body1">
                          {new Date(selectedEntry.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Status
                        </Typography>
                        <Chip
                          label={
                            selectedEntry.status?.toUpperCase() || "NOT STARTED"
                          }
                          sx={{
                            backgroundColor: getStatusColor(
                              selectedEntry.status || "not started"
                            ),
                            color: "white",
                            fontWeight: "bold",
                          }}
                        />
                      </Box>
                    </>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialog(false)}>Close</Button>
              {selectedEntry && !selectedEntry.isProjectSummary && (
                <Button
                  onClick={() => {
                    setDetailsDialog(false);
                    handleEditEntry(selectedEntry!);
                  }}
                  variant="contained"
                >
                  Edit
                </Button>
              )}
            </DialogActions>
          </Dialog>

          {/* Floating Action Button */}
          {/* Day Details Dialog */}
          <Dialog
            open={dayDetailsDialog}
            onClose={() => setDayDetailsDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Work Details for{" "}
              {selectedDayForDetails?.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </DialogTitle>
            <DialogContent>
              {selectedDayForDetails && (
                <Box sx={{ mt: 1 }}>
                  {(() => {
                    const dayEntries = timeEntries.filter((entry) => {
                      const entryDate = new Date(entry.date);
                      return (
                        entryDate.toDateString() ===
                        selectedDayForDetails.toDateString()
                      );
                    });

                    const totalHours = dayEntries.reduce(
                      (sum, entry) => sum + (entry.duration || 0),
                      0
                    );
                    const uniqueProjects = new Set(
                      dayEntries.map((entry) => entry.project?._id || "general")
                    ).size;

                    return (
                      <>
                        {/* Summary */}
                        <Box
                          sx={{
                            mb: 3,
                            p: 2,
                            backgroundColor: "#f5f5f5",
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{ mb: 1 }}
                          >
                            Daily Summary
                          </Typography>
                          <Box sx={{ display: "flex", gap: 3 }}>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Total Hours
                              </Typography>
                              <Typography
                                variant="h5"
                                fontWeight="bold"
                                color="primary"
                              >
                                {formatDurationAsHours(totalHours)}h
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Projects Worked
                              </Typography>
                              <Typography variant="h5" fontWeight="bold">
                                {uniqueProjects}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Total Tasks
                              </Typography>
                              <Typography variant="h5" fontWeight="bold">
                                {dayEntries.length}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Task Details */}
                        {dayEntries.length === 0 ? (
                          <Box sx={{ textAlign: "center", py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                              No work entries found for this day.
                            </Typography>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            {dayEntries.map((entry, index) => {
                              const colors = [
                                "#2196f3",
                                "#e91e63",
                                "#4caf50",
                                "#ff9800",
                                "#9c27b0",
                              ];
                              const color = colors[index % colors.length];

                              return (
                                <Card
                                  key={entry._id}
                                  sx={{
                                    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                                    color: "white",
                                    borderRadius: 2,
                                    p: 2,
                                    "&:hover": {
                                      transform: "translateY(-2px)",
                                      boxShadow: 4,
                                      opacity: 0.9,
                                    },
                                    transition: "all 0.3s ease",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Box sx={{ flex: 1 }}>
                                      <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        sx={{ mb: 1 }}
                                      >
                                        {entry.project?.name || "General Work"}
                                      </Typography>
                                      <Box
                                        sx={{ display: "flex", gap: 1, mb: 1 }}
                                      >
                                        <Chip
                                          label={entry.category || "General"}
                                          size="small"
                                          sx={{
                                            backgroundColor:
                                              "rgba(255,255,255,0.2)",
                                            color: "white",
                                            fontWeight: "bold",
                                          }}
                                        />
                                      </Box>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          mt: 1,
                                          opacity: 0.9,
                                          display: "-webkit-box",
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: "vertical",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }}
                                      >
                                        {entry.description ||
                                          "No work description available."}
                                      </Typography>
                                    </Box>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Typography
                                        variant="h5"
                                        fontWeight="bold"
                                      >
                                        {formatDurationAsHours(
                                          entry.duration || 0
                                        )}
                                        h
                                      </Typography>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                          setDayDetailsDialog(false);
                                          handleEditEntry(entry);
                                        }}
                                        sx={{
                                          color: "white",
                                          borderColor: "white",
                                          "&:hover": {
                                            backgroundColor:
                                              "rgba(255,255,255,0.1)",
                                            borderColor: "white",
                                          },
                                        }}
                                      >
                                        Edit
                                      </Button>
                                    </Box>
                                  </Box>
                                </Card>
                              );
                            })}
                          </Box>
                        )}
                      </>
                    );
                  })()}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDayDetailsDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Daily Summary Dialog */}
          <Dialog
            open={dailySummaryOpen}
            onClose={() => setDailySummaryOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2,
                maxHeight: "80vh",
              },
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5" fontWeight="bold">
                Work Details for{" "}
                {selectedDayForSummary?.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 0, overflow: "hidden" }}>
              <Box sx={{ height: "100%", overflow: "auto", p: 2 }}>
                {selectedDayEntries.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No work entries found for this day.
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {/* Daily Summary */}
                    <Box
                      sx={{
                        backgroundColor: "#f5f5f5",
                        borderRadius: 2,
                        p: 2,
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Daily Summary
                      </Typography>
                      <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Total Hours
                          </Typography>
                          <Typography
                            variant="h5"
                            fontWeight="bold"
                            color="primary"
                          >
                            {(() => {
                              const totalMinutes = selectedDayEntries.reduce(
                                (sum, entry) => sum + (entry.duration || 0),
                                0
                              );
                              const hours = Math.floor(totalMinutes / 60);
                              const minutes = totalMinutes % 60;
                              return `${hours}:${minutes
                                .toString()
                                .padStart(2, "0")}`;
                            })()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Active Projects
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {
                              new Set(
                                selectedDayEntries.map(
                                  (entry) => entry.project?._id
                                )
                              ).size
                            }
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Total Tasks
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {selectedDayEntries.length}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Project-wise Summary */}
                    {(() => {
                      // Group entries by project
                      const projectGroups = selectedDayEntries.reduce(
                        (acc, entry) => {
                          const projId = entry.project?._id || "unknown";
                          if (!acc[projId]) {
                            acc[projId] = {
                              project: entry.project,
                              entries: [],
                              totalMinutes: 0,
                            };
                          }
                          acc[projId].entries.push(entry);
                          acc[projId].totalMinutes += entry.duration || 0;
                          return acc;
                        },
                        {} as any
                      );

                      return (
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{ mb: 2 }}
                          >
                            Project-wise Summary
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            {Object.values(projectGroups).map(
                              (group: any, index) => {
                                const colors = [
                                  "#2196f3",
                                  "#e91e63",
                                  "#4caf50",
                                  "#ff9800",
                                  "#9c27b0",
                                ];
                                const color = colors[index % colors.length];
                                const totalHours = Math.floor(
                                  group.totalMinutes / 60
                                );
                                const totalMins = group.totalMinutes % 60;
                                const formattedTime = `${totalHours}:${totalMins
                                  .toString()
                                  .padStart(2, "0")}`;

                                return (
                                  <Box
                                    key={group.project?._id || "unknown"}
                                    sx={{
                                      backgroundColor: color,
                                      color: "white",
                                      borderRadius: 2,
                                      p: 2,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          borderRadius: 1,
                                          backgroundColor:
                                            "rgba(255,255,255,0.2)",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          color: "white",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {group.project?.name
                                          ?.charAt(0)
                                          ?.toUpperCase() || "P"}
                                      </Box>
                                      <Box>
                                        <Typography
                                          variant="h6"
                                          fontWeight="bold"
                                        >
                                          {group.project?.name ||
                                            "Unknown Project"}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{ opacity: 0.9 }}
                                        >
                                          {group.entries.length} task
                                          {group.entries.length !== 1
                                            ? "s"
                                            : ""}{" "}
                                          • {formattedTime} total
                                        </Typography>
                                        {group.entries.length > 0 && (
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              opacity: 0.8,
                                              fontSize: "0.75rem",
                                            }}
                                          >
                                            Employee:{" "}
                                            {group.entries[0].employee
                                              ?.username || "Unknown"}
                                          </Typography>
                                        )}
                                        {group.project?.description && (
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              opacity: 0.8,
                                              fontSize: "0.75rem",
                                            }}
                                          >
                                            {group.project.description}
                                          </Typography>
                                        )}
                                        {group.project?.status && (
                                          <Chip
                                            label={`${getStatusIcon(
                                              group.project.status
                                            )} ${group.project.status.toUpperCase()}`}
                                            size="small"
                                            sx={{
                                              backgroundColor:
                                                "rgba(255,255,255,0.2)",
                                              color: "white",
                                              fontWeight: "bold",
                                              mt: 0.5,
                                            }}
                                          />
                                        )}
                                      </Box>
                                    </Box>
                                    <Box sx={{ display: "flex", gap: 0.5 }}>
                                      <IconButton
                                        sx={{ color: "white" }}
                                        onClick={() => {
                                          // Show detailed view of all entries for this project
                                          // Create a special entry that shows all entries for this project
                                          const projectSummaryEntry = {
                                            _id: `project-summary-${group.project?._id}`,
                                            project: group.project,
                                            employee:
                                              group.entries[0]?.employee,
                                            category: "Project Summary",
                                            description: `All entries for ${
                                              group.project?.name ||
                                              "this project"
                                            }`,
                                            duration: group.totalMinutes,
                                            date:
                                              selectedDayForSummary
                                                ?.toISOString()
                                                .split("T")[0] || "",
                                            isProjectSummary: true, // Flag to identify this as a project summary
                                            entries: group.entries, // Store all entries for this project
                                          } as any;

                                          setSelectedEntry(projectSummaryEntry);
                                          setDailySummaryOpen(false);
                                          setDetailsDialog(true);
                                        }}
                                        title="View all details for this project"
                                      >
                                        <Visibility />
                                      </IconButton>
                                      <IconButton
                                        sx={{ color: "white" }}
                                        onClick={() => {
                                          // Add new entry for this project
                                          setSelectedProject(
                                            group.project?._id || ""
                                          );
                                          setSelectedDate(
                                            selectedDayForSummary
                                              ?.toISOString()
                                              .split("T")[0] || ""
                                          );
                                          setDailySummaryOpen(false);
                                          setAddEntryDialog(true);
                                        }}
                                        title="Add new entry for this project"
                                      >
                                        <Add />
                                      </IconButton>
                                      {group.entries.length > 0 && (
                                        <>
                                          <IconButton
                                            sx={{ color: "white" }}
                                            onClick={() => {
                                              // Show edit options for existing entries
                                              if (group.entries.length === 1) {
                                                // If only one entry, edit it directly
                                                handleEditEntry(
                                                  group.entries[0]
                                                );
                                                setDailySummaryOpen(false);
                                              } else {
                                                // If multiple entries, show the first one for now
                                                // TODO: Could implement a dropdown to choose which entry to edit
                                                handleEditEntry(
                                                  group.entries[0]
                                                );
                                                setDailySummaryOpen(false);
                                              }
                                            }}
                                            title={`Edit existing entries (${
                                              group.entries.length
                                            } entry${
                                              group.entries.length > 1
                                                ? "s"
                                                : ""
                                            })`}
                                          >
                                            <Edit />
                                          </IconButton>
                                          <IconButton
                                            sx={{ color: "white" }}
                                            onClick={() => {
                                              // Delete the first entry (or could implement selection)
                                              if (
                                                window.confirm(
                                                  `Are you sure you want to delete this time entry?`
                                                )
                                              ) {
                                                handleDeleteEntry(
                                                  group.entries[0]._id
                                                );
                                                setDailySummaryOpen(false);
                                              }
                                            }}
                                            title={`Delete entry`}
                                          >
                                            <Delete />
                                          </IconButton>
                                        </>
                                      )}
                                    </Box>
                                  </Box>
                                );
                              }
                            )}
                          </Box>
                        </Box>
                      );
                    })()}
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                variant="contained"
                onClick={() => setDailySummaryOpen(false)}
                sx={{ backgroundColor: "#2196f3" }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            }}
            onClick={handleAddEntry}
          >
            <Add />
          </Fab>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default EmployeeTimeTracker;
