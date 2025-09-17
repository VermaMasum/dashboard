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
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/utils/axios";

const COLORS = ["#2196f3", "#e91e63", "#4caf50", "#ff9800", "#9c27b0"];

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
  category: string;
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

const EmployeeTimeTracker = () => {
  const { user } = useAuth();

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

  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Filter states
  const [filterProject, setFilterProject] = useState("");

  // Expand/collapse states
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, [currentDate, viewMode, filterProject]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch projects (only once, not dependent on date)
      if (projects.length === 0) {
        const projectsRes = await axios.get(`/projects/${user.id}/assign`);
        setProjects(projectsRes.data);
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
          duration: report.duration || (report.hoursWorked ? report.hoursWorked * 60 : 0) || 0,
          description: report.description || report.details || report.title || "No description provided",
          category: report.category || "General",
          // Ensure project object is properly set
          project: report.project || { _id: 'unknown', name: 'General Work' },
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
    setAddEntryDialog(true);
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
    setEditEntryDialog(true);
  };

  const handleViewDetails = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setDetailsDialog(true);
  };

  const handleSaveEntry = async () => {
    try {
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
        description: description,
        duration: durationInMinutes,
        hoursWorked: durationInMinutes / 60, // Also set hoursWorked for compatibility
        date: selectedDate,
        employee: user?.id,
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

  const toggleExpanded = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
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
    <Box sx={{ p: 3 }}>
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
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
          Employee Time Tracker
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
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddEntry}
                  sx={{
                    background:
                      "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                    color: "white",
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)",
                    },
                  }}
                >
                  Add Entry
                </Button>
              </Box>

              {/* Center - Date Display, Total Hours, and Project Filter */}
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

                {/* Total Hours Display */}
                <Box sx={{ 
                  backgroundColor: "#e3f2fd", 
                  px: 2, 
                  py: 1, 
                  borderRadius: 2,
                  border: "1px solid #2196f3"
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                    Total {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Hours
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {calculateTotalHours()}
                  </Typography>
                </Box>

                {/* Project Filter */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
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
                const isToday = dayDate.toDateString() === new Date().toDateString();
                
                // Get entries for this day
                const dayEntries = timeEntries.filter((entry) => {
                  const entryDate = new Date(entry.date);
                  return entryDate.toDateString() === dayDate.toDateString();
                });
                
                // Debug: Log entries for days that have data
                if (dayEntries.length > 0) {
                  console.log("Employee - Month day entries for", dayDate.toDateString(), ":", dayEntries);
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
                    onClick={() => handleDayClick(dayDate)}
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
                    
                    {/* Show entry blocks */}
                    {dayEntries.slice(0, 3).map((entry, index) => {
                      const colors = ["#2196f3", "#e91e63", "#4caf50", "#ff9800", "#9c27b0"];
                      const color = colors[index % colors.length];
                      const isExpanded = expandedEntries.has(entry._id);
                      
                      return (
                        <Box
                          key={entry._id}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(entry);
                            }}
                            sx={{ flex: 1 }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                              {entry.project?.name || 'General Work'}
                            </Typography>
                            {isExpanded && (
                              <Typography variant="caption" sx={{ 
                                display: "block", 
                                opacity: 0.9, 
                                fontSize: "8px",
                                mt: 0.5,
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}>
                                {entry.description ? entry.description.substring(0, 20) + (entry.description.length > 20 ? '...' : '') : 'No description'}
                              </Typography>
                            )}
                            <Typography variant="caption" sx={{ 
                              display: "block", 
                              opacity: 0.9, 
                              fontSize: "9px",
                              mt: 0.5
                            }}>
                              {formatDurationAsHours(entry.duration || 0)}h
                            </Typography>
                          </Box>
                          <Box
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded(entry._id);
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
                        </Box>
                      );
                    })}
                    
                    {dayEntries.length > 3 && (
                      <Typography
                        variant="caption"
                        sx={{ 
                          color: "text.secondary", 
                          fontSize: "9px",
                          textAlign: "center",
                          mt: 0.5
                        }}
                      >
                        +{dayEntries.length - 3} more
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
                year: "numeric"
              })}
            </Typography>
          {/* Total Hours for Day */}
          {/* Removed duplicate Total Day Hours box to avoid duplication */}
          </Box>

          {/* Day Entries - Enhanced Grid Layout */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {(() => {
              const dayEntries = timeEntries.filter(
                (entry) =>
                  new Date(entry.date).toDateString() ===
                  currentDate.toDateString()
              );
              
              console.log("Employee - Day entries for", currentDate.toDateString(), ":", dayEntries);
              
              return dayEntries.map((entry, entryIndex) => {
              const colors = ["#2196f3", "#e91e63", "#4caf50", "#ff9800", "#9c27b0"];
              const color = colors[entryIndex % colors.length];
              const isExpanded = expandedEntries.has(entry._id);
              
              return (
                <Card
                  key={entry._id}
                  sx={{
                    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                    color: "white",
                    borderRadius: 2,
                    p: 2,
                    cursor: "pointer",
                    position: "relative",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 4,
                      opacity: 0.9
                    },
                    transition: "all 0.3s ease"
                  }}
                  onClick={() => handleViewDetails(entry)}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
                        {entry.project?.name || 'General Work'}
                      </Typography>
                      {isExpanded && (
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                          {entry.description || "No description provided."}
                        </Typography>
                      )}
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
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
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="h5" fontWeight="bold">
                        {formatDurationAsHours(entry.duration || 0)}h
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEntry(entry);
                        }}
                        sx={{ 
                          color: "white", 
                          borderColor: "white",
                          "&:hover": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                            borderColor: "white"
                          }
                        }}
                      >
                        Edit
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* Expand/Collapse Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(entry._id);
                    }}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      minWidth: 24,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.3)",
                      }
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: "12px", fontWeight: "bold" }}>
                      {isExpanded ? "−" : "+"}
                    </Typography>
                  </Button>
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
                  Click "Add Entry" to create a new time entry
                </Typography>
              </Box>
            )}
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

            {/* Task Blocks for each day */}
            {getWeekDays().map((day, dayIndex) => {
              const dayEntries = timeEntries.filter((entry) => {
                const entryDate = new Date(entry.date);
                return entryDate.toDateString() === day.toDateString();
              });

              console.log("Employee - Week day entries for", day.toDateString(), ":", dayEntries);

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
                    dayEntries.map((entry, entryIndex) => {
                      const colors = ["#2196f3", "#e91e63", "#4caf50", "#ff9800", "#9c27b0"];
                      const color = colors[entryIndex % colors.length];
                      const isExpanded = expandedEntries.has(entry._id);

                      return (
                        <Box
                          key={entry._id}
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
                            onClick={() => handleViewDetails(entry)}
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
                              {entry.project?.name || 'General Work'}
                            </Typography>
                            {isExpanded && (
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: "0.7rem",
                                  opacity: 0.9,
                                  display: "block",
                                  mb: 0.5,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {entry.description ? entry.description.substring(0, 15) + (entry.description.length > 15 ? '...' : '') : 'No description'}
                              </Typography>
                            )}
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: "0.75rem",
                                opacity: 0.9,
                                display: "block",
                              }}
                            >
                              {formatDurationAsHours(entry.duration || 0)}h
                            </Typography>
                          </Box>
                          
                          {/* Expand/Collapse Button */}
                          <Box
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded(entry._id);
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
                        </Box>
                      );
                    })
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Project
                </Typography>
                <Typography variant="body1">
                  {selectedEntry.project?.name || 'General Work'}
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
                <Typography variant="body1">
                  {selectedEntry.description || "No description provided."}
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
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
          <Button 
            onClick={() => {
              setDetailsDialog(false);
              handleEditEntry(selectedEntry!);
            }} 
            variant="contained"
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
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
  );
};

export default EmployeeTimeTracker;