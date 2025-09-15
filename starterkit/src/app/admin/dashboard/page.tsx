"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Assessment,
  People,
  Work,
  TrendingUp,
  Add,
  Refresh,
  Home,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import axios from '@/utils/axios';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';

interface Report {
  _id: string;
  date: string;
  project: {
    _id: string;
    name: string;
  } | null;
  employee: {
    _id: string;
    username: string;
  } | null;
  details: string;
  hoursWorked: number;
  title: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
}

interface Employee {
  _id: string;
  username: string;
  role: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Report view state
  const [reportView, setReportView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  // Filter states
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
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
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  
  // Report details modal state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds to get live updates
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Admin Dashboard - Starting data fetch...');
      
      // Fetch reports
      const reportsRes = await axios.get('/reports');
      console.log('📊 Admin Dashboard - Reports data:', reportsRes.data);
      setReports(reportsRes.data);
      
      // Fetch projects
      const projectsRes = await axios.get('/projects');
      console.log('📊 Admin Dashboard - Projects data:', projectsRes.data);
      setProjects(projectsRes.data);
      
      // Fetch users and filter employees
      const usersRes = await axios.get('/users/all');
      console.log('📊 Admin Dashboard - Users data:', usersRes.data);
      
      // The API returns { total, byRole: { superAdmin, admin, employee }, all }
      const allUsers = usersRes.data.all || usersRes.data;
      console.log('📊 Admin Dashboard - All users array:', allUsers);
      
      // Filter employees from all users
      const employeeUsers = Array.isArray(allUsers) 
        ? allUsers.filter((user: any) => user.role === 'employee')
        : [];
      console.log('📊 Admin Dashboard - Employee users:', employeeUsers);
      setEmployees(employeeUsers);
      
      console.log('✅ Admin Dashboard - Data fetch completed successfully');
    } catch (err: any) {
      console.error('❌ Error fetching dashboard data:', err);
      console.error('❌ Error details:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for date calculations
  const getWeekRange = (date: Date) => {
    const monday = new Date(date);
    const dayOfWeek = date.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(date.getDate() + mondayOffset);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return { start: monday, end: sunday };
  };

  const getMonthRange = (year: number, month: number) => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return { start, end };
  };

  // Filter functions
  const getDailyReports = () => {
    let filtered = reports;
    
    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter((report) => {
        const reportDate = new Date(report.date).toISOString().split('T')[0];
        return reportDate === selectedDate;
      });
    }
    
    // Filter by project
    if (selectedProject) {
      filtered = filtered.filter((report) => report.project?._id === selectedProject);
    }
    
    // Filter by employee
    if (selectedEmployee) {
      filtered = filtered.filter((report) => report.employee?._id === selectedEmployee);
    }
    
    return filtered;
  };

  const getWeeklyReports = () => {
    let filtered = reports;
    
    // Filter by date range
    if (fromDate && toDate) {
      filtered = filtered.filter((report) => {
        const reportDate = new Date(report.date).toISOString().split('T')[0];
        return reportDate >= fromDate && reportDate <= toDate;
      });
    }
    
    // Filter by project
    if (selectedProject) {
      filtered = filtered.filter((report) => report.project?._id === selectedProject);
    }
    
    // Filter by employee
    if (selectedEmployee) {
      filtered = filtered.filter((report) => report.employee?._id === selectedEmployee);
    }
    
    return filtered;
  };

  const getMonthlyReports = () => {
    let filtered = reports;
    
    // Filter by month
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number);
      const { start, end } = getMonthRange(year, month);
      
