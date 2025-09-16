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
  CircularProgress,
  Alert,
  IconButton,
  Avatar,
  Fab
} from "@mui/material";
import { Add, ArrowBack, ArrowForward, Visibility } from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/utils/axios";

interface TimeEntry {
  _id: string;
  project: { _id: string; name: string };
  category: string;
  description: string;
  duration: number; // in minutes
  date: string;
  startTime?: string;
  endTime?: string;
}

interface Project {
  _id: string;
  name: string;
}

const EmployeeTimeTracker = () => {
  const { user } = useAuth(); // Logged-in employee
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [filterProject, setFilterProject] = useState("");

  useEffect(() => {
    fetchData();
  }, [currentDate, viewMode, filterProject]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch projects (once)
      if (projects.length === 0) {
        const projectsRes = await axios.get("/projects");
        setProjects(projectsRes.data);
      }

      // Fetch employee's own time entries
      const { startDate, endDate } = getDateRange(currentDate, viewMode);
      const res = await axios.get("/reports", {
        params: {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          employee: user._id,
          project: filterProject || undefined,
        },
      });

      setTimeEntries(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (date: Date, mode: string) => {
    const targetDate = new Date(date);
    switch (mode) {
      case "day":
        return { startDate: targetDate, endDate: targetDate };
      case "week":
        const weekStart = new Date(targetDate);
        const dayOfWeek = targetDate.getDay();
        weekStart.setDate(targetDate.getDate() - dayOfWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return { startDate: weekStart, endDate: weekEnd };
      case "month":
        const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        return { startDate: monthStart, endDate: monthEnd };
      default:
        return { startDate: targetDate, endDate: targetDate };
    }
  };

  const handleDateChange = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1));
    else if (viewMode === "week") newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    else newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${String(m).padStart(2, "0")}`;
  };

  const handleViewDetails = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setDetailsDialog(true);
  };

  if (loading) return <CircularProgress sx={{ display: "block", mx: "auto", mt: 10 }} />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        My Time Tracker
      </Typography>

      {/* Navigation & Filters */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => handleDateChange("prev")}>
          <ArrowBack />
        </IconButton>
        <IconButton onClick={() => handleDateChange("next")}>
          <ArrowForward />
        </IconButton>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Project</InputLabel>
          <Select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} label="Project">
            <MenuItem value="">All Projects</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project._id} value={project._id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, mode) => mode && setViewMode(mode)}
          sx={{ ml: "auto" }}
        >
          <ToggleButton value="month">Month</ToggleButton>
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="day">Day</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Day View */}
      {viewMode === "day" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {timeEntries.filter(entry => new Date(entry.date).toDateString() === currentDate.toDateString())
            .map(entry => (
              <Card key={entry._id} sx={{ p: 2, cursor: "pointer" }} onClick={() => handleViewDetails(entry)}>
                <Typography variant="h6">{entry.project.name}</Typography>
                <Typography variant="body2">{entry.description}</Typography>
                <Typography variant="subtitle2">{formatDuration(entry.duration)}</Typography>
              </Card>
          ))}
        </Box>
      )}

      {/* Week & Month views can follow the same pattern as your Admin version */}

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          {selectedEntry && (
            <>
              <Typography variant="h6">{selectedEntry.project.name}</Typography>
              <Chip label={selectedEntry.category || "General"} />
              <Typography sx={{ mt: 1 }}>{selectedEntry.description}</Typography>
              <Typography sx={{ mt: 1 }}>Date: {new Date(selectedEntry.date).toLocaleDateString()}</Typography>
              <Typography sx={{ mt: 1 }}>Duration: {formatDuration(selectedEntry.duration)}</Typography>
            </>
          )}
          <Button sx={{ mt: 2 }} onClick={() => setDetailsDialog(false)}>
            Close
          </Button>
        </Box>
      </Dialog>

      {/* Floating Action Button */}
      <Fab color="primary" sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <Add />
      </Fab>

      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
};

export default EmployeeTimeTracker;
