"use client";

import React, { useState, useEffect } from "react";

// import FiltersWithArrows from "./FiltersWithArrows";
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
  Refresh,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/utils/axios";
import PageContainer from "../../(DashboardLayout)/components/container/PageContainer";

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
  const [selectedDateForDetails, setSelectedDateForDetails] =
    useState<Date | null>(null);

  // Form states
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // View states - using tabs instead of filters
  const [viewCategory, setViewCategory] = useState<"employee" | "project">(
    "employee"
  );

  // Date picker dialog state
  const [datePickerDialogOpen, setDatePickerDialogOpen] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedViewModeForCalendar, setSelectedViewModeForCalendar] =
    useState<"day" | "week" | "month">("month");

  // Expand/collapse states
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(
    new Set()
  );

  // Day details dialog state
  const [dayDetailsDialog, setDayDetailsDialog] = useState(false);
  const [selectedDayForDetails, setSelectedDayForDetails] =
    useState<Date | null>(null);
  const [expandedEmployeesInDay, setExpandedEmployeesInDay] = useState<
    Set<string>
  >(new Set());

  // Project History state
  const [allTimeEntries, setAllTimeEntries] = useState<TimeEntry[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchData = React.useCallback(async () => {
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

      console.log("Admin - Current date range:", {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });

      // Fetch reports with date range parameters
      const reportsRes = await axios.get("/reports", {
        params: {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
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
          // Ensure employee and project objects are properly set
          employee: report.employee || {
            _id: "unknown",
            username: "Unknown Employee",
          },
          project: report.project || { _id: "unknown", name: "General Work" },
        };
      });

      console.log("Processed reports:", allReports);
      setTimeEntries(allReports);
    } catch (err: any) {
      console.error("Error fetching admin time tracker data:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch data"
      );
    } finally {
      setLoading(false);
    }
  }, [currentDate, viewMode]);

  useEffect(() => {
    fetchData();
  }, [currentDate, viewMode, fetchData]);

  const handleRefreshData = async () => {
    console.log("Admin - Manual refresh triggered");
    // Clear cached data to force fresh fetch
    setTimeEntries([]);
    setProjects([]);
    setEmployees([]);
    await fetchData();
  };

  const fetchProjectsForEmployee = async (employeeId: string) => {
    try {
      const projectsRes = await axios.get(`/projects/${employeeId}/t`);
      setProjects(projectsRes.data);
    } catch (err) {
      console.error("Error fetching projects for employee:", err);
      setProjects([]);
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

  // Get data based on view category
  const getDataByViewCategory = () => {
    switch (viewCategory) {
      case "employee":
        return getEmployeeWiseData();
      case "project":
        return getProjectWiseData();
      default:
        return timeEntries;
    }
  };

  // Aggregate data by employee
  const getEmployeeWiseData = () => {
    const employeeData: {
      [key: string]: {
        employee: any;
        totalMinutes: number;
        entries: TimeEntry[];
        projects: Set<string>;
      };
    } = {};

    timeEntries.forEach((entry) => {
      if (entry.employee) {
        const employeeId = entry.employee._id;
        if (!employeeData[employeeId]) {
          employeeData[employeeId] = {
            employee: entry.employee,
            totalMinutes: 0,
            entries: [],
            projects: new Set(),
          };
        }
        employeeData[employeeId].totalMinutes += entry.duration || 0;
        employeeData[employeeId].entries.push(entry);
        if (entry.project) {
          employeeData[employeeId].projects.add(entry.project.name);
        }
      }
    });

    return Object.values(employeeData).map((data) => ({
      ...data,
      totalHours: formatDuration(data.totalMinutes),
      projectCount: data.projects.size,
      projects: Array.from(data.projects),
    }));
  };

  // Aggregate data by project
  const getProjectWiseData = () => {
    const projectData: {
      [key: string]: {
        project: any;
        totalMinutes: number;
        entries: TimeEntry[];
        employees: Set<string>;
      };
    } = {};

    timeEntries.forEach((entry) => {
      if (entry.project) {
        const projectId = entry.project._id;
        if (!projectData[projectId]) {
          projectData[projectId] = {
            project: entry.project,
            totalMinutes: 0,
            entries: [],
            employees: new Set(),
          };
        }
        projectData[projectId].totalMinutes += entry.duration || 0;
        projectData[projectId].entries.push(entry);
        if (entry.employee) {
          projectData[projectId].employees.add(entry.employee.username);
        }
      }
    });

    return Object.values(projectData).map((data) => ({
      ...data,
      totalHours: formatDuration(data.totalMinutes),
      employeeCount: data.employees.size,
      employees: Array.from(data.employees),
    }));
  };

  const toggleExpandedEmployee = (employeeId: string) => {
    setExpandedEmployees((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const handleDayClick = (date: Date) => {
    setSelectedDayForDetails(date);
    setExpandedEmployeesInDay(new Set()); // Reset expanded employees
    setDayDetailsDialog(true);
  };

  const toggleExpandedEmployeeInDay = (employeeId: string) => {
    setExpandedEmployeesInDay((prev) => {
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

  const getEmployeeAnalytics = () => {
    const employeeStats = employees.map((employee) => {
      const employeeEntries = allTimeEntries.filter(
        (entry) => entry.employee?._id === employee._id
      );
      const totalMinutes = employeeEntries.reduce(
        (sum, entry) => sum + (entry.duration || 0),
        0
      );
      const uniqueProjects = new Set(
        employeeEntries.map((entry) => entry.project?._id)
      ).size;
      const totalDays = new Set(employeeEntries.map((entry) => entry.date))
        .size;

      return {
        employee,
        totalHours: totalMinutes / 60,
        totalMinutes,
        entryCount: employeeEntries.length,
        uniqueProjects,
        totalDays,
        entries: employeeEntries,
      };
    });

    return employeeStats.sort((a, b) => b.totalHours - a.totalHours);
  };

  const renderDayDetailsContent = () => {
    if (!selectedDayForDetails) return null;

    // Get all entries for the selected day
    const dayEntries = timeEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === selectedDayForDetails.toDateString();
    });

    if (dayEntries.length === 0) {
      return (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No work entries found for this day.
          </Typography>
        </Box>
      );
    }

    // Group entries by employee or project based on view category
    const groups = dayEntries.reduce((acc, entry) => {
      if (viewCategory === "project") {
        // Group by project for project-wise view
        const projId = entry.project?._id || "unknown";
        if (!acc[projId]) {
          acc[projId] = {
            project: entry.project,
            entries: [],
          };
        }
        acc[projId].entries.push(entry);
      } else {
        // Group by employee for other views
        const empId = entry.employee?._id || "unknown";
        if (!acc[empId]) {
          acc[empId] = {
            employee: entry.employee,
            entries: [],
          };
        }
        acc[empId].entries.push(entry);
      }
      return acc;
    }, {} as any);

    const totalMinutes = dayEntries.reduce(
      (sum, entry) => sum + (entry.duration || 0),
      0
    );

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Summary Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 3,
            background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
            borderRadius: 2,
            color: "#1976d2",
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {viewCategory === "project"
                ? "Active Projects"
                : "Active Employees"}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {Object.keys(groups).length}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Total Hours
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {formatDuration(totalMinutes)}
            </Typography>
          </Box>
        </Box>

        {/* Group Details */}
        {Object.keys(groups).length === 0 ? (
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
            {Object.values(groups).map((group: any, groupIndex) => {
              const colors = [
                "#2196f3",
                "#e91e63",
                "#4caf50",
                "#ff9800",
                "#9c27b0",
                "#00bcd4",
                "#795548",
                "#607d8b",
              ];
              const color = colors[groupIndex % colors.length];

              const totalMinutes = group.entries.reduce(
                (sum: number, entry: any) => sum + (entry.duration || 0),
                0
              );

              const isExpanded = expandedEmployeesInDay.has(
                viewCategory === "project"
                  ? group.project?._id || ""
                  : group.employee?._id || ""
              );

              return (
                <Card
                  key={
                    viewCategory === "project"
                      ? group.project?._id || groupIndex
                      : group.employee?._id || groupIndex
                  }
                  sx={{
                    overflow: "hidden",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  {/* Group Header */}
                  <Box
                    sx={{
                      background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                      color: "white",
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
                      <Avatar
                        sx={{
                          backgroundColor: "rgba(255,255,255,0.2)",
                          color: "white",
                        }}
                      >
                        {viewCategory === "project"
                          ? group.project?.name?.charAt(0)?.toUpperCase() || "P"
                          : group.employee?.username
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {viewCategory === "project"
                            ? group.project?.name || "Unknown Project"
                            : group.employee?.username || "Unknown Employee"}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {group.entries.length} task
                          {group.entries.length !== 1 ? "s" : ""} •{" "}
                          {formatDuration(totalMinutes)} total
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      onClick={() =>
                        toggleExpandedEmployeeInDay(
                          viewCategory === "project"
                            ? group.project?._id || ""
                            : group.employee?._id || ""
                        )
                      }
                      sx={{
                        color: "white",
                        minWidth: 40,
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {isExpanded ? "−" : "+"}
                      </Typography>
                    </Button>
                  </Box>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <Box sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {group.entries.map((entry: any, entryIndex: number) => (
                          <Box
                            key={entryIndex}
                            onClick={() => handleViewDetails(entry)}
                            sx={{
                              border: "1px solid #e0e0e0",
                              borderRadius: 1,
                              p: 2,
                              backgroundColor: "#fff",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "#f8f9fa",
                              },
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
                                  variant="body1"
                                  fontWeight="bold"
                                  sx={{ mb: 0.5 }}
                                >
                                  {viewCategory === "project"
                                    ? entry.employee?.username ||
                                      "Unknown Employee"
                                    : entry.project?.name || "General Work"}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 1 }}
                                >
                                  {entry.description || "No description"}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <Chip
                                    label={entry.category || "General"}
                                    size="small"
                                    sx={{
                                      backgroundColor: color,
                                      color: "white",
                                      fontWeight: "bold",
                                    }}
                                  />
                                </Box>
                              </Box>
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color={color}
                                sx={{ ml: 2 }}
                              >
                                {formatDuration(entry.duration || 0)}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    );
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
      description="Track and manage employee time entries"
    >
      <Box sx={{ p: 3, width: "100%", maxWidth: "1200px", mx: "auto" }}>
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
          {/* <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ mb: 2 }}
            color="#1976D2"
          >
            Time Tracker
          </Typography> */}

          {/* Combined Header with Navigation, Date, View Toggle, Category Tabs and Analytics */}
          <Box sx={{ mb: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
                p: 2,
                mt: 2,
                backgroundColor: "white",
                borderRadius: 1,
                boxShadow: 1,
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

              {/* Center - Total Hours Display */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  justifyContent: "center",
                }}
              >
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
              </Box>

              {/* Right Corner - View Category Tabs (Employee-wise/Project-wise) */}
              <ToggleButtonGroup
                value={viewCategory}
                exclusive
                onChange={(event, newCategory) => {
                  if (newCategory !== null) {
                    setViewCategory(newCategory);
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
                      backgroundColor: "#4CAF50",
                      color: "white",
                      borderColor: "#4CAF50",
                      "&:hover": {
                        backgroundColor: "#388E3C",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  },
                }}
              >
                <ToggleButton value="employee">Employee-wise</ToggleButton>
                <ToggleButton value="project">Project-wise</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* Employee-wise Calendar View - Same structure as All Entries */}
          {viewCategory === "employee" && (
            <Box>
              {/* Month View */}
              {viewMode === "month" && (
                <Box>
                  {/* Month Header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 3,
                      minHeight: "60px",
                    }}
                  >
                    {/* Navigation Arrows around Title */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        onClick={() => handleDateChange("prev")}
                        size="small"
                        sx={{ backgroundColor: "#f5f5f5" }}
                      >
                        <ArrowBack />
                      </IconButton>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="primary"
                      >
                        {currentDate.toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}{" "}
                        -{" "}
                        {viewCategory === "employee"
                          ? "Employee-wise"
                          : "Project-wise"}
                      </Typography>
                      <IconButton
                        onClick={() => handleDateChange("next")}
                        size="small"
                        sx={{ backgroundColor: "#f5f5f5" }}
                      >
                        <ArrowForward />
                      </IconButton>
                    </Box>

                    {/* Date Picker and Today Button on the right */}
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
                      <Button
                        onClick={handleReturnToToday}
                        size="small"
                        variant="outlined"
                        sx={{
                          minWidth: "auto",
                          px: 1.5,
                          py: 0.5,
                          fontSize: "0.75rem",
                          borderColor: "#1976D2",
                          color: "#1976D2",
                          "&:hover": {
                            borderColor: "#1565C0",
                            backgroundColor: "#f3f9ff",
                          },
                        }}
                      >
                        Today
                      </Button>
                    </Box>
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
                      startDate.setDate(
                        startDate.getDate() - firstDay.getDay()
                      );

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

                        // Group entries by employee
                        const employeeGroups = dayEntries.reduce(
                          (acc, entry) => {
                            const empId = entry.employee?._id || "unknown";
                            if (!acc[empId]) {
                              acc[empId] = {
                                employee: entry.employee,
                                entries: [],
                              };
                            }
                            acc[empId].entries.push(entry);
                            return acc;
                          },
                          {} as any
                        );

                        days.push(
                          <Box
                            key={i}
                            onClick={() =>
                              dayEntries.length > 0 && handleDayClick(dayDate)
                            }
                            sx={{
                              minHeight: 120,
                              border: "1px solid #e0e0e0",
                              backgroundColor: "#fff",
                              p: 1,
                              cursor:
                                dayEntries.length > 0 ? "pointer" : "default",
                              "&:hover": {
                                backgroundColor:
                                  dayEntries.length > 0 ? "#f8f9fa" : "#fff",
                              },
                            }}
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

                            {/* Show total hours for all employees combined */}
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
                                  {formatDuration(
                                    dayEntries.reduce(
                                      (sum, entry) =>
                                        sum + (entry.duration || 0),
                                      0
                                    )
                                  )}
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
                                  {Object.keys(employeeGroups).length} employee
                                  {Object.keys(employeeGroups).length !== 1
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

              {/* Week View */}
              {viewMode === "week" && (
                <Box>
                  {/* Week View Header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 3,
                      minHeight: "60px",
                    }}
                  >
                    {/* Navigation Arrows around Title */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        onClick={() => handleDateChange("prev")}
                        size="small"
                        sx={{ backgroundColor: "#f5f5f5" }}
                      >
                        <ArrowBack />
                      </IconButton>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="primary"
                      >
                        Week of{" "}
                        {getWeekDays()[0]?.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        -{" "}
                        {getWeekDays()[6]?.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        - Employee-wise
                      </Typography>
                      <IconButton
                        onClick={() => handleDateChange("next")}
                        size="small"
                        sx={{ backgroundColor: "#f5f5f5" }}
                      >
                        <ArrowForward />
                      </IconButton>
                    </Box>

                    {/* Date Picker and Today Button on the right */}
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
                      <Button
                        onClick={handleReturnToToday}
                        size="small"
                        variant="outlined"
                        sx={{
                          minWidth: "auto",
                          px: 1.5,
                          py: 0.5,
                          fontSize: "0.75rem",
                          borderColor: "#1976D2",
                          color: "#1976D2",
                          "&:hover": {
                            borderColor: "#1565C0",
                            backgroundColor: "#f3f9ff",
                          },
                        }}
                      >
                        Today
                      </Button>
                    </Box>
                  </Box>

                  {/* Week View - Employee-wise Calendar Grid */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: 1,
                    }}
                  >
                    {getWeekDays().map((day, dayIndex) => {
                      const dayEntries = timeEntries.filter((entry) => {
                        const entryDate = new Date(entry.date);
                        return entryDate.toDateString() === day.toDateString();
                      });

                      const isToday =
                        day.toDateString() === new Date().toDateString();

                      // Group entries by employee
                      const employeeGroups = dayEntries.reduce((acc, entry) => {
                        const empId = entry.employee?._id || "unknown";
                        if (!acc[empId]) {
                          acc[empId] = {
                            employee: entry.employee,
                            entries: [],
                          };
                        }
                        acc[empId].entries.push(entry);
                        return acc;
                      }, {} as any);

                      const totalMinutes = dayEntries.reduce(
                        (sum, entry) => sum + (entry.duration || 0),
                        0
                      );

                      return (
                        <Box
                          key={dayIndex}
                          sx={{
                            minHeight: 120,
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                            p: 1,
                            backgroundColor: "#fff",
                            cursor:
                              dayEntries.length > 0 ? "pointer" : "default",
                            "&:hover": {
                              backgroundColor:
                                dayEntries.length > 0 ? "#f8f9fa" : "#fff",
                            },
                          }}
                          onClick={() => {
                            if (dayEntries.length > 0) {
                              setSelectedDayForDetails(day);
                              setDayDetailsDialog(true);
                            }
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: "bold",
                              color: isToday ? "primary.main" : "text.primary",
                              mb: 1,
                            }}
                          >
                            {day.getDate()}
                          </Typography>

                          {dayEntries.length > 0 && (
                            <Box
                              sx={{
                                backgroundColor: "#2196f3",
                                color: "white",
                                borderRadius: 1,
                                p: 0.5,
                                textAlign: "center",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ display: "block", fontSize: "0.7rem" }}
                              >
                                {Math.floor(totalMinutes / 60)}:
                                {String(totalMinutes % 60).padStart(2, "0")}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ display: "block", fontSize: "0.65rem" }}
                              >
                                {Object.keys(employeeGroups).length} employee
                                {Object.keys(employeeGroups).length !== 1
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

              {viewMode === "day" && (
                <Box>
                  {/* Day View Header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 3,
                      minHeight: "60px",
                    }}
                  >
                    {/* Navigation Arrows around Title */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        onClick={() => handleDateChange("prev")}
                        size="small"
                        sx={{ backgroundColor: "#f5f5f5" }}
                      >
                        <ArrowBack />
                      </IconButton>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="primary"
                      >
                        {currentDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        - Employee-wise
                      </Typography>
                      <IconButton
                        onClick={() => handleDateChange("next")}
                        size="small"
                        sx={{ backgroundColor: "#f5f5f5" }}
                      >
                        <ArrowForward />
                      </IconButton>
                    </Box>

                    {/* Date Picker and Today Button on the right */}
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
                      <Button
                        onClick={handleReturnToToday}
                        size="small"
                        variant="outlined"
                        sx={{
                          minWidth: "auto",
                          px: 1.5,
                          py: 0.5,
                          fontSize: "0.75rem",
                          borderColor: "#1976D2",
                          color: "#1976D2",
                          "&:hover": {
                            borderColor: "#1565C0",
                            backgroundColor: "#f3f9ff",
                          },
                        }}
                      >
                        Today
                      </Button>
                    </Box>
                  </Box>
                  {/* Day View - Employee-wise Grouping */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    {(() => {
                      const dayEntries = timeEntries.filter((entry) => {
                        const entryDate = new Date(entry.date);
                        return (
                          entryDate.toDateString() ===
                          currentDate.toDateString()
                        );
                      });

                      // Group entries by employee
                      const employeeGroups = dayEntries.reduce((acc, entry) => {
                        const empId = entry.employee?._id || "unknown";
                        if (!acc[empId]) {
                          acc[empId] = {
                            employee: entry.employee,
                            entries: [],
                          };
                        }
                        acc[empId].entries.push(entry);
                        return acc;
                      }, {} as any);

                      return Object.values(employeeGroups).map(
                        (group: any, groupIndex) => {
                          const colors = [
                            "#2196f3",
                            "#e91e63",
                            "#4caf50",
                            "#ff9800",
                            "#9c27b0",
                          ];
                          const color = colors[groupIndex % colors.length];
                          const totalMinutes = group.entries.reduce(
                            (sum: number, entry: any) =>
                              sum + (entry.duration || 0),
                            0
                          );

                          const isExpanded = expandedEmployees.has(
                            group.employee?._id || ""
                          );

                          return (
                            <Card
                              key={group.employee?._id || groupIndex}
                              sx={{ p: 2 }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  mb: 2,
                                }}
                              >
                                <Avatar
                                  sx={{
                                    backgroundColor: color,
                                    color: "white",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {group.employee?.username
                                    ?.charAt(0)
                                    ?.toUpperCase() || "U"}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" fontWeight="bold">
                                    {group.employee?.username ||
                                      "Unknown Employee"}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {group.entries.length} tasks •{" "}
                                    {formatDuration(totalMinutes)} total
                                  </Typography>
                                </Box>
                                <Button
                                  onClick={() =>
                                    toggleExpandedEmployee(
                                      group.employee?._id || ""
                                    )
                                  }
                                  sx={{
                                    minWidth: 32,
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    backgroundColor: "rgba(0,0,0,0.1)",
                                    color: "text.primary",
                                    "&:hover": {
                                      backgroundColor: "rgba(0,0,0,0.2)",
                                    },
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: "14px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {isExpanded ? "−" : "+"}
                                  </Typography>
                                </Button>
                              </Box>

                              {isExpanded && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                  }}
                                >
                                  {group.entries.map(
                                    (entry: any, entryIndex: number) => (
                                      <Box
                                        key={entryIndex}
                                        onClick={() => handleViewDetails(entry)}
                                        sx={{
                                          border: "1px solid #e0e0e0",
                                          borderRadius: 1,
                                          p: 2,
                                          backgroundColor: "#fff",
                                          cursor: "pointer",
                                          "&:hover": {
                                            backgroundColor: "#f8f9fa",
                                          },
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
                                              variant="body1"
                                              fontWeight="bold"
                                              sx={{ mb: 0.5 }}
                                            >
                                              {entry.description ||
                                                "No description"}
                                            </Typography>
                                            <Typography
                                              variant="body2"
                                              color="text.secondary"
                                              sx={{ mb: 1 }}
                                            >
                                              {entry.category || "General"}
                                            </Typography>
                                            <Box
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                              }}
                                            >
                                              <Chip
                                                label={
                                                  entry.category || "General"
                                                }
                                                size="small"
                                                sx={{
                                                  backgroundColor: color,
                                                  color: "white",
                                                  fontWeight: "bold",
                                                }}
                                              />
                                            </Box>
                                          </Box>
                                          <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color={color}
                                          >
                                            {formatDuration(
                                              entry.duration || 0
                                            )}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    )
                                  )}
                                </Box>
                              )}
                            </Card>
                          );
                        }
                      );
                    })()}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Project-wise Calendar View */}
          {viewCategory === "project" && (
            <Box>
              {/* Month View */}
              {viewMode === "month" && (
                <Box>
                  {/* Month Header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 3,
                      minHeight: "60px",
                    }}
                  >
                    {/* Navigation Arrows around Title */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        onClick={() => handleDateChange("prev")}
                        size="small"
                        sx={{ backgroundColor: "#f5f5f5" }}
                      >
                        <ArrowBack />
                      </IconButton>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="primary"
                      >
                        {currentDate.toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}{" "}
                        - Project-wise
                      </Typography>
                      <IconButton
                        onClick={() => handleDateChange("next")}
                        size="small"
                        sx={{ backgroundColor: "#f5f5f5" }}
                      >
                        <ArrowForward />
                      </IconButton>
                    </Box>

                    {/* Date Picker and Today Button on the right */}
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
                      <Button
                        onClick={handleReturnToToday}
                        size="small"
                        variant="outlined"
                        sx={{
                          minWidth: "auto",
                          px: 1.5,
                          py: 0.5,
                          fontSize: "0.75rem",
                          borderColor: "#1976D2",
                          color: "#1976D2",
                          "&:hover": {
                            borderColor: "#1565C0",
                            backgroundColor: "#f3f9ff",
                          },
                        }}
                      >
                        Today
                      </Button>
                    </Box>
                  </Box>

                  {/* Month Calendar Header */}
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

                  {/* Single Unified Calendar Grid */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: 1,
                    }}
                  >
                    {(() => {
                      const startOfMonth = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        1
                      );
                      const endOfMonth = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() + 1,
                        0
                      );
                      const startDate = new Date(startOfMonth);
                      startDate.setDate(
                        startDate.getDate() - startOfMonth.getDay()
                      );

                      const days = [];
                      const current = new Date(startDate);

                      for (let i = 0; i < 42; i++) {
                        days.push(new Date(current));
                        current.setDate(current.getDate() + 1);
                      }

                      return days.map((day, dayIndex) => {
                        // Get all entries for this day across all projects
                        const dayEntries = timeEntries.filter((entry) => {
                          const entryDate = new Date(entry.date);
                          return (
                            entryDate.toDateString() === day.toDateString()
                          );
                        });

                        const isCurrentMonth =
                          day.getMonth() === currentDate.getMonth();
                        const isToday =
                          day.toDateString() === new Date().toDateString();

                        const totalMinutes = dayEntries.reduce(
                          (sum, entry) => sum + (entry.duration || 0),
                          0
                        );

                        // Count unique projects for this day
                        const uniqueProjects = new Set(
                          dayEntries.map((entry) => entry.project?._id)
                        ).size;

                        return (
                          <Box
                            key={dayIndex}
                            sx={{
                              minHeight: 80,
                              p: 1,
                              border: "1px solid #e0e0e0",
                              backgroundColor: isCurrentMonth
                                ? "white"
                                : "#f9f9f9",
                              position: "relative",
                              cursor:
                                dayEntries.length > 0 ? "pointer" : "default",
                            }}
                            onClick={() => {
                              if (dayEntries.length > 0) {
                                setSelectedDayForDetails(day);
                                setDayDetailsDialog(true);
                              }
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: isCurrentMonth
                                  ? isToday
                                    ? "primary.main"
                                    : "text.primary"
                                  : "text.disabled",
                                fontWeight: isToday ? "bold" : "normal",
                                mb: 1,
                              }}
                            >
                              {day.getDate()}
                            </Typography>

                            {dayEntries.length > 0 && (
                              <Box
                                sx={{
                                  backgroundColor: "#4caf50", // Green color for project-wise
                                  color: "white",
                                  borderRadius: 1,
                                  p: 0.5,
                                  textAlign: "center",
                                  fontSize: "0.75rem",
                                  fontWeight: "bold",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ display: "block", fontSize: "0.7rem" }}
                                >
                                  Total: {Math.floor(totalMinutes / 60)}:
                                  {String(totalMinutes % 60).padStart(2, "0")}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ display: "block", fontSize: "0.65rem" }}
                                >
                                  {uniqueProjects} project
                                  {uniqueProjects !== 1 ? "s" : ""} •{" "}
                                  {dayEntries.length} task
                                  {dayEntries.length !== 1 ? "s" : ""}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        );
                      });
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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 3,
                      minHeight: "60px",
                    }}
                  >
                    {/* Navigation Arrows around Title */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        onClick={() => handleDateChange("prev")}
                        size="small"
                        sx={{ backgroundColor: "#f5f5f5" }}
                      >
                        <ArrowBack />
                      </IconButton>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="primary"
                      >
                        Week of{" "}
                        {getWeekDays()[0]?.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        -{" "}
                        {getWeekDays()[6]?.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        - Project-wise
                      </Typography>
                      <IconButton
                        onClick={() => handleDateChange("next")}
                        size="small"
                        sx={{ backgroundColor: "#f5f5f5" }}
                      >
                        <ArrowForward />
                      </IconButton>
                    </Box>

                    {/* Date Picker and Today Button on the right */}
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
                      <Button
                        onClick={handleReturnToToday}
                        size="small"
                        variant="outlined"
                        sx={{
                          minWidth: "auto",
                          px: 1.5,
                          py: 0.5,
                          fontSize: "0.75rem",
                          borderColor: "#1976D2",
                          color: "#1976D2",
                          "&:hover": {
                            borderColor: "#1565C0",
                            backgroundColor: "#f3f9ff",
                          },
                        }}
                      >
                        Today
                      </Button>
                    </Box>
                  </Box>

                  {/* Week View - Project-wise Calendar Grid */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: 1,
                    }}
                  >
                    {getWeekDays().map((day, dayIndex) => {
                      const dayEntries = timeEntries.filter((entry) => {
                        const entryDate = new Date(entry.date);
                        return entryDate.toDateString() === day.toDateString();
                      });

                      const isToday =
                        day.toDateString() === new Date().toDateString();

                      // Group entries by project
                      const projectGroups = dayEntries.reduce((acc, entry) => {
                        const projId = entry.project?._id || "unknown";
                        if (!acc[projId]) {
                          acc[projId] = {
                            project: entry.project,
                            entries: [],
                          };
                        }
                        acc[projId].entries.push(entry);
                        return acc;
                      }, {} as any);

                      const totalMinutes = dayEntries.reduce(
                        (sum, entry) => sum + (entry.duration || 0),
                        0
                      );

                      return (
                        <Box
                          key={dayIndex}
                          sx={{
                            minHeight: 120,
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                            p: 1,
                            backgroundColor: "#fff",
                            cursor:
                              dayEntries.length > 0 ? "pointer" : "default",
                            "&:hover": {
                              backgroundColor:
                                dayEntries.length > 0 ? "#f8f9fa" : "#fff",
                            },
                          }}
                          onClick={() => {
                            if (dayEntries.length > 0) {
                              setSelectedDayForDetails(day);
                              setDayDetailsDialog(true);
                            }
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: "bold",
                              color: isToday ? "primary.main" : "text.primary",
                              mb: 1,
                            }}
                          >
                            {day.getDate()}
                          </Typography>

                          {dayEntries.length > 0 && (
                            <Box
                              sx={{
                                backgroundColor: "#4caf50",
                                color: "white",
                                borderRadius: 1,
                                p: 0.5,
                                textAlign: "center",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ display: "block", fontSize: "0.7rem" }}
                              >
                                {Math.floor(totalMinutes / 60)}:
                                {String(totalMinutes % 60).padStart(2, "0")}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ display: "block", fontSize: "0.65rem" }}
                              >
                                {Object.keys(projectGroups).length} project
                                {Object.keys(projectGroups).length !== 1
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

              {/* Day View */}
              {viewMode === "day" && (
                <Box>
                  {/* Day View Header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 3,
                      minHeight: "60px",
                    }}
                  >
                    {/* Navigation Arrows around Title */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        onClick={() => handleDateChange("prev")}
                        size="small"
                        sx={{ backgroundColor: "#f5f5f5" }}
                      >
                        <ArrowBack />
                      </IconButton>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="primary"
                      >
                        {currentDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        - Project-wise
                      </Typography>
                      <IconButton
                        onClick={() => handleDateChange("next")}
                        size="small"
                        sx={{ backgroundColor: "#f5f5f5" }}
                      >
                        <ArrowForward />
                      </IconButton>
                    </Box>

                    {/* Date Picker and Today Button on the right */}
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
                      <Button
                        onClick={handleReturnToToday}
                        size="small"
                        variant="outlined"
                        sx={{
                          minWidth: "auto",
                          px: 1.5,
                          py: 0.5,
                          fontSize: "0.75rem",
                          borderColor: "#1976D2",
                          color: "#1976D2",
                          "&:hover": {
                            borderColor: "#1565C0",
                            backgroundColor: "#f3f9ff",
                          },
                        }}
                      >
                        Today
                      </Button>
                    </Box>
                  </Box>

                  {/* Day View - Project-wise Grouping */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    {(() => {
                      const dayEntries = timeEntries.filter((entry) => {
                        const entryDate = new Date(entry.date);
                        return (
                          entryDate.toDateString() ===
                          currentDate.toDateString()
                        );
                      });

                      // Group entries by project
                      const projectGroups = dayEntries.reduce((acc, entry) => {
                        const projId = entry.project?._id || "unknown";
                        if (!acc[projId]) {
                          acc[projId] = {
                            project: entry.project,
                            entries: [],
                          };
                        }
                        acc[projId].entries.push(entry);
                        return acc;
                      }, {} as any);

                      return Object.values(projectGroups).map(
                        (group: any, groupIndex) => {
                          const colors = [
                            "#4caf50",
                            "#2196f3",
                            "#e91e63",
                            "#ff9800",
                            "#9c27b0",
                          ];
                          const color = colors[groupIndex % colors.length];
                          const totalMinutes = group.entries.reduce(
                            (sum: number, entry: any) =>
                              sum + (entry.duration || 0),
                            0
                          );

                          const isExpanded = expandedEmployees.has(
                            group.project?._id || ""
                          );

                          return (
                            <Card
                              key={group.project?._id || groupIndex}
                              sx={{ p: 2 }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  mb: 2,
                                }}
                              >
                                <Avatar
                                  sx={{
                                    backgroundColor: color,
                                    color: "white",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {group.project?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "P"}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" fontWeight="bold">
                                    {group.project?.name || "Unknown Project"}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {group.entries.length} tasks •{" "}
                                    {formatDuration(totalMinutes)} total
                                  </Typography>
                                </Box>
                                <Button
                                  onClick={() =>
                                    toggleExpandedEmployee(
                                      group.project?._id || ""
                                    )
                                  }
                                  sx={{
                                    minWidth: 32,
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    backgroundColor: "rgba(0,0,0,0.1)",
                                    color: "text.primary",
                                    "&:hover": {
                                      backgroundColor: "rgba(0,0,0,0.2)",
                                    },
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: "14px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {isExpanded ? "−" : "+"}
                                  </Typography>
                                </Button>
                              </Box>

                              {isExpanded && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                  }}
                                >
                                  {group.entries.map(
                                    (entry: any, entryIndex: number) => (
                                      <Box
                                        key={entryIndex}
                                        onClick={() => handleViewDetails(entry)}
                                        sx={{
                                          border: "1px solid #e0e0e0",
                                          borderRadius: 1,
                                          p: 2,
                                          backgroundColor: "#fff",
                                          cursor: "pointer",
                                          "&:hover": {
                                            backgroundColor: "#f8f9fa",
                                          },
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
                                              variant="body1"
                                              fontWeight="bold"
                                              sx={{ mb: 0.5 }}
                                            >
                                              {entry.description ||
                                                "No description"}
                                            </Typography>
                                            <Typography
                                              variant="body2"
                                              color="text.secondary"
                                              sx={{ mb: 1 }}
                                            >
                                              {entry.category || "General"}
                                            </Typography>
                                            <Box
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                              }}
                                            >
                                              <Chip
                                                label={
                                                  entry.category || "General"
                                                }
                                                size="small"
                                                sx={{
                                                  backgroundColor: color,
                                                  color: "white",
                                                  fontWeight: "bold",
                                                }}
                                              />
                                            </Box>
                                          </Box>
                                          <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color={color}
                                          >
                                            {formatDuration(
                                              entry.duration || 0
                                            )}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    )
                                  )}
                                </Box>
                              )}
                            </Card>
                          );
                        }
                      );
                    })()}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Add/Edit Entry Dialog */}
          <Dialog
            open={addEntryDialog || editEntryDialog}
            onClose={() => {
              setAddEntryDialog(false);
              setEditEntryDialog(false);
            }}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              {selectedEntry ? "Edit Time Entry" : "Add New Time Entry"}
            </DialogTitle>
            <DialogContent>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
              >
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
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                />

                <TextField
                  label="Duration (minutes)"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
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
            maxWidth="md"
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
                      Employee
                    </Typography>
                    <Typography variant="body1">
                      {selectedEntry.employee?.username || "Unknown Employee"}
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
                      {formatDuration(selectedEntry.duration || 0)}
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
            </DialogActions>
          </Dialog>

          {/* Day Details Dialog */}
          <Dialog
            open={dayDetailsDialog}
            onClose={() => setDayDetailsDialog(false)}
            maxWidth="lg"
            fullWidth
            PaperProps={{
              sx: {
                height: "80vh",
                maxHeight: "80vh",
              },
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  Daily Summary -{" "}
                  {selectedDayForDetails?.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ px: 3, py: 2 }}>
              {renderDayDetailsContent()}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDayDetailsDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
    </PageContainer>
  );
};

export default AdminTimeTracker;
