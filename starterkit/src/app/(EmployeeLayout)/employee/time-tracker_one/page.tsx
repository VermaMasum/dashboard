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
import { id } from "date-fns/locale";

interface TimeEntry {
  _id: string;
  projects: {
    _id: string;
    name: string;
  };
  category: string;
  description: string;
  duration: number; // in minutes
  date: string;
  startTime?: string;
  endTime?: string;
  isRunning?: boolean;
}

interface projects {
  _id: string;
  name: string;
  description: string;
}

interface Report {
  _id: string;
  date: string;
  projects: string;
  employee: string;
  details: string;
  hoursWorked: Number;
}

// Interfaces
interface Report {
  _id: string;
  date: string;
  project: string; // projectId
  employee: string; // employeeId
  details: string;
  hoursWorked: number;
}

interface Project {
  _id: string;
  name: string;
}

interface Employee {
  _id: string;
  name: string;
}

export default function TimeTrackerPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Fetch reports + projects + employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, projectsRes, employeesRes] = await Promise.all([
          fetch("/api/reports"),
          fetch("/api/projects"),
          fetch("/api/employees"),
        ]);

        const [reportsData, projectsData, employeesData] = await Promise.all([
          reportsRes.json(),
          projectsRes.json(),
          employeesRes.json(),
        ]);

        setReports(reportsData);
        setProjects(projectsData);
        setEmployees(employeesData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  // Helpers
  const getProjectName = (id: string) =>
    projects.find((p) => p._id === id)?.name || "Unknown Project";

  const getEmployeeName = (id: string) =>
    employees.find((e) => e._id === id)?.name || "Unknown Employee";

  // Filter reports for current day
  const filteredReports = reports.filter(
    (report) =>
      new Date(report.date).toDateString() === currentDate.toDateString()
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Time Tracker – {currentDate.toDateString()}
      </Typography>

      {/* Example: Date navigation buttons */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() =>
            setCurrentDate(
              new Date(currentDate.setDate(currentDate.getDate() - 1))
            )
          }
          sx={{ mr: 1 }}
        >
          Previous Day
        </Button>
        <Button
          variant="outlined"
          onClick={() => setCurrentDate(new Date())}
          sx={{ mr: 1 }}
        >
          Today
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            setCurrentDate(
              new Date(currentDate.setDate(currentDate.getDate() + 1))
            )
          }
        >
          Next Day
        </Button>
      </Box>

      {filteredReports.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No reports for this day
          </Typography>
        </Box>
      ) : (
        filteredReports.map((report) => (
          <Box
            key={report._id}
            sx={{
              p: 2,
              borderRadius: 2,
              mb: 2,
              backgroundColor: "#e0f7fa",
            }}
          >
            <Typography sx={{ fontWeight: "bold" }}>
              Project: {getProjectName(report.project)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Employee: {getEmployeeName(report.employee)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {report.details || "No details provided"}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Hours Worked: {report.hoursWorked}
            </Typography>
          </Box>
        ))
      )}
    </Box>
  );
}

const [reports, setReports] = useState<Report[]>([]);

useEffect(() => {
  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      if (!res.ok) throw new Error("failed to fetch reports");

      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };
  fetchReports();
}, []);

const filteredReports = reports.filter(
  (report) =>
    new Date(report.date).toDateString() === currentDate.toDateString() &&
    report.employee === currentEmployeeId
);

{
  filteredReports.length === 0 ? (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <Typography variant="h6" color="text.secondary">
        No reports for this day
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
        Click to Add reports
      </Typography>
    </Box>
  ) : (
    filteredReports.map((report) => (
      <Box
        key={report._id}
        sx={{ p: 2, borderRadius: 2, mb: 2, backgroundColor: "#e0f7fa" }}
      >
        <Typography sx={{ fontWeight: "bold" }}>
          Project: {report.projects}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {report.details || "No description provided."}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Hours Worked: {report.hoursWorked}
        </Typography>
      </Box>
    ))
  );
}

