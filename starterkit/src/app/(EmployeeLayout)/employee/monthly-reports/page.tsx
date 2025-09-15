"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
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
  Download,
  Visibility,
  Person,
  DateRange,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import axios from '@/utils/axios';

interface MonthlyData {
  monthStart: string;
  monthEnd: string;
  totalHours: number;
  totalReports: number;
  weeklyBreakdown: {
    [key: string]: {
      weekStart: string;
      weekEnd: string;
      weekNumber: number;
      hours: number;
      reports: number;
      projects: string[];
      employees: string[];
    };
  };
  dailyBreakdown: {
    [key: string]: {
      date: string;
      dayName: string;
      dayNumber: number;
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

const EmployeeMonthlyReports = () => {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState(0);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    fetchMonthlyData();
  }, [currentMonth]);

  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      
      const response = await axios.get('/reports/monthly', {
        params: {
          month: month,
          year: year,
        }
      });
      setMonthlyData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch monthly data');
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatMonthRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  };

  const getDayColor = (hours: number) => {
    if (hours >= 8) return 'success';
    if (hours >= 4) return 'warning';
    return 'error';
  };

  const getWeekColor = (hours: number) => {
    if (hours >= 40) return 'success';
    if (hours >= 30) return 'primary';
    if (hours >= 20) return 'warning';
    return 'error';
  };

  const handleViewProject = (projectId: string) => {
    const project = Object.values(monthlyData?.projectBreakdown || {}).find(
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
          Loading monthly reports...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!monthlyData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No monthly data available</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            My Monthly Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {formatMonthRange(monthlyData.monthStart, monthlyData.monthEnd)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigateMonth('prev')} title="Previous Month">
            <ArrowBack />
          </IconButton>
          <Button
            variant="outlined"
            onClick={() => setCurrentMonth(new Date())}
            sx={{ minWidth: 120 }}
          >
            This Month
          </Button>
          <IconButton onClick={() => navigateMonth('next')} title="Next Month">
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
                {monthlyData.totalHours}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This month
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
                {monthlyData.totalReports}
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
                {Object.keys(monthlyData.projectBreakdown).length}
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
                <Typography variant="h6">Avg/Day</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {(monthlyData.totalHours / 30).toFixed(1)}h
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
            <Tab label="Weekly Breakdown" />
            <Tab label="Daily Calendar" />
            <Tab label="Project Summary" />
            <Tab label="Performance" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Weekly Breakdown Tab */}
          {selectedTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Weekly Breakdown
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(monthlyData.weeklyBreakdown).map(([weekKey, weekData]) => (
                  <Grid item xs={12} sm={6} md={4} key={weekKey}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Week {weekData.weekNumber}
                          </Typography>
                          <Chip
                            label={`${weekData.hours}h`}
                            color={getWeekColor(weekData.hours)}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {formatDate(weekData.weekStart)} - {formatDate(weekData.weekEnd)}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption">
                            {weekData.reports} reports
                          </Typography>
                          <Typography variant="caption">
                            {weekData.projects.length} projects
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Daily Calendar Tab */}
          {selectedTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Daily Calendar View
              </Typography>
              <Grid container spacing={1}>
                {Object.entries(monthlyData.dailyBreakdown).map(([date, dayData]) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={date}>
                    <Card variant="outlined" sx={{ minHeight: 120 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {dayData.dayNumber}
                          </Typography>
                          <Chip
                            label={`${dayData.hours}h`}
                            color={getDayColor(dayData.hours)}
                            size="small"
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          {dayData.dayName}
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
          {selectedTab === 2 && (
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
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(monthlyData.projectBreakdown).map(([projectId, projectData]) => (
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

          {/* Performance Tab */}
          {selectedTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Your Performance This Month
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Work Pattern
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Total Hours:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {monthlyData.totalHours}h
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Daily Average:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {(monthlyData.totalHours / 30).toFixed(1)}h
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Reports Submitted:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {monthlyData.totalReports}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Active Projects:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {Object.keys(monthlyData.projectBreakdown).length}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Performance Rating
                      </Typography>
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        {monthlyData.totalHours >= 160 ? (
                          <Chip label="Excellent" color="success" size="large" />
                        ) : monthlyData.totalHours >= 120 ? (
                          <Chip label="Good" color="primary" size="large" />
                        ) : monthlyData.totalHours >= 80 ? (
                          <Chip label="Average" color="warning" size="large" />
                        ) : (
                          <Chip label="Below Average" color="error" size="large" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        Based on monthly hours worked
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
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

export default EmployeeMonthlyReports;
