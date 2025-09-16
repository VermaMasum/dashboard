"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Typography,
  Grid,
  Paper,
  IconButton,
  Grid2,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import axios from "axios";

// Types
interface Report {
  id: string;
  projectName: string;
  hours: number;
  date: string;
}

type ViewType = "day" | "week" | "month";

// Types
interface Report {
  id: string;
  projectName: string;
  hours: number;
  date: string;
}

interface Employee {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

interface TimeTrackerProps {
  userId: string;
  token: string;
  view?: ViewType;
  selectedDate?: Date;
  onViewChange?: (view: ViewType) => void;
  onDateChange?: (date: Date) => void;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({
  userId,
  token,
  view: controlledView,
  selectedDate: controlledDate,
  onViewChange,
  onDateChange,
}) => {
  const [view, setView] = useState<ViewType>(controlledView || "day");
  const [selectedDate, setSelectedDate] = useState<Date>(
    controlledDate || new Date()
  );
  const [reports, setReports] = useState<Report[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");

  // Sync controlled props
  useEffect(() => {
    if (controlledView) setView(controlledView);
  }, [controlledView]);

  useEffect(() => {
    if (controlledDate) setSelectedDate(controlledDate);
  }, [controlledDate]);

  // Fetch employees and projects on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get("/api/employees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(res.data);
      } catch (error) {
        console.error("Failed to fetch employees", error);
      }
    };
    const fetchProjects = async () => {
      try {
        const res = await axios.get("/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(res.data);
      } catch (error) {
        console.error("Failed to fetch projects", error);
      }
    };
    fetchEmployees();
    fetchProjects();
  }, [token]);

  // Fetch reports whenever view, selectedDate, selectedEmployee, or selectedProject changes
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const params: any = {
          userId,
          date: selectedDate.toISOString(),
          view,
        };
        if (selectedEmployee) params.employeeId = selectedEmployee;
        if (selectedProject) params.projectId = selectedProject;

