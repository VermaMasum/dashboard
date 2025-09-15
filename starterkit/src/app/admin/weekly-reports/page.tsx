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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
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
  Person,
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

interface Employee {
  _id: string;
  username: string;
  role: string;
}

const AdminWeeklyReports = () => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState(0);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [filterByEmployee, setFilterByEmployee] = useState(false);
  const [fromDate, setFromDate] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(today.getDate() + mondayOffset);
    return monday.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(today.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return sunday.toISOString().split("T")[0];
  });
  const [showCurrentWeekOnly, setShowCurrentWeekOnly] = useState(true);

  useEffect(() => {
    fetchEmployees();
    fetchProjects();
    fetchWeeklyData();
  }, [currentWeek, selectedEmployee, selectedProjectId, fromDate, toDate]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/users/all');
      const employeeUsers = response.data.filter((user: any) => user.role === 'employee');
      setEmployees(employeeUsers);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/projects');
      setProjects(response.data);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all reports from the same endpoint as daily reports
      const response = await axios.get('/reports');
      const allReports = response.data;
      
      console.log('📊 Admin Weekly - All reports fetched:', allReports.length);
      
      let weekStart, weekEnd;
      
      // Use date range if provided, otherwise use currentWeek
      if (fromDate && toDate) {
        weekStart = new Date(fromDate);
        weekEnd = new Date(toDate);
        weekEnd.setHours(23, 59, 59, 999); // Include the entire end date
        setShowCurrentWeekOnly(false);
      } else {
        weekStart = getWeekStart(currentWeek);
        weekEnd = getWeekEnd(currentWeek);
        setShowCurrentWeekOnly(true);
      }
      
      console.log('📊 Admin Weekly - Date range:', {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        weekStartLocal: weekStart.toLocaleDateString(),
        weekEndLocal: weekEnd.toLocaleDateString()
      });
      
      // Filter reports by date range
      let filteredReports = allReports.filter((report: any) => {
        const reportDate = new Date(report.date);
        return reportDate >= weekStart && reportDate <= weekEnd;
      });
      
      // Filter by project if selected
      if (selectedProjectId) {
        filteredReports = filteredReports.filter((report: any) => 
          report.project._id === selectedProjectId
        );
      }
      
      // Filter by employee if selected
      if (filterByEmployee && selectedEmployee) {
        filteredReports = filteredReports.filter((report: any) => 
          report.employee._id === selectedEmployee
        );
      }
      
      console.log('📊 Admin Weekly - Filtered reports:', filteredReports.length);
      
      // Process the filtered reports into weekly data format
      const weeklyData = processReportsToWeeklyData(filteredReports, weekStart, weekEnd);
      setWeeklyData(weeklyData);
    } catch (err: any) {
      console.error('❌ Error fetching weekly data:', err);
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

  const processReportsToWeeklyData = (reports: any[], weekStart: Date, weekEnd: Date) => {
    // Initialize weekly data structure
    const weeklyData = {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      totalHours: 0,
      totalReports: reports.length,
      dailyBreakdown: {} as any,
      projectBreakdown: {} as any,
      employeeBreakdown: {} as any
    };

    // Initialize daily breakdown
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      const dayKey = day.toISOString().split('T')[0];
      weeklyData.dailyBreakdown[dayKey] = {
        date: day.toISOString(),
        dayName: day.toLocaleDateString('en-US', { weekday: 'long' }),
        hours: 0,
        reports: 0,
        projects: []
      };
    }

    // Process each report
    reports.forEach(report => {
      const reportDate = new Date(report.date);
      const dayKey = reportDate.toISOString().split('T')[0];
      const projectId = report.project._id.toString();
      const employeeId = report.employee._id.toString();
      
      // Update totals
      weeklyData.totalHours += report.hoursWorked;
      
      // Update daily breakdown
      if (weeklyData.dailyBreakdown[dayKey]) {
        weeklyData.dailyBreakdown[dayKey].hours += report.hoursWorked;
        weeklyData.dailyBreakdown[dayKey].reports += 1;
        if (!weeklyData.dailyBreakdown[dayKey].projects.includes(projectId)) {
          weeklyData.dailyBreakdown[dayKey].projects.push(projectId);
        }
      }
      
      // Update project breakdown
      if (!weeklyData.projectBreakdown[projectId]) {
        weeklyData.projectBreakdown[projectId] = {
          project: report.project,
          hours: 0,
          reports: 0,
          employees: []
        };
      }
      weeklyData.projectBreakdown[projectId].hours += report.hoursWorked;
      weeklyData.projectBreakdown[projectId].reports += 1;
      if (!weeklyData.projectBreakdown[projectId].employees.includes(employeeId)) {
        weeklyData.projectBreakdown[projectId].employees.push(employeeId);
      }
      
      // Update employee breakdown
      if (!weeklyData.employeeBreakdown[employeeId]) {
        weeklyData.employeeBreakdown[employeeId] = {
          employee: report.employee,
          hours: 0,
          reports: 0,
          projects: []
        };
      }
      weeklyData.employeeBreakdown[employeeId].hours += report.hoursWorked;
      weeklyData.employeeBreakdown[employeeId].reports += 1;
      if (!weeklyData.employeeBreakdown[employeeId].projects.includes(projectId)) {
        weeklyData.employeeBreakdown[employeeId].projects.push(projectId);
      }
    });

    return weeklyData;
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

  const handleEmployeeFilterChange = (event: any, newValue: Employee | null) => {
    setSelectedEmployee(newValue?._id || '');
    setFilterByEmployee(!!newValue);
  };

  const clearFilters = () => {
    setSelectedEmployee('');
    setFilterByEmployee(false);
    setSelectedProjectId('');
    // Reset to current week
    const today = new Date();
    const monday = new Date(today);
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(today.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    setFromDate(monday.toISOString().split("T")[0]);
    setToDate(sunday.toISOString().split("T")[0]);
    setCurrentWeek(new Date());
    setShowCurrentWeekOnly(true);
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
        <Alert severity="error">{error}</Alert>
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
            Weekly Reports - Admin View
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {formatWeekRange(weeklyData.weekStart, weeklyData.weekEnd)}
            {showCurrentWeekOnly && (
              <Chip 
                label="Current Week"
                color="success"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
            {(fromDate && toDate) && (
              <Chip 
                label="Custom Date Range"
                color="secondary"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
            {filterByEmployee && selectedEmployee && (
              <Chip 
                label={`Filtered by: ${employees.find(e => e._id === selectedEmployee)?.username}`}
                onDelete={clearFilters}
                color="primary"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigateWeek('prev')} title="Previous Week">
            <ArrowBack />
          </IconButton>
          <Button
            variant="outlined"
            onClick={() => setCurrentWeek(new Date())}
            sx={{ minWidth: 120 }}
          >
            This Week
          </Button>
          <IconButton onClick={() => navigateWeek('next')} title="Next Week">
            <ArrowForward />
          </IconButton>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                type="date"
                label="From Date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                type="date"
                label="To Date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Project</InputLabel>
                <Select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
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
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => option.username}
                value={employees.find(e => e._id === selectedEmployee) || null}
                onChange={handleEmployeeFilterChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filter by Employee"
                    placeholder="Select employee"
                    variant="outlined"
                    size="small"
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Avatar sx={{ mr: 2, width: 24, height: 24 }}>
                      {option.username.charAt(0).toUpperCase()}
                    </Avatar>
                    {option.username}
                  </Box>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<FilterList />}
                disabled={!filterByEmployee && !selectedProjectId && !fromDate && !toDate}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Week Navigation Cards */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Week Navigation
          </Typography>
          <Grid container spacing={2}>
            {[-2, -1, 0, 1, 2].map((weekOffset) => {
              const weekDate = new Date(currentWeek);
              weekDate.setDate(currentWeek.getDate() + (weekOffset * 7));
              const weekStart = getWeekStart(weekDate);
              const weekEnd = getWeekEnd(weekDate);
              const isCurrentWeek = weekOffset === 0;
              
              return (
                <Grid item xs={12} sm={6} md={2.4} key={weekOffset}>
                  <Card 
                    variant={isCurrentWeek ? "elevation" : "outlined"}
                    sx={{ 
                      cursor: 'pointer',
                      border: isCurrentWeek ? 2 : 1,
                      borderColor: isCurrentWeek ? 'primary.main' : 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover'
                      }
                    }}
                    onClick={() => setCurrentWeek(weekDate)}
                  >
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" fontWeight={isCurrentWeek ? 'bold' : 'normal'}>
                        {weekOffset === 0 ? 'Current' : 
                         weekOffset === -1 ? 'Last Week' :
                         weekOffset === 1 ? 'Next Week' :
                         `${weekOffset > 0 ? '+' : ''}${weekOffset} Week${Math.abs(weekOffset) > 1 ? 's' : ''}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(weekStart.toISOString())} - {formatDate(weekEnd.toISOString())}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>


      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Daily Breakdown" />
            <Tab label="Project Summary" />
            <Tab label="Team Overview" />
            <Tab label="Employee Performance" />
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

          {/* Employee Performance Tab */}
          {selectedTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Employee Performance Analysis
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell align="right">Total Hours</TableCell>
                      <TableCell align="right">Reports</TableCell>
                      <TableCell align="right">Projects</TableCell>
                      <TableCell align="right">Avg Hours/Day</TableCell>
                      <TableCell align="center">Performance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(weeklyData.employeeBreakdown)
                      .sort(([,a], [,b]) => b.hours - a.hours)
                      .map(([employeeId, employeeData]) => {
                        const avgHoursPerDay = (employeeData.hours / 7).toFixed(1);
                        const performance = employeeData.hours >= 40 ? 'Excellent' : 
                                          employeeData.hours >= 30 ? 'Good' : 
                                          employeeData.hours >= 20 ? 'Average' : 'Below Average';
                        const performanceColor = employeeData.hours >= 40 ? 'success' : 
                                                employeeData.hours >= 30 ? 'primary' : 
                                                employeeData.hours >= 20 ? 'warning' : 'error';
                        
                        return (
                          <TableRow key={employeeId}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                                  {employeeData.employee.username.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="subtitle2">
                                  {employeeData.employee.username}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold">
                                {employeeData.hours}h
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {employeeData.reports}
                            </TableCell>
                            <TableCell align="right">
                              {employeeData.projects.length}
                            </TableCell>
                            <TableCell align="right">
                              {avgHoursPerDay}h
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={performance} 
                                color={performanceColor}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
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

export default AdminWeeklyReports;