const EmployeeTimeTracker = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  // const [projects, setprojects] = useState<TimeEntry[]>([]);
  const [projects, setprojects] = useState<projects[]>([]);
  // const [projects,setprojects] =  useState<projects[]>([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Move handleUpdateprojects inside component to access setprojects
  const handleUpdateReport = async (
    id: string,
    updatedData: Partial<Report>
  ) => {
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        const updatedReport = await res.json();

        // Update local projects state
        setReports((prev) =>
          prev.map((r) => (r._id === id ? updatedReport : r))
        );
      } else {
        console.error("Failed to update reports");
      }
    } catch (err) {
      console.error("Error updating reports:", err);
    }
  };

  //   // Update projects that use this projects
  //   setprojects((prev) =>
  //     prev.map((entry) =>
  //       entry.projects._id === id
  //         ? { ...entry, projects: updatedprojects }
  //         : entry
  //     )
  //   );
  // }

  // Dialog states
  const [addEntryDialog, setAddEntryDialog] = useState(false);
  const [editEntryDialog, setEditEntryDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);

  // Form states
  const [selectedprojects, setSelectedprojects] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Filter states
  const [filterprojects, setFilterprojects] = useState("");
  const [filterEmployee, setFilterEmployee] = useState(user?.id || "");

  useEffect(() => {
    fetchData();
  }, [currentDate, viewMode, filterprojects]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Always fetch projects to get latest updates
      const projectsRes = await axios.get("/projects");
      setprojects(projectsRes.data);

      // Calculate date range based on current view mode
      const { startDate, endDate } = getDateRange(currentDate, viewMode);

      // Fetch reports with date range parameters
      const reportsRes = await axios.get("/reports", {
        params: {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          employee: user?.id,
        },
      });

      let allReports = reportsRes.data;

      // Apply projects filter if selected
      if (filterprojects) {
        allReports = allReports.filter(
          (report: any) => report.projects._id === filterprojects
        );
      }

      setprojects(allReports);
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

  // const getTotalHoursForDay = (date: Date) => {
  //   const dayEntries = projects.filter((entry) => {
  //     const entryDate = new Date(entry.date);
  //     return entryDate.toDateString() === date.toDateString();
  //   });

  //   const totalMinutes = dayEntries.reduce((sum, entry) => {
  //     const duration =
  //       entry.duration && !isNaN(entry.duration) ? entry.duration : 0;
  //     return sum + duration;
  //   }, 0);
  //   return (
  //     Math.floor(totalMinutes / 60) +
  //     ":" +
  //     String(totalMinutes % 60).padStart(2, "0")
  //   );
  // };

  // const handleprojectsFilter = (projectsId: string) => {
  //   setFilterprojects(projectsId);
  // };

  // const clearprojectsFilter = () => {
  //   setFilterprojects("");
  // };

  // const getWeekTotal = () => {
  //   const totalMinutes = projects.reduce((sum, entry) => {
  //     const duration =
  //       entry.duration && !isNaN(entry.duration) ? entry.duration : 0;
  //     return sum + duration;
  //   }, 0);
  //   return (
  //     Math.floor(totalMinutes / 60) +
  //     ":" +
  //     String(totalMinutes % 60).padStart(2, "0")
  //   );
  // };

  const formatDuration = (minutes: number) => {
    if (!minutes || isNaN(minutes) || minutes < 0) {
      return "0:00";
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${String(mins).padStart(2, "0")}`;
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
    setSelectedprojects("");
    setCategory("");
    setDescription("");
    setDuration("");
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setAddEntryDialog(true);
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setSelectedprojects(entry.projects._id);
    setCategory(entry.category || "");
    setDescription(entry.description);
    // Ensure duration is a valid number before formatting
    const validDuration =
      entry.duration && !isNaN(entry.duration) ? entry.duration : 0;
    setDuration(formatDuration(validDuration));
    setSelectedDate(entry.date);
    setEditEntryDialog(true);
  };

  // const handleSubmit = async() => {
  //   try{
  //     const entryData = {
  //       projects:
  //     }
  //   }
  // }
  const handleSaveEntry = async () => {
    try {
      const entryData = {
        projects: selectedprojects,
        category: category,
        description: description,
        duration:
          parseInt(duration.split(":")[0]) * 60 +
          parseInt(duration.split(":")[1]),
        date: selectedDate,
        employee: user?.id,
      };

      if (selectedEntry) {
        // Check if editing a projects or a time entry
        if (
          selectedEntry.projects &&
          selectedEntry.projects._id === selectedprojects
        ) {
          // Editing a time entry (report)
          await axios.put(`/reports/${selectedEntry._id}`, entryData);
        } else {
          // Editing a projects
          await handleUpdateprojects(selectedprojects, {
            name: projects.find((p) => p._id === selectedprojects)?.name || "",
            description: description,
          });
        }
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
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          href="/employee/overview"
          color="inherit"
          sx={{ textDecoration: "none" }}
        >
          Employee
        </Link>
        <Typography color="text.primary">Time Tracker</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        {/* <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
          Employee Time Tracker
        </Typography> */}

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
                  Add Event
                </Button>
              </Box>

              {/* Center - Date Display and projects Filter */}
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

                {/* projects Filter */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>projects</InputLabel>
                  <Select
                    value={filterprojects}
                    onChange={(e) => setFilterprojects(e.target.value)}
                    label="projects"
                  >
                    <MenuItem value="">All projects</MenuItem>
                    {projects.map((projects) => (
                      <MenuItem key={projects._id} value={projects._id}>
                        {projects.name}
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

      {/* Calendar Content Based on View Mode */}
      <Card>
        <CardContent sx={{ py: 2 }}>
          {viewMode === "day" && (
            <>
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
                  {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
                </Typography>
              </Box>

              {/* Day Entries - Simple List View */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {projects
                  .filter(
                    (entry) =>
                      new Date(entry.date).toDateString() ===
                      currentDate.toDateString()
                  )
                  .map((entry, entryIndex) => {
                    const colors = [
                      "#4ecdc4",
                      "#ff6b9d",
                      "#45b7d1",
                      "#96ceb4",
                      "#feca57",
                    ];
                    const color = colors[entryIndex % colors.length];

                    // handleEditEntry
                    return (
                      <Box
                        key={entry._id}
                        onClick={() => handleUpdateprojects(entry)}
                        sx={{
                          backgroundColor: color,
                          color: "white",
                          borderRadius: 2,
                          p: 2,
                          cursor: "pointer",
                          "&:hover": {
                            opacity: 0.8,
                            transform: "translateY(-2px)",
                            boxShadow: 2,
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: "bold", mb: 0.5 }}
                            >
                              {entry.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ opacity: 0.9, mb: 0.5 }}
                            >
                              {entry.description || "No description provided."}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              {entry.category || "General"}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="h6" fontWeight="bold">
                              {formatDuration(entry.duration)}
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
                                  borderColor: "white",
                                },
                              }}
                            >
                              Edit
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}

                {projects.filter(
                  (entry) =>
                    new Date(entry.date).toDateString() ===
                    currentDate.toDateString()
                ).length === 0 && (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                      No time entries for this day
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {/* {entry.description
                        ? entry.description
                        : "no description provided."} */}
                      Click "Add Event" to create a new time entry
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}

          {viewMode === "week" && (
            <>
              {/* Week View - Calendar Grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 1,
                  minHeight: "600px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: 2,
                  p: 2,
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
                          ? "#e3f2fd"
                          : "white",
                      borderRadius: 1,
                      border:
                        day.toDateString() === currentDate.toDateString()
                          ? "2px solid #2196F3"
                          : "1px solid #e0e0e0",
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {day.getDate()}
                    </Typography>
                  </Box>
                ))}

                {/* Task Blocks for each day */}
                {getWeekDays().map((day, dayIndex) => {
                  const dayEntries = projects.filter((entry) => {
                    const entryDate = new Date(entry.date);
                    return entryDate.toDateString() === day.toDateString();
                  });

                  return (
                    <Box
                      key={dayIndex}
                      sx={{
                        minHeight: "500px",
                        backgroundColor: "white",
                        borderRadius: 1,
                        border: "1px solid #e0e0e0",
                        p: 1,
                        position: "relative",
                      }}
                    >
                      {dayEntries.map((entry, entryIndex) => {
                        const colors = [
                          "#4ecdc4",
                          "#ff6b9d",
                          "#45b7d1",
                          "#96ceb4",
                          "#feca57",
                        ];
                        const color = colors[entryIndex % colors.length];

                        return (
                          <Box
                            key={entry._id}
                            onClick={() => handleEditEntry(entry)}
                            sx={{
                              backgroundColor: color,
                              color: "white",
                              borderRadius: 1,
                              p: 1,
                              mb: 1,
                              cursor: "pointer",
                              fontSize: "0.875rem",
                              fontWeight: "bold",
                              "&:hover": {
                                opacity: 0.8,
                                transform: "scale(1.02)",
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "block",
                                fontWeight: "bold",
                              }}
                            >
                              {entry.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: "0.75rem",
                                opacity: 0.9,
                                display: "block",
                              }}
                            >
                              {formatDuration(entry.duration)}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            </>
          )}

          {viewMode === "month" && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 1,
                backgroundColor: "#f5f5f5",
                borderRadius: 2,
                p: 2,
              }}
            >
              {/* Day Headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day, i) => (
                  <Box
                    key={i}
                    sx={{ textAlign: "center", fontWeight: "bold", py: 1 }}
                  >
                    {day}
                  </Box>
                )
              )}

              {/* Generate all days in current month */}
              {(() => {
                const days: React.ReactElement[] = [];
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const monthStart = new Date(year, month, 1);
                const monthEnd = new Date(year, month + 1, 0);
                const numDays = monthEnd.getDate();

                // Add empty cells before the 1st day
                for (let i = 0; i < monthStart.getDay(); i++) {
                  days.push(<Box key={`empty-${i}`} />);
                }

                // Add all days of month
                for (let d = 1; d <= numDays; d++) {
                  const thisDate = new Date(year, month, d);
                  const dayEntries = projects.filter((entry) => {
                    const entryDate = new Date(entry.date);
                    return entryDate.toDateString() === thisDate.toDateString();
                  });

                  days.push(
                    <Box
                      key={d}
                      onClick={() => handleDayClick(thisDate)}
                      sx={{
                        backgroundColor:
                          thisDate.toDateString() === new Date().toDateString()
                            ? "#e3f2fd"
                            : "white",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        p: 1,
                        minHeight: 100,
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "#f0f7ff" },
                      }}
                    >
                      {/* Day number */}
                      <Typography variant="subtitle2" fontWeight="bold">
                        {d}
                      </Typography>

                      {/* Entries */}
                      {dayEntries.slice(0, 3).map((entry, idx) => {
                        const colors = [
                          "#4ecdc4",
                          "#ff6b9d",
                          "#45b7d1",
                          "#96ceb4",
                        ];
                        const color = colors[idx % colors.length];
                        return (
                          <Box
                            key={entry._id}
                            sx={{
                              backgroundColor: color,
                              color: "white",
                              borderRadius: 1,
                              px: 0.5,
                              py: 0.3,
                              fontSize: "0.75rem",
                              mt: 0.5,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {entry.projects.name}
                          </Box>
                        );
                      })}

                      {/* Show + more if many entries */}
                      {dayEntries.length > 3 && (
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", fontSize: "0.7rem" }}
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
          )}
        </CardContent>
      </Card>

      {/* Add/Edit projects Dialog */}
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
            <FormControl>
              <InputLabel>projects</InputLabel>
              <Select
                value={selectedprojects}
                onChange={(e) => setSelectedprojects(e.target.value)}
                label="projects"
              >
                {projects.map((projects) => (
                  <MenuItem key={projects._id} value={projects._id}>
                    {projects.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* <TextField
              fullWidth
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Development, Testing, Meeting"
            /> */}

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
              placeholder=" e.g. 8:00 "
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
