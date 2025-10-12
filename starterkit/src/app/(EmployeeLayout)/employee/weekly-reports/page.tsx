"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Avatar,
  Stack,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  CalendarToday,
  TrendingUp,
  Work,
  People,
  AccessTime,
  Assessment,
  ArrowBack,
  ArrowForward,
  FilterList,
  Download,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import axios from '@/utils/axios';

interface WeeklyData {
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  totalReports: number;
  dailyBreakdown: {
    [key: string]: {
      date: string;
      dayName: string;
      hours: number;
      reports: number;
      projects: string[];
    };
  };
  projectBreakdown: {
    [key: string]: {
      project: {
        _id: string;
        name: string;
        description: string;
      };
      hours: number;
      reports: number;
      employees: string[];
    };
  };
  employeeBreakdown: {
    [key: string]: {
      employee: {
        _id: string;
        username: string;
      };
      hours: number;
      reports: number;
      projects: string[];
    };
  };
}

const WeeklyReports = () => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState(0);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    fetchWeeklyData();
  }, [currentWeek]);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const weekStart = getWeekStart(currentWeek);
      const weekEnd = getWeekEnd(currentWeek);
      
      const response = await axios.get('/reports/weekly', {
        params: {
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString(),
        },
      });
      
      setWeeklyData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch weekly data');
    } finally {
      setLoading(false);
    }
  };

  const getWeekStart = (date: Date) => {
    const dayOfWeek = date.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const getWeekEnd = (date: Date) => {
    const weekStart = getWeekStart(date);
    const sunday = new Date(weekStart);
    sunday.setDate(weekStart.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return sunday;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatWeekRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const getDayColor = (hours: number) => {
    if (hours >= 8) return 'success';
    if (hours >= 4) return 'warning';
    return 'error';
  };

  const handleViewProject = (projectId: string) => {
    const project = Object.values(weeklyData?.projectBreakdown || {}).find(
      p => p.project._id === projectId
    );
    setSelectedProject(project);
    setViewDialog(true);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading weekly reports...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
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
      </Box>
    );
  }

  if (!weeklyData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No weekly data available</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Weekly Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {formatWeekRange(weeklyData.weekStart, weeklyData.weekEnd)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigateWeek('prev')}>
            <ArrowBack />
          </IconButton>
          <Button
            variant="outlined"
            onClick={() => setCurrentWeek(new Date())}
            sx={{ minWidth: 120 }}
          >
            This Week
          </Button>
          <IconButton onClick={() => navigateWeek('next')}>
            <ArrowForward />
          </IconButton>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTime color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Hours</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {weeklyData.totalHours}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Reports</Typography>
              </Box>
              <Typography variant="h4" color="secondary">
                {weeklyData.totalReports}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Submitted
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Work color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Projects</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {Object.keys(weeklyData.projectBreakdown).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Avg Hours/Day</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {(weeklyData.totalHours / 7).toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Daily average
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Daily Breakdown" />
            <Tab label="Project Summary" />
            <Tab label="Team Overview" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Daily Breakdown Tab */}
          {selectedTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Daily Work Summary
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(weeklyData.dailyBreakdown).map(([date, dayData]) => (
                  <Grid item xs={12} sm={6} md={4} key={date}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {dayData.dayName}
                          </Typography>
                          <Chip
                            label={`${dayData.hours}h`}
                            color={getDayColor(dayData.hours)}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {formatDate(dayData.date)}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption">
                            {dayData.reports} reports
                          </Typography>
                          <Typography variant="caption">
                            {dayData.projects.length} projects
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Project Summary Tab */}
          {selectedTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Project Summary
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Project</TableCell>
                      <TableCell align="right">Hours</TableCell>
                      <TableCell align="right">Reports</TableCell>
                      <TableCell align="right">Team Size</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(weeklyData.projectBreakdown).map(([projectId, projectData]) => (
                      <TableRow key={projectId}>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">
                              {projectData.project.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {projectData.project.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {projectData.hours}h
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {projectData.reports}
                        </TableCell>
                        <TableCell align="right">
                          {projectData.employees.length}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleViewProject(projectId)}
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Team Overview Tab */}
          {selectedTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Team Overview
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(weeklyData.employeeBreakdown).map(([employeeId, employeeData]) => (
                  <Grid item xs={12} sm={6} md={4} key={employeeId}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {employeeData.employee.username.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {employeeData.employee.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Employee
                            </Typography>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Hours:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {employeeData.hours}h
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Reports:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {employeeData.reports}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Projects:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {employeeData.projects.length}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Project Details Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Project Details
        </DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedProject.project.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedProject.project.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Hours
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {selectedProject.hours}h
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Reports Submitted
                  </Typography>
                  <Typography variant="h6" color="secondary">
                    {selectedProject.reports}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Team Members
                  </Typography>
                  <Typography variant="body2">
                    {selectedProject.employees.length} member(s) working on this project
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WeeklyReports;



