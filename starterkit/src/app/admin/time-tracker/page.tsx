"use client";

import React, { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Grid,
  Avatar,
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
  Visibility,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/utils/axios";

interface TimeEntry {
  _id: string;
  project: {
    _id: string;
    name: string;
  };
  employee: {
    _id: string;
    username: string;
  };

  category?: string;
  description: string;
  duration: number; // in minutes
  date: string;
  startTime?: string;
  endTime?: string;
  isRunning?: boolean;
}

interface Project {
  _id: string;
  name: string;
  description: string;
}

interface Employee {
  _id: string;
  username: string;
  email: string;
}

const COLORS = [
  "#2196f3", // blue
  "#e762ffff", // purple
  "#009688", // teal
  "#3f51b5", // indigo
];

const AdminTimeTracker = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dialog states
  const [addEntryDialog, setAddEntryDialog] = useState(false);
  const [editEntryDialog, setEditEntryDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [employeeDetailsDialog, setEmployeeDetailsDialog] = useState(false);
  const [selectedEmployeeForDetails, setSelectedEmployeeForDetails] =
    useState<Employee | null>(null);
  const [selectedDateForDetails, setSelectedDateForDetails] = useState<Date | null>(null);

  // Form states
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Filter states
  const [filterProject, setFilterProject] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<{
    [key: string]: string;
  }>({});
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Expand/collapse states
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, [currentDate, viewMode, filterProject, filterEmployee]);

  const fetchProjectsForEmployee = async (employeeId: string) => {
    try {
      const projectsRes = await axios.get(`/projects/${employeeId}/t`);
      setProjects(projectsRes.data);
    } catch (err) {
      console.error("Error fetching projects for employee:", err);
      setProjects([]);
    }
  };

  

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch projects (only once, not dependent on date)
      if (projects.length === 0) {
        const projectsRes = await axios.get("/projects");
        console.log("Admin - Raw projects data:", projectsRes.data);
        setProjects(projectsRes.data);
      }

      // Fetch employees (only once, not dependent on date)
      if (employees.length === 0) {
        const usersRes = await axios.get("/users/all");
        const allUsers = usersRes.data.all || usersRes.data;
        console.log("Admin - Raw users data:", allUsers);
        const employeeUsers = Array.isArray(allUsers)
          ? allUsers.filter((user: any) => user.role === "employee")
          : [];
        console.log("Admin - Filtered employees:", employeeUsers);
        setEmployees(employeeUsers);
      }

      // Calculate date range based on current view mode
      const { startDate, endDate } = getDateRange(currentDate, viewMode);

      console.log("Admin - Current filters:", { 
        filterEmployee, 
        filterProject, 
        startDate: startDate.toISOString().split("T")[0], 
        endDate: endDate.toISOString().split("T")[0] 
      });

      // Fetch reports with date range parameters
      const reportsRes = await axios.get("/reports", {
        params: {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          employee: filterEmployee || undefined,
          project: filterProject || undefined,
        },
      });

      let allReports = reportsRes.data;
      
      // Debug: Log the raw data
      console.log("Raw reports data:", allReports);
      
      // Ensure duration and description are properly set for each report
      allReports = allReports.map((report: any) => {
        // Debug: Log each report
        console.log("Processing report:", report);
        
        return {
          ...report,
          duration: report.duration || (report.hoursWorked ? report.hoursWorked * 60 : 0) || 0,
          description: report.description || report.details || report.title || "No description provided",
          category: report.category || "General",
          // Ensure employee and project objects are properly set
          employee: report.employee || { _id: 'unknown', username: 'Unknown Employee' },
          project: report.project || { _id: 'unknown', name: 'General Work' },
        };
      });

      console.log("Processed reports:", allReports);
      
      // Apply client-side filtering to ensure filters work properly
      let filteredReports = allReports;
      
      // Apply employee filter
      if (filterEmployee) {
        filteredReports = filteredReports.filter((report: any) => 
          report.employee?._id === filterEmployee
        );
        console.log("After employee filter:", filteredReports);
      }
      
      // Apply project filter
      if (filterProject) {
        filteredReports = filteredReports.filter((report: any) => 
          report.project?._id === filterProject
        );
        console.log("After project filter:", filteredReports);
      }
      
      console.log("Final filtered reports:", filteredReports);
      setTimeEntries(filteredReports);
    } catch (err: any) {
      console.error("Error fetching admin time tracker data:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch data"
      );
    } finally {
      setLoading(false);
    }
  };

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

  const getTotalHoursForDay = (date: Date) => {
    const dayEntries = timeEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === date.toDateString();
    });

    const totalMinutes = dayEntries.reduce((sum, entry) => {
      const duration =
        entry.duration && !isNaN(entry.duration) ? entry.duration : 0;
      return sum + duration;
    }, 0);
    return (
      Math.floor(totalMinutes / 60) +
      ":" +
      String(totalMinutes % 60).padStart(2, "0")
    );
  };

  const getWeekTotal = () => {
    const totalMinutes = timeEntries.reduce((sum, entry) => {
      const duration =
        entry.duration && !isNaN(entry.duration) ? entry.duration : 0;
      return sum + duration;
    }, 0);
    return (
      Math.floor(totalMinutes / 60) +
      ":" +
      String(totalMinutes % 60).padStart(2, "0")
    );
  };

  const getEmployeeTotal = (employeeId: string) => {
    const employeeEntries = timeEntries.filter(
      (entry) => entry.employee._id === employeeId
    );
    const totalMinutes = employeeEntries.reduce((sum, entry) => {
      const duration =
        entry.duration && !isNaN(entry.duration) ? entry.duration : 0;
      return sum + duration;
    }, 0);
    return (
      Math.floor(totalMinutes / 60) +
      ":" +
      String(totalMinutes % 60).padStart(2, "0")
    );
  };

  const getProjectTotal = (projectId: string) => {
    const projectEntries = timeEntries.filter(
      (entry) => entry.project?._id === projectId
    );
    const totalMinutes = projectEntries.reduce((sum, entry) => {
      const duration =
        entry.duration && !isNaN(entry.duration) ? entry.duration : 0;
      return sum + duration;
    }, 0);
    return (
      Math.floor(totalMinutes / 60) +
      ":" +
      String(totalMinutes % 60).padStart(2, "0")
    );
  };

  const formatDuration = (minutes: number) => {
    if (!minutes || isNaN(minutes) || minutes < 0) {
      return "0:00";
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${String(mins).padStart(2, "0")}`;
  };

  // Calculate total hours for current view
  const calculateTotalHours = () => {
    const { startDate, endDate } = getDateRange(currentDate, viewMode);
    const filteredEntries = timeEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    const totalMinutes = filteredEntries.reduce((sum, entry) => {
      return sum + (entry.duration || 0);
    }, 0);
    
    return formatDuration(totalMinutes);
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

  const handleReturnToToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEntry = () => {
    setSelectedEntry(null);
    setSelectedProject("");
    setSelectedEmployee("");
    setCategory("");
    setDescription("");
    setDuration("");
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setAddEntryDialog(true);
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setSelectedProject(entry.project?._id || "");
    setSelectedEmployee(entry.employee._id);
    setCategory((entry as any).category || "");
    setDescription(entry.description);
    // Ensure duration is a valid number before formatting
    const validDuration =
      entry.duration && !isNaN(entry.duration) ? entry.duration : 0;
    setDuration(formatDuration(validDuration));
    setSelectedDate(entry.date);
    setEditEntryDialog(true);
  };

  const handleViewDetails = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setDetailsDialog(true);
  };

  const handleEmployeeDetailsClick = (employee: any, date: Date) => {
    setSelectedEmployeeForDetails(employee);
    setSelectedDateForDetails(date);
    setEmployeeDetailsDialog(true);
  };

  const handleSaveEntry = async () => {
    try {
      const entryData = {
        project: selectedProject,
        employee: selectedEmployee,
        category: category,
        description: description,
        duration:
          parseInt(duration.split(":")[0]) * 60 +
          parseInt(duration.split(":")[1]),
        date: selectedDate,
      };

      if (selectedEntry) {
        // Update existing entry
        await axios.put(`/reports/${selectedEntry._id}`, entryData);
      } else {
        // Create new entry
        await axios.post("/reports", entryData);
      }

      setAddEntryDialog(false);
      setEditEntryDialog(false);
      fetchData();
    } catch (err: any) {
      console.error("Error saving time entry:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to save entry"
      );
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await axios.delete(`/reports/${entryId}`);
      fetchData();
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

  const handleEmployeeClick = (employeeId: string) => {
    setFilterEmployee(employeeId);
  };

  const handleProjectClick = (projectId: string) => {
    setFilterProject(projectId);
  };


  const clearFilters = () => {
    setFilterEmployee("");
    setFilterProject("");
  };

  const toggleExpandedEmployee = (employeeId: string) => {
    setExpandedEmployees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const getEmployeeWeeklyData = (employeeId: string) => {
    const employeeEntries = timeEntries.filter(
      (entry) => entry.employee._id === employeeId
    );
    const totalMinutes = employeeEntries.reduce((sum, entry) => {
      const duration =
        entry.duration && !isNaN(entry.duration) ? entry.duration : 0;
      return sum + duration;
    }, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalMins = totalMinutes % 60;

    return {
      totalHours: `${totalHours}:${String(totalMins).padStart(2, "0")}`,
      totalMinutes,
      entryCount: employeeEntries.length,
      entries: employeeEntries,
    };
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

  // Group time entries by employee
  const groupedEntriesByEmployee = employees.map((employee) => {
    const entries = timeEntries.filter(
      (entry) => entry.employee._id === employee._id
    );
    const totalMinutes = entries.reduce((sum, entry) => {
      const duration =
        entry.duration && !isNaN(entry.duration) ? entry.duration : 0;
      return sum + duration;
    }, 0);
    return {
      employee,
      entries,
      totalMinutes,
      totalHours: `${Math.floor(totalMinutes / 60)}:${String(
        totalMinutes % 60
      ).padStart(2, "0")}`,
    };
  });

  return (
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
        <Typography color="text.primary">Time Tracker</Typography>
      </Breadcrumbs> */}

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
          Admin Time Tracker
        </Typography>

        {/* Header with Navigation, Filters and View Toggle */}
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
              {/* Left Side - Navigation Arrows and Add Event */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  onClick={() => handleDateChange("prev")}
                  size="small"
                  sx={{ backgroundColor: "#f5f5f5" }}
                >
                  <ArrowBack />
                </IconButton>
                <IconButton
                  onClick={() => handleDateChange("next")}
                  size="small"
                  sx={{ backgroundColor: "#f5f5f5" }}
                >
                  <ArrowForward />
                </IconButton>
              </Box>

              {/* Center - Date Display, Total Hours, and Filters */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flex: 1,
                  justifyContent: "center",
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


                {/* Employee Filter */}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    value={filterEmployee}
                    onChange={(e) => {
                      console.log("Admin - Employee filter changed to:", e.target.value);
                      setFilterEmployee(e.target.value);
                    }}
                    label="Employee"
                  >
                    <MenuItem value="">All Employees ({employees.length})</MenuItem>
                    {employees.map((employee) => (
                      <MenuItem key={employee._id} value={employee._id}>
                        {employee.username}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Project Filter */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={filterProject}
                    onChange={(e) => {
                      console.log("Admin - Project filter changed to:", e.target.value);
                      setFilterProject(e.target.value);
                    }}
                    label="Project"
                  >
                    <MenuItem value="">All Projects ({projects.length})</MenuItem>
                    {projects.map((project) => (
                      <MenuItem key={project._id} value={project._id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Clear Filters Button */}
                {(filterEmployee || filterProject) && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setFilterEmployee("");
                      setFilterProject("");
                    }}
                    sx={{ 
                      minWidth: 100,
                      borderColor: "#f44336",
                      color: "#f44336",
                      "&:hover": {
                        borderColor: "#d32f2f",
                        backgroundColor: "#ffebee"
                      }
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Box>

              {/* Right Side - View Toggle */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(event, newViewMode) => {
                  if (newViewMode !== null) {
                    setViewMode(newViewMode);
                  }
                }}
                sx={{
                  "& .MuiToggleButton-root": {
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    textTransform: "none",
                    fontWeight: "bold",
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
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Month View */}
      {viewMode === "month" && (
        <Box>
          {/* Month Header */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Typography>
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
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Typography
                key={day}
                align="center"
                fontWeight="bold"
                sx={{ color: "#666" }}
              >
                {day}
              </Typography>
            ))}
          </Box>

          {/* Employee-wise Calendar Grid */}
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
                const isToday = dayDate.toDateString() === new Date().toDateString();
                
                // Get entries for this day
                const dayEntries = timeEntries.filter((entry) => {
                  const entryDate = new Date(entry.date);
                  return entryDate.toDateString() === dayDate.toDateString();
                });
                
                // Group entries by employee
                const employeeGroups = dayEntries.reduce((acc, entry) => {
                  const empId = entry.employee?._id || 'unknown';
                  if (!acc[empId]) {
                    acc[empId] = {
                      employee: entry.employee,
                      entries: []
                    };
                  }
                  acc[empId].entries.push(entry);
                  return acc;
                }, {} as any);
                
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
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        color: isCurrentMonth 
                          ? (isToday ? "primary.main" : "text.primary")
                          : "text.disabled",
                        mb: 1,
                      }}
                    >
                      {dayDate.getDate()}
                    </Typography>
                    
                    {/* Show employee blocks */}
                    {Object.values(employeeGroups).slice(0, 3).map((group: any, index) => {
                      const colors = ["#2196f3", "#e91e63", "#4caf50", "#ff9800", "#9c27b0"];
                      const color = colors[index % colors.length];
                      const totalHours = group.entries.reduce((sum: number, entry: any) => 
                        sum + (entry.duration || 0), 0);
                      const isExpanded = expandedEmployees.has(group.employee?._id || '');
                      
                      return (
                        <Box
                          key={group.employee?._id || index}
                          sx={{
                            backgroundColor: color,
                            color: "white",
                            borderRadius: 1,
                            p: 0.5,
                            mb: 0.5,
                            cursor: "pointer",
                            fontSize: 10,
                            fontWeight: "bold",
                            position: "relative",
                            "&:hover": {
                              opacity: 0.8,
                            },
                          }}
                        >
                          <Box
                            onClick={() => handleEmployeeDetailsClick(group.employee, dayDate)}
                            sx={{ flex: 1 }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                              {group.employee?.username || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              display: "block", 
                              opacity: 0.9, 
                              fontSize: "9px",
                              mt: 0.5
                            }}>
                              {formatDuration(totalHours)} • {group.entries.length} tasks
                            </Typography>
                          </Box>
                          
                          {/* Expand/Collapse Button */}
                          <Box
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpandedEmployee(group.employee?._id || '');
                            }}
                            sx={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              width: 12,
                              height: 12,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "rgba(255,255,255,0.2)",
                              borderRadius: "50%",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.3)",
                              }
                            }}
                          >
                            <Typography variant="caption" sx={{ fontSize: "8px", fontWeight: "bold" }}>
                              {isExpanded ? "−" : "+"}
                            </Typography>
                          </Box>
                          
                          {/* Expanded Tasks */}
                          {isExpanded && (
                            <Box sx={{ mt: 0.5, pt: 0.5, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                              {group.entries.slice(0, 2).map((entry: any, entryIndex: number) => (
                                <Box
                                  key={entry._id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(entry);
                                  }}
                                  sx={{
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                    borderRadius: 0.5,
                                    p: 0.25,
                                    mb: 0.25,
                                    cursor: "pointer",
                                    fontSize: "8px",
                                    "&:hover": {
                                      backgroundColor: "rgba(255,255,255,0.2)",
                                    },
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      display: "block",
                                      fontWeight: "bold",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {entry.project?.name || 'General Work'}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: "7px",
                                      opacity: 0.9,
                                      display: "block",
                                    }}
                                  >
                                    {formatDuration(entry.duration || 0)}
                                  </Typography>
                                </Box>
                              ))}
                              {group.entries.length > 2 && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: "7px",
                                    opacity: 0.8,
                                    display: "block",
                                    textAlign: "center",
                                    mt: 0.25
                                  }}
                                >
                                  +{group.entries.length - 2} more
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                    
                    {Object.keys(employeeGroups).length > 3 && (
                      <Typography
                        variant="caption"
                        sx={{ 
                          color: "text.secondary", 
                          fontSize: "9px",
                          textAlign: "center",
                          mt: 0.5
                        }}
                      >
                        +{Object.keys(employeeGroups).length - 3} more
                      </Typography>
                    )}
                  </Box>
                );
              }
              return days;
            })()}
          </Box>
        </Box>
      )}

      {/* Day View - Employee-wise Grouping */}
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
                year: "numeric"
              })}
            </Typography>
          </Box>

          {/* Day Entries - Employee-wise Grouping */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {(() => {
              const dayEntries = timeEntries.filter(
                (entry) =>
                  new Date(entry.date).toDateString() ===
                  currentDate.toDateString()
              );
              
              console.log("Day entries for", currentDate.toDateString(), ":", dayEntries);
              
              // Group entries by employee
              const employeeGroups = dayEntries.reduce((acc, entry) => {
                const empId = entry.employee?._id || 'unknown';
                console.log("Processing entry for employee:", entry.employee, "empId:", empId);
                if (!acc[empId]) {
                  acc[empId] = {
                    employee: entry.employee,
                    entries: []
                  };
                }
                acc[empId].entries.push(entry);
                return acc;
              }, {} as any);
              
              console.log("Employee groups:", employeeGroups);

              return Object.values(employeeGroups).map((group: any, groupIndex) => {
                const colors = ["#2196f3", "#e91e63", "#4caf50", "#ff9800", "#9c27b0"];
                const color = colors[groupIndex % colors.length];
                const totalHours = group.entries.reduce((sum: number, entry: any) => 
                  sum + (entry.duration || 0), 0);
                const isExpanded = expandedEmployees.has(group.employee?._id || '');

                return (
                  <Card
                    key={group.employee?._id || groupIndex}
                    sx={{
                      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                      color: "white",
                      borderRadius: 2,
                      p: 2,
                      position: "relative",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 4,
                        opacity: 0.9
                      },
                      transition: "all 0.3s ease"
                    }}
                  >
                    {/* Employee Header */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}>
                          {group.employee?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {group.employee?.username || 'Unknown Employee'}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {group.entries.length} task{group.entries.length !== 1 ? 's' : ''} • {formatDuration(totalHours)} total
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Expand/Collapse Button */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandedEmployee(group.employee?._id || '');
                        }}
                        sx={{
                          minWidth: 32,
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          backgroundColor: "rgba(255,255,255,0.2)",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "rgba(255,255,255,0.3)",
                          }
                        }}
                      >
                        <Typography variant="caption" sx={{ fontSize: "14px", fontWeight: "bold" }}>
                          {isExpanded ? "−" : "+"}
                        </Typography>
                      </Button>
                    </Box>

                    {/* Employee's Tasks - Only show when expanded */}
                    {isExpanded && (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {group.entries.map((entry: any, entryIndex: number) => (
                          <Box
                            key={entry._id}
                            onClick={() => handleViewDetails(entry)}
                            sx={{
                              backgroundColor: "rgba(255,255,255,0.1)",
                              borderRadius: 1,
                              p: 1.5,
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.2)",
                              },
                              transition: "all 0.2s ease"
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" fontWeight="bold" sx={{ mb: 0.5 }}>
                                  {entry.project?.name || 'General Work'}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                                  {entry.description || "No description provided."}
                                </Typography>
                                <Chip
                                  label={entry.category || "General"}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: "rgba(255,255,255,0.2)", 
                                    color: "white",
                                    fontWeight: "bold"
                                  }}
                                />
                              </Box>
                              <Typography variant="h6" fontWeight="bold">
                                {formatDuration(entry.duration || 0)}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Card>
                );
              });
            })()}
            
            {timeEntries.filter(
              (entry) =>
                new Date(entry.date).toDateString() ===
                currentDate.toDateString()
            ).length === 0 && (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No time entries for this day
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No employees have logged time for this day
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Week View - Employee-wise Grouping */}
      {viewMode === "week" && (
        <Box>
          {/* Week View Header */}
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
              Week of {getWeekDays()[0].toLocaleDateString("en-US", { 
                month: "short", 
                day: "numeric" 
              })} - {getWeekDays()[6].toLocaleDateString("en-US", { 
                month: "short", 
                day: "numeric",
                year: "numeric"
              })}
            </Typography>
          </Box>

          {/* Week View - Employee-wise Calendar Grid */}
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
                  backgroundColor: day.toDateString() === currentDate.toDateString()
                    ? "#f0f8ff"
                    : "white",
                  borderRadius: 1,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Typography variant="body2" fontWeight="bold" color="text.secondary">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {day.getDate()}
                </Typography>
              </Box>
            ))}

            {/* Employee Blocks for each day */}
            {getWeekDays().map((day, dayIndex) => {
              const dayEntries = timeEntries.filter((entry) => {
                const entryDate = new Date(entry.date);
                return entryDate.toDateString() === day.toDateString();
              });

              console.log("Week day entries for", day.toDateString(), ":", dayEntries);

              // Group entries by employee for this day
              const employeeGroups = dayEntries.reduce((acc, entry) => {
                const empId = entry.employee?._id || 'unknown';
                console.log("Week view - Processing entry for employee:", entry.employee, "empId:", empId);
                if (!acc[empId]) {
                  acc[empId] = {
                    employee: entry.employee,
                    entries: []
                  };
                }
                acc[empId].entries.push(entry);
                return acc;
              }, {} as any);
              
              console.log("Week view - Employee groups for", day.toDateString(), ":", employeeGroups);

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
                  {Object.values(employeeGroups).map((group: any, groupIndex) => {
                    const colors = ["#2196f3", "#e91e63", "#4caf50", "#ff9800", "#9c27b0"];
                    const color = colors[groupIndex % colors.length];
                    const totalHours = group.entries.reduce((sum: number, entry: any) => 
                      sum + (entry.duration || 0), 0);
                    const isExpanded = expandedEmployees.has(group.employee?._id || '');

                    return (
                      <Box
                        key={group.employee?._id || groupIndex}
                        sx={{
                          backgroundColor: color,
                          color: "white",
                          borderRadius: 1,
                          p: 1,
                          mb: 0.5,
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          position: "relative",
                          "&:hover": {
                            opacity: 0.8,
                          },
                        }}
                      >
                        <Box
                          onClick={() => handleEmployeeDetailsClick(group.employee, day)}
                          sx={{ flex: 1 }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                              fontWeight: "bold",
                              mb: 0.5,
                            }}
                          >
                            {group.employee?.username || 'Unknown Employee'}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "0.75rem",
                              opacity: 0.9,
                              display: "block",
                            }}
                          >
                            {formatDuration(totalHours)} • {group.entries.length} task{group.entries.length !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                        
                        {/* Expand/Collapse Button */}
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandedEmployee(group.employee?._id || '');
                          }}
                          sx={{
                            position: "absolute",
                            top: 2,
                            right: 2,
                            width: 16,
                            height: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(255,255,255,0.2)",
                            borderRadius: "50%",
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(255,255,255,0.3)",
                            }
                          }}
                        >
                          <Typography variant="caption" sx={{ fontSize: "10px", fontWeight: "bold" }}>
                            {isExpanded ? "−" : "+"}
                          </Typography>
                        </Box>
                        
                        {/* Expanded Tasks */}
                        {isExpanded && (
                          <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                            {group.entries.map((entry: any, entryIndex: number) => (
                              <Box
                                key={entry._id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(entry);
                                }}
                                sx={{
                                  backgroundColor: "rgba(255,255,255,0.1)",
                                  borderRadius: 0.5,
                                  p: 0.5,
                                  mb: 0.5,
                                  cursor: "pointer",
                                  fontSize: "0.7rem",
                                  "&:hover": {
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                  },
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "block",
                                    fontWeight: "bold",
                                    mb: 0.25,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {entry.project?.name || 'General Work'}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: "0.65rem",
                                    opacity: 0.9,
                                    display: "block",
                                  }}
                                >
                                  {formatDuration(entry.duration || 0)}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                label="Employee"
              >
                {employees.map((employee) => (
                  <MenuItem key={employee._id} value={employee._id}>
                    {employee.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Project</InputLabel>
              <Select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
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
              placeholder="Describe what was worked on..."
            />

            <TextField
              fullWidth
              label="Duration (HH:MM)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 02:30"
            />

            <TextField
              fullWidth
              label="Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
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
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Employee
                </Typography>
                <Typography variant="body1">
                  {selectedEntry.employee.username}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Project
                </Typography>
                <Typography variant="body1">
                  {selectedEntry.project.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1">
                  {(selectedEntry as any).category || "General"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">
                  {selectedEntry.description}
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
                  Duration
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatDuration(selectedEntry.duration)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Employee Details Dialog */}
      <Dialog
        open={employeeDetailsDialog}
        onClose={() => setEmployeeDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedEmployeeForDetails?.username} - Work Details for {selectedDateForDetails?.toLocaleDateString()}
        </DialogTitle>
        <DialogContent>
          {selectedEmployeeForDetails && selectedDateForDetails && (
            <Box sx={{ mt: 1 }}>
              {(() => {
                const employeeEntries = timeEntries.filter(
                  (entry) =>
                    entry.employee._id === selectedEmployeeForDetails._id &&
                    new Date(entry.date).toDateString() === selectedDateForDetails.toDateString()
                );
                const totalHours = employeeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
                
                return (
                  <>
                    {/* Summary */}
                    <Box sx={{ mb: 3, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                        Daily Summary
                      </Typography>
                      <Box sx={{ display: "flex", gap: 3 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Total Hours</Typography>
                          <Typography variant="h5" fontWeight="bold" color="primary">
                            {formatDuration(totalHours)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Tasks Completed</Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {employeeEntries.length}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Projects</Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {new Set(employeeEntries.map(e => e.project?._id)).size}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Work Details */}
                    {employeeEntries.length === 0 ? (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No work entries found for this day.
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {employeeEntries.map((entry, index) => {
                          const colors = ["#2196f3", "#e91e63", "#4caf50", "#ff9800", "#9c27b0"];
                          const color = colors[index % colors.length];
                          
                          return (
                            <Card
                              key={entry._id}
                              sx={{
                                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                                color: "white",
                                borderRadius: 2,
                                p: 2,
                              }}
                            >
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                                    {entry.project?.name || 'Unassigned Project'}
                                  </Typography>
                                  <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                                    <Chip
                                      label={entry.employee?.username || 'Unknown Employee'}
                                      size="small"
                                      sx={{ 
                                        backgroundColor: "rgba(255,255,255,0.2)", 
                                        color: "white"
                                      }}
                                    />
                                    <Chip
                                      label={entry.category || "General"}
                                      size="small"
                                      sx={{ 
                                        backgroundColor: "rgba(255,255,255,0.2)", 
                                        color: "white"
                                      }}
                                    />
                                  </Box>
                                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                                    {entry.description || "No work description available."}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Typography variant="h5" fontWeight="bold">
                                    {formatDuration(entry.duration || 0)}
                                  </Typography>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleViewDetails(entry)}
                                    sx={{ 
                                      color: "white", 
                                      borderColor: "white",
                                      "&:hover": {
                                        backgroundColor: "rgba(255,255,255,0.1)",
                                        borderColor: "white"
                                      }
                                    }}
                                  >
                                    View
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
          <Button onClick={() => setEmployeeDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default AdminTimeTracker;