        const res = await axios.get("/api/reports", {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        setReports(res.data);
      } catch (error) {
        console.error("Failed to fetch reports", error);
      }
    };
    fetchReports();
  }, [userId, token, view, selectedDate, selectedEmployee, selectedProject]);

  // Generate days to display based on view
  const generateDays = () => {
    const days: Date[] = [];
    const today = new Date(selectedDate);

    if (view === "day") {
      days.push(today);
    }

    if (view === "week") {
      // Start from Monday
      const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
      const start = new Date(today);
      start.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Monday
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push(d);
      }
    }

    if (view === "month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      for (let i = 1; i <= end.getDate(); i++) {
        const d = new Date(today.getFullYear(), today.getMonth(), i);
        days.push(d);
      }
    }

    return days;
  };

  const handleDayClick = (day: Date) => {
    if (onDateChange) {
      onDateChange(day);
    } else {
      setSelectedDate(day);
    }
  };

  const handleViewChange = (newView: ViewType) => {
    if (onViewChange) {
      onViewChange(newView);
    } else {
      setView(newView);
    }
  };

  const handlePrev = () => {
    const newDate = new Date(selectedDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    handleDayClick(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    handleDayClick(newDate);
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Time Tracker
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Employee</InputLabel>
          <Select
            value={selectedEmployee}
            label="Employee"
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>
                {emp.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Project</InputLabel>
          <Select
            value={selectedProject}
            label="Project"
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {projects.map((proj) => (
              <MenuItem key={proj.id} value={proj.id}>
                {proj.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* View toggle buttons */}
      <ButtonGroup variant="contained" sx={{ mb: 2 }}>
        {(["day", "week", "month"] as ViewType[]).map((v) => (
          <Button
            key={v}
            onClick={() => handleViewChange(v)}
            color={view === v ? "primary" : "inherit"}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </Button>
        ))}
      </ButtonGroup>

      {/* Navigation arrows */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={handlePrev}>
          <ChevronLeft />
        </IconButton>
        <Typography sx={{ flexGrow: 1, textAlign: "center" }}>
          {view === "day" && selectedDate.toDateString()}
          {view === "week" &&
            `${generateDays()[0].toDateString()} - ${generateDays()[
              generateDays().length - 1
            ].toDateString()}`}
          {view === "month" &&
            selectedDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
        </Typography>
        <IconButton onClick={handleNext}>
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Day / Week / Month selection */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
        {generateDays().map((day) => {
          const isSelected = day.toDateString() === selectedDate.toDateString();
          return (
            <Button
              key={day.toISOString()}
              variant={isSelected ? "contained" : "outlined"}
              onClick={() => handleDayClick(day)}
            >
              {view === "month"
                ? day.getDate()
                : day.toLocaleDateString("en-US", { weekday: "short" })}
            </Button>
          );
        })}
      </Box>

      {/* Reports grid */}
      <Grid container spacing={2}>
        {reports.length === 0 && (
          <Typography sx={{ p: 2 }}>
            No reports found for this period
          </Typography>
        )}
        {reports.map((r) => (
          <Grid item xs={12} sm={6} md={4} key={r.id}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">{r.projectName}</Typography>
              <Typography variant="body2">
                Date: {new Date(r.date).toLocaleDateString()}
              </Typography>
              <Typography variant="h6">Hours: {r.hours}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TimeTracker;

const TimeTracker: React.FC<TimeTrackerProps> = ({
  userId,
  token,
  view: controlledView,
  selectedDate: controlledDate,
  onViewChange,
  onDateChange,
}) => {
  const [view, setView] = useState<ViewType>(controlledView || "day");
  const [selectedDate, setSelectedDate] = useState<Date>(
    controlledDate || new Date()
  );
  const [reports, setReports] = useState<Report[]>([]);

  // Sync controlled props
  useEffect(() => {
    if (controlledView) setView(controlledView);
  }, [controlledView]);

  useEffect(() => {
    if (controlledDate) setSelectedDate(controlledDate);
  }, [controlledDate]);

  // Fetch reports whenever view or selectedDate changes
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("/api/reports", {
          headers: { Authorization: `Bearer ${token}` },
          params: { userId, date: selectedDate.toISOString(), view },
        });
        setReports(res.data);
      } catch (error) {
        console.error("Failed to fetch reports", error);
      }
    };
    fetchReports();
  }, [userId, token, view, selectedDate]);

  // Generate days to display based on view
  const generateDays = () => {
    const days: Date[] = [];
    const today = new Date(selectedDate);

    if (view === "day") {
      days.push(today);
    }

    if (view === "week") {
      // Start from Monday
      const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
      const start = new Date(today);
      start.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Monday
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push(d);
      }
    }

    if (view === "month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      for (let i = 1; i <= end.getDate(); i++) {
        const d = new Date(today.getFullYear(), today.getMonth(), i);
        days.push(d);
      }
    }

    return days;
  };

  const handleDayClick = (day: Date) => {
    if (onDateChange) {
      onDateChange(day);
    } else {
      setSelectedDate(day);
    }
  };

  const handleViewChange = (newView: ViewType) => {
    if (onViewChange) {
      onViewChange(newView);
    } else {
      setView(newView);
    }
  };

  const handlePrev = () => {
    const newDate = new Date(selectedDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    handleDayClick(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    handleDayClick(newDate);
  };

  const days = generateDays();

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Time Tracker
      </Typography>

      {/* View toggle buttons */}
      <ButtonGroup variant="contained" sx={{ mb: 2 }}>
        {(["day", "week", "month"] as ViewType[]).map((v) => (
          <Button
            key={v}
            onClick={() => handleViewChange(v)}
            color={view === v ? "primary" : "inherit"}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </Button>
        ))}
      </ButtonGroup>

      {/* Navigation arrows */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={handlePrev}>
          <ChevronLeft />
        </IconButton>
        <Typography sx={{ flexGrow: 1, textAlign: "center" }}>
          {view === "day" && selectedDate.toDateString()}
          {view === "week" &&
            `${days[0].toDateString()} - ${days[
              days.length - 1
            ].toDateString()}`}
          {view === "month" &&
            selectedDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
        </Typography>
        <IconButton onClick={handleNext}>
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Day / Week / Month selection */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
        {days.map((day) => {
          const isSelected = day.toDateString() === selectedDate.toDateString();
          return (
            <Button
              key={day.toISOString()}
              variant={isSelected ? "contained" : "outlined"}
              onClick={() => handleDayClick(day)}
            >
              {view === "month"
                ? day.getDate()
                : day.toLocaleDateString("en-US", { weekday: "short" })}
            </Button>
          );
        })}
      </Box>

      {/* Reports grid */}
      <Grid2 container spacing={2}>
        {reports.length === 0 && (
          <Typography sx={{ p: 2 }}>
            No reports found for this period
          </Typography>
        )}
        {reports.map((r) => (
          <Grid2 item xs={12} sm={6} md={4} key={r.id}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">{r.projectName}</Typography>
              <Typography variant="body2">
                Date: {new Date(r.date).toLocaleDateString()}
              </Typography>
              <Typography variant="h6">Hours: {r.hours}</Typography>
            </Paper>
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
};

export default TimeTracker;