      filtered = filtered.filter((report) => {
        const reportDate = new Date(report.date);
        return reportDate >= start && reportDate <= end;
      });
    }
    
    // Filter by project
    if (selectedProject) {
      filtered = filtered.filter((report) => report.project?._id === selectedProject);
    }
    
    // Filter by employee
    if (selectedEmployee) {
      filtered = filtered.filter((report) => report.employee?._id === selectedEmployee);
    }
    
    return filtered;
  };

  // Report details modal handlers
  const handleOpenReportDetails = (report: Report) => {
    console.log('🔍 Opening report details for:', report);
    console.log('🔍 Current modal state:', reportDialogOpen);
    console.log('🔍 Selected report before:', selectedReport);
    alert(`Clicked on report: ${report.title || 'Untitled Report'}`);
    setSelectedReport(report);
    setReportDialogOpen(true);
    console.log('🔍 Modal should be open now');
  };

  const handleCloseReportDetails = () => {
    setSelectedReport(null);
    setReportDialogOpen(false);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <PageContainer title="Admin Dashboard" description="Admin Dashboard">
      {/* Breadcrumb Navigation */}
      <Box sx={{ px: 3, pb: 2 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            href="/admin/dashboard"
            color="inherit"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Admin
          </Link>
          <Typography color="text.primary">Reports</Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 1 }}>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          {/* Toggle Button Group - Left Side */}
          <ToggleButtonGroup
            value={reportView}
            exclusive
            onChange={(event, newView) => {
              if (newView !== null) {
                setReportView(newView);
              }
            }}
            sx={{
              "& .MuiToggleButton-root": {
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                px: 3,
                py: 1.5,
                textTransform: "none",
                fontWeight: "bold",
                "&.Mui-selected": {
                  backgroundColor: "#2196F3",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#1976D2",
                  },
                },
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              },
            }}
          >
            <ToggleButton value="daily">Daily Reports</ToggleButton>
            <ToggleButton value="weekly">Weekly Reports</ToggleButton>
            <ToggleButton value="monthly">Monthly Reports</ToggleButton>
          </ToggleButtonGroup>

          {/* Right Side Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchData}
              sx={{
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Refresh
            </Button>
        <Button
          variant="contained"
          startIcon={<Add />}
          href="/admin/daily-reports"
              sx={{
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                color: "white",
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": {
                  background: "linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)",
                },
              }}
        >
          Create Report
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            console.log('🔍 Test button clicked');
            alert('Test button works!');
            setReportDialogOpen(true);
          }}
        >
          Test Modal
        </Button>
      </Box>
        </Box>
      </Box>

      {/* Spacing below toggle buttons */}
      <Box sx={{ mb: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          <Typography variant="body2" component="div">
            <strong>Error:</strong> {error}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Please check the console for more details and try refreshing the page.
          </Typography>
        </Alert>
      )}

      {/* Daily Reports */}
      {reportView === "daily" && (
          <Card>
            <CardContent>
            <Typography variant="h6" gutterBottom>
              Daily Reports ({getDailyReports().length} reports)
                  </Typography>

            {/* Filters */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
              <TextField
                label="Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Project</InputLabel>
                <Select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
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
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  label="Employee"
                >
                  <MenuItem value="">All Employees</MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee._id} value={employee._id}>
                      {employee.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                onClick={() => {
                  const today = new Date();
                  setSelectedDate(today.toISOString().split("T")[0]);
                  setSelectedProject("");
                  setSelectedEmployee("");
                }}
                sx={{ minWidth: 120 }}
              >
                Reset to Today
              </Button>
                </Box>

            {/* Daily Reports Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getDailyReports().map((report) => (
                    <TableRow 
                      key={report._id}
                      onClick={(e) => {
                        console.log('🔍 Daily TableRow clicked!', e);
                        console.log('🔍 Report data:', report);
                        handleOpenReportDetails(report);
                      }}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    >
                      <TableCell>
                        {new Date(report.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={report.project?.name || 'Unknown Project'} 
                          size="small" 
                          color="primary" 
                        />
                      </TableCell>
                      <TableCell>{report.employee?.username || 'Unknown Employee'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {report.details}
                  </Typography>
                      </TableCell>
                      <TableCell>{report.hoursWorked}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            </CardContent>
          </Card>
      )}

      {/* Weekly Reports */}
      {reportView === "weekly" && (
          <Card>
            <CardContent>
            <Typography variant="h6" gutterBottom>
              Weekly Reports ({getWeeklyReports().length} reports)
                  </Typography>

            {/* Filters */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
              <TextField
                label="From Date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
              <TextField
                label="To Date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Project</InputLabel>
                <Select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
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
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  label="Employee"
                >
                  <MenuItem value="">All Employees</MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee._id} value={employee._id}>
                      {employee.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                onClick={() => {
                  const today = new Date();
                  const monday = new Date(today);
                  const dayOfWeek = today.getDay();
                  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                  monday.setDate(today.getDate() + mondayOffset);
                  const sunday = new Date(monday);
                  sunday.setDate(monday.getDate() + 6);
                  setFromDate(monday.toISOString().split("T")[0]);
                  setToDate(sunday.toISOString().split("T")[0]);
                  setSelectedProject("");
                  setSelectedEmployee("");
                }}
                sx={{ minWidth: 120 }}
              >
                Reset to This Week
              </Button>
                </Box>

            {/* Weekly Reports Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getWeeklyReports().map((report) => (
                    <TableRow 
                      key={report._id}
                      onClick={() => handleOpenReportDetails(report)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    >
                      <TableCell>
                        {new Date(report.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={report.project?.name || 'Unknown Project'} 
                          size="small" 
                          color="primary" 
                        />
                      </TableCell>
                      <TableCell>{report.employee?.username || 'Unknown Employee'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {report.details}
                  </Typography>
                      </TableCell>
                      <TableCell>{report.hoursWorked}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            </CardContent>
          </Card>
      )}

      {/* Monthly Reports */}
      {reportView === "monthly" && (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
              Monthly Reports ({getMonthlyReports().length} reports)
          </Typography>

            {/* Filters */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
              <TextField
                label="Month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Project</InputLabel>
                <Select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
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
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  label="Employee"
                >
                  <MenuItem value="">All Employees</MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee._id} value={employee._id}>
                      {employee.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                onClick={() => {
                  const today = new Date();
                  setSelectedMonth(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
                  setSelectedProject("");
                  setSelectedEmployee("");
                }}
                sx={{ minWidth: 120 }}
              >
                Reset to This Month
              </Button>
            </Box>

            {/* Monthly Reports Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Hours</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {getMonthlyReports().map((report) => (
                    <TableRow 
                      key={report._id}
                      onClick={() => handleOpenReportDetails(report)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    >
                    <TableCell>
                      {new Date(report.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={report.project?.name || 'Unknown Project'} 
                        size="small" 
                        color="primary" 
                      />
                    </TableCell>
                    <TableCell>{report.employee?.username || 'Unknown Employee'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {report.details}
                      </Typography>
                    </TableCell>
                    <TableCell>{report.hoursWorked}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      )}

      {/* Report Details Modal */}
      </Box>
      <Dialog
        open={reportDialogOpen}
        onClose={handleCloseReportDetails}
        maxWidth="md"
        fullWidth
        onEntered={() => console.log('🔍 Modal entered/opened')}
        onExited={() => console.log('🔍 Modal exited/closed')}
      >
        <DialogTitle>
          Report Details
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedReport.title || 'Report Details'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedReport.date).toLocaleDateString()}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Project
                  </Typography>
                  <Chip 
                    label={selectedReport.project?.name || 'Unknown Project'} 
                    color="primary" 
                    size="small"
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Employee
                  </Typography>
                  <Typography variant="body1">
                    {selectedReport.employee?.username || 'Unknown Employee'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Hours Worked
                  </Typography>
                  <Typography variant="body1">
                    {selectedReport.hoursWorked} hours
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Details
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedReport.details}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportDetails}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default AdminDashboard;