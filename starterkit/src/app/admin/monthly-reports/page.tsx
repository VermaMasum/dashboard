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

interface Employee {
  _id: string;
  username: string;
  role: string;
}

const AdminMonthlyReports = () => {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState(0);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [filterByEmployee, setFilterByEmployee] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showCurrentMonthOnly, setShowCurrentMonthOnly] = useState(true);

  useEffect(() => {
    fetchEmployees();
    fetchProjects();
    fetchMonthlyData();
  }, [currentMonth, selectedEmployee, selectedProjectId, selectedMonth]);

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

  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all reports from the same endpoint as daily reports
      const response = await axios.get('/reports');
      const allReports = response.data;
      
      console.log('📊 Admin Monthly - All reports fetched:', allReports.length);
      
      let month, year;
      
      // Use selectedMonth if provided, otherwise use currentMonth
      if (selectedMonth) {
        const monthDate = new Date(selectedMonth + '-01');
        month = monthDate.getMonth() + 1;
        year = monthDate.getFullYear();
        setShowCurrentMonthOnly(false);
      } else {
        month = currentMonth.getMonth() + 1;
        year = currentMonth.getFullYear();
        setShowCurrentMonthOnly(true);
      }
      
      // Calculate month start and end dates
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
      
      console.log('📊 Admin Monthly - Date range:', {
        monthStart: monthStart.toISOString(),
        monthEnd: monthEnd.toISOString(),
        monthStartLocal: monthStart.toLocaleDateString(),
        monthEndLocal: monthEnd.toLocaleDateString()
      });
      
      // Filter reports by date range
      let filteredReports = allReports.filter((report: any) => {
        const reportDate = new Date(report.date);
        return reportDate >= monthStart && reportDate <= monthEnd;
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
      
      console.log('📊 Admin Monthly - Filtered reports:', filteredReports.length);
      
      // Process the filtered reports into monthly data format
      const monthlyData = processReportsToMonthlyData(filteredReports, monthStart, monthEnd);
      setMonthlyData(monthlyData);
    } catch (err: any) {
      console.error('❌ Error fetching monthly data:', err);
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

  const processReportsToMonthlyData = (reports: any[], monthStart: Date, monthEnd: Date) => {
    // Initialize monthly data structure
    const monthlyData = {
      monthStart: monthStart.toISOString(),
      monthEnd: monthEnd.toISOString(),
      totalHours: 0,
      totalReports: reports.length,
      weeklyBreakdown: {} as any,
      dailyBreakdown: {} as any,
      projectBreakdown: {} as any,
      employeeBreakdown: {} as any
    };

    // Initialize weekly breakdown (4-5 weeks per month)
    const currentDate = new Date(monthStart);
    let weekNumber = 1;
    
    while (currentDate <= monthEnd) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(currentDate.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekKey = `week${weekNumber}`;
      monthlyData.weeklyBreakdown[weekKey] = {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        weekNumber: weekNumber,
        hours: 0,
        reports: 0,
        projects: [],
        employees: []
      };
      
      currentDate.setDate(currentDate.getDate() + 7);
      weekNumber++;
    }

    // Initialize daily breakdown
    const daysInMonth = monthEnd.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
      const dayKey = dayDate.toISOString().split('T')[0];
      monthlyData.dailyBreakdown[dayKey] = {
        date: dayDate.toISOString(),
        dayName: dayDate.toLocaleDateString('en-US', { weekday: 'long' }),
        dayNumber: day,
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
      monthlyData.totalHours += report.hoursWorked;
      
      // Update weekly breakdown
      const weekNumber = Math.ceil((reportDate.getDate() + new Date(reportDate.getFullYear(), reportDate.getMonth(), 1).getDay()) / 7);
      const weekKey = `week${weekNumber}`;
      if (monthlyData.weeklyBreakdown[weekKey]) {
        monthlyData.weeklyBreakdown[weekKey].hours += report.hoursWorked;
        monthlyData.weeklyBreakdown[weekKey].reports += 1;
        if (!monthlyData.weeklyBreakdown[weekKey].projects.includes(projectId)) {
          monthlyData.weeklyBreakdown[weekKey].projects.push(projectId);
        }
        if (!monthlyData.weeklyBreakdown[weekKey].employees.includes(employeeId)) {
          monthlyData.weeklyBreakdown[weekKey].employees.push(employeeId);
        }
      }
      
      // Update daily breakdown
      if (monthlyData.dailyBreakdown[dayKey]) {
        monthlyData.dailyBreakdown[dayKey].hours += report.hoursWorked;
        monthlyData.dailyBreakdown[dayKey].reports += 1;
        if (!monthlyData.dailyBreakdown[dayKey].projects.includes(projectId)) {
          monthlyData.dailyBreakdown[dayKey].projects.push(projectId);
        }
      }
      
      // Update project breakdown
      if (!monthlyData.projectBreakdown[projectId]) {
        monthlyData.projectBreakdown[projectId] = {
          project: report.project,
          hours: 0,
          reports: 0,
          employees: []
        };
      }
      monthlyData.projectBreakdown[projectId].hours += report.hoursWorked;
      monthlyData.projectBreakdown[projectId].reports += 1;
      if (!monthlyData.projectBreakdown[projectId].employees.includes(employeeId)) {
        monthlyData.projectBreakdown[projectId].employees.push(employeeId);
      }
      
      // Update employee breakdown
      if (!monthlyData.employeeBreakdown[employeeId]) {
        monthlyData.employeeBreakdown[employeeId] = {
          employee: report.employee,
          hours: 0,
          reports: 0,
          projects: []
        };
      }
      monthlyData.employeeBreakdown[employeeId].hours += report.hoursWorked;
      monthlyData.employeeBreakdown[employeeId].reports += 1;
      if (!monthlyData.employeeBreakdown[employeeId].projects.includes(projectId)) {
        monthlyData.employeeBreakdown[employeeId].projects.push(projectId);
      }
    });

    return monthlyData;
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

  const handleEmployeeFilterChange = (event: any, newValue: Employee | null) => {
    setSelectedEmployee(newValue?._id || '');
    setFilterByEmployee(!!newValue);
  };

  const clearFilters = () => {
    setSelectedEmployee('');
    setFilterByEmployee(false);
    setSelectedProjectId('');
    // Reset to current month
    const today = new Date();
    setSelectedMonth(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
    setCurrentMonth(new Date());
    setShowCurrentMonthOnly(true);
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
            Monthly Reports - Admin View
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {formatMonthRange(monthlyData.monthStart, monthlyData.monthEnd)}
            {showCurrentMonthOnly && (
              <Chip 
                label="Current Month"
                color="success"
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
          <IconButton onClick={() => navigateMonth('prev')}>
            <ArrowBack />
          </IconButton>
          <Button
            variant="outlined"
            onClick={() => setCurrentMonth(new Date())}
            sx={{ minWidth: 120 }}
          >
            This Month
          </Button>
          <IconButton onClick={() => navigateMonth('next')}>
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
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                type="month"
                label="Select Month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
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
                disabled={!filterByEmployee && !selectedProjectId && !selectedMonth}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>


      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Weekly Breakdown" />
            <Tab label="Daily Calendar" />
            <Tab label="Project Summary" />
            <Tab label="Employee Performance" />
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption">
                            {weekData.employees.length} employees
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
                      <TableCell align="right">Team Size</TableCell>
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
                    {Object.entries(monthlyData.employeeBreakdown)
                      .sort(([,a], [,b]) => b.hours - a.hours)
                      .map(([employeeId, employeeData]) => {
                        const avgHoursPerDay = (employeeData.hours / 30).toFixed(1);
                        const performance = employeeData.hours >= 160 ? 'Excellent' : 
                                          employeeData.hours >= 120 ? 'Good' : 
                                          employeeData.hours >= 80 ? 'Average' : 'Below Average';
                        const performanceColor = employeeData.hours >= 160 ? 'success' : 
                                                employeeData.hours >= 120 ? 'primary' : 
                                                employeeData.hours >= 80 ? 'warning' : 'error';
                        
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

export default AdminMonthlyReports;



