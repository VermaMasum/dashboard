"use client";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Paper,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Assessment,
  Work,
  Person,
  TrendingUp,
  Add,
  Assignment,
  Home,
  Edit,
  Delete,
  Visibility,
  People,
  AccessTime,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/contexts/DashboardContext';
import axios from '@/utils/axios';

interface EmployeeStats {
  totalReports: number;
  totalHours: number;
  currentProjects: number;
  thisWeekHours: number;
}

interface RecentReport {
  _id: string;
  date: string;
  project: {
    name: string;
  };
  details: string;
  hoursWorked: number;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  date: string;
  employees?: Array<{
    _id: string;
    username: string;
  }>;
}

interface Report {
  _id: string;
  date: string;
  project: {
    _id: string;
    name: string;
  };
  employee: {
    _id: string;
    username: string;
  };
  details: string;
  hoursWorked: number;
}

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { activeTab, setActiveTab } = useDashboard();
  const [stats, setStats] = useState<EmployeeStats>({
    totalReports: 0,
    totalHours: 0,
    currentProjects: 0,
    thisWeekHours: 0,
  });
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Projects data
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectReports, setProjectReports] = useState<Report[]>([]);
  
  // Reports data
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Report dialog state
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [formData, setFormData] = useState({
    project: '',
    date: new Date().toISOString().split('T')[0],
    details: '',
    hoursWorked: 0,
  });

  // Project details modal state
  const [projectDetailsOpen, setProjectDetailsOpen] = useState(false);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState<Project | null>(null);
  const [projectReportsForModal, setProjectReportsForModal] = useState<Report[]>([]);

  useEffect(() => {
    console.log('🔍 Dashboard useEffect - user changed:', user);
    if (user) {
      console.log('🔍 User is available, fetching dashboard data...');
    fetchDashboardData();
    } else {
      console.log('🔍 No user available, not fetching data');
    }
  }, [user]);

  // No need for URL parameter handling since we're using context

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching employee dashboard data for:', user?.username, 'ID:', user?.id);
      
      // Try to use the dedicated dashboard endpoint for better performance
      try {
        const dashboardResponse = await axios.get('/dashboard/employee');
        console.log('📊 Dashboard endpoint response:', dashboardResponse.data);
        
        const { stats: dashboardStats, recentReports: dashboardRecentReports, projects: dashboardProjects, reports: dashboardReports } = dashboardResponse.data;
        
        setStats(dashboardStats);
        setRecentReports(dashboardRecentReports);
        setProjects(dashboardProjects);
        setReports(dashboardReports);
        setProjectReports(dashboardReports);
        setFilteredReports(dashboardReports);
        
        console.log('✅ Used dashboard endpoint successfully');
        return; // Exit early if dashboard endpoint works
      } catch (dashboardError) {
        console.log('⚠️ Dashboard endpoint not available, falling back to individual endpoints');
      }

      // Fallback: Fetch employee's reports and projects (backend will filter for employee automatically)
      const [reportsResponse, projectsResponse] = await Promise.all([
        axios.get('/reports'),
        axios.get('/projects'),
      ]);

      console.log('📊 Employee reports response:', reportsResponse.data);
      console.log('📊 Employee projects response:', projectsResponse.data);

      // Data is already filtered by backend for employees
      const employeeReports = reportsResponse.data;
      const assignedProjects = projectsResponse.data;

      console.log('📊 Employee reports:', employeeReports);
      console.log('📊 Assigned projects:', assignedProjects);

      // Calculate today's reports
      const today = new Date();
      const todayReports = employeeReports.filter((report: any) => {
        const reportDate = new Date(report.date);
        return reportDate.toDateString() === today.toDateString();
      });

      // Calculate today's hours
      const todayHours = todayReports.reduce((sum: number, report: any) => sum + (report.hoursWorked || 0), 0);

      // Calculate total hours
      const totalHours = employeeReports.reduce((sum: number, report: any) => sum + (report.hoursWorked || 0), 0);

      setStats({
        totalReports: todayReports.length,
        totalHours: todayHours,
        currentProjects: assignedProjects.length,
        thisWeekHours: employeeReports.length,
      });

      // Get recent reports (last 5)
      const sortedReports = employeeReports
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      
      setRecentReports(sortedReports);
      
      // Set data for tabs
      setProjects(assignedProjects);
      setReports(employeeReports);
      setProjectReports(employeeReports);
      setFilteredReports(employeeReports);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Report dialog handlers
  const handleOpenReportDialog = (report?: Report) => {
    if (report) {
      setEditingReport(report);
      setFormData({
        project: report.project._id,
        date: report.date,
        details: report.details,
        hoursWorked: report.hoursWorked,
      });
    } else {
      setEditingReport(null);
      setFormData({
        project: '',
        date: new Date().toISOString().split('T')[0],
        details: '',
        hoursWorked: 0,
      });
    }
    setReportDialogOpen(true);
  };

  const handleCloseReportDialog = () => {
    setReportDialogOpen(false);
    setEditingReport(null);
  };

  const handleSaveReport = async () => {
    try {
      const reportData = {
        project: formData.project,
        date: formData.date,
        details: formData.details,
        hoursWorked: formData.hoursWorked,
      };

      if (editingReport) {
        await axios.put(`/reports/${editingReport._id}`, reportData);
      } else {
        await axios.post('/reports', reportData);
      }

      handleCloseReportDialog();
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };

  // Filter reports
  const filterReports = () => {
    let filtered = reports;
    
    if (selectedProject) {
      filtered = filtered.filter(report => report.project._id === selectedProject);
    }
    
    if (selectedDate) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.date).toISOString().split('T')[0];
        return reportDate === selectedDate;
      });
    }
    
    setFilteredReports(filtered);
  };

  // Project details handlers
  const handleViewProjectDetails = async (project: Project) => {
    try {
      setSelectedProjectDetails(project);
      
      // Fetch reports for this specific project
      const projectReportsResponse = await axios.get(`/reports?project=${project._id}`);
      setProjectReportsForModal(projectReportsResponse.data);
      
      setProjectDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

  const handleCloseProjectDetails = () => {
    setProjectDetailsOpen(false);
    setSelectedProjectDetails(null);
    setProjectReportsForModal([]);
  };

  // Calculate total hours for a project
  const calculateProjectTotalHours = (projectId: string) => {
    return reports
      .filter(report => report.project._id === projectId)
      .reduce((total, report) => total + (report.hoursWorked || 0), 0);
  };

  useEffect(() => {
    filterReports();
  }, [selectedProject, selectedDate, reports]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading your dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/employee/dashboard"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Typography color="text.primary">Employee Dashboard</Typography>
      </Breadcrumbs>

      {/* Welcome Section - Simplified */}
      {/* <Box mb={4}>
        <Typography variant="body1" color="text.secondary">
          Welcome, {user?.username}!
        </Typography>
      </Box> */}

      {/* Stats Cards */}
      <Box display="flex" flexWrap="wrap" gap={3} sx={{ mb: 4 }}>
        <Box flex="1" minWidth="250px">
          <Card 
            sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom fontWeight="500">
                    Today's Reports
                  </Typography>
                  <Typography variant="h3" fontWeight="700" color="primary.main">
                    {stats.totalReports}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Assessment color="primary" sx={{ fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="250px">
          <Card 
            sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom fontWeight="500">
                    Hours Today
                  </Typography>
                  <Typography variant="h3" fontWeight="700" color="success.main">
                    {stats.totalHours}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: 'success.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <TrendingUp color="success" sx={{ fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="250px">
          <Card 
            sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom fontWeight="500">
                    Total Projects
                  </Typography>
                  <Typography variant="h3" fontWeight="700" color="warning.main">
                    {stats.currentProjects}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: 'warning.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Work color="warning" sx={{ fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="250px">
          <Card 
            sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom fontWeight="500">
                    Total Reports
                  </Typography>
                  <Typography variant="h3" fontWeight="700" color="info.main">
                    {stats.thisWeekHours}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: 'info.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Person color="info" sx={{ fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tabs Interface */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab label="Overview" />
            <Tab label="Project Details" />
            <Tab label="Daily Reports" />
            <Tab label="Weekly Reports" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ mt: 3 }}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Box>
      {/* Quick Actions */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom fontWeight="600">
          Quick Actions
        </Typography>
        <Box display="flex" gap={3} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenReportDialog()}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Create Daily Report
          </Button>
          <Button
            variant="outlined"
            startIcon={<Assignment />}
            onClick={() => setActiveTab(1)}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-1px)',
                boxShadow: 2
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            View Projects
          </Button>
        </Box>
      </Box>

      {/* Recent Reports */}
      <Box display="flex" flexWrap="wrap" gap={3}>
        <Box flex="2" minWidth="400px">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Reports
              </Typography>
              {recentReports.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                      opacity: 0.7
                    }}
                  >
                    <Assignment sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                  <Typography color="text.secondary" variant="h6" gutterBottom fontWeight="600">
                    No reports yet
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ maxWidth: 300, margin: '0 auto' }}>
                    Start tracking your daily work by creating your first report
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenReportDialog()}
                    sx={{
                      mt: 3,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                      py: 1
                    }}
                  >
                    Create First Report
                  </Button>
                </Box>
              ) : (
                <Box>
                  {recentReports.map((report, index) => (
                    <Card 
                      key={report._id} 
                      sx={{ 
                        mb: 2, 
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          boxShadow: 2,
                          borderColor: 'primary.main'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <CardContent sx={{ py: 2 }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}
                          >
                            <Assignment fontSize="small" />
                          </Box>
                          <Box flex={1}>
                            <Box display="flex" alignItems="center" gap={2} mb={1}>
                              <Typography variant="h6" fontWeight="600" color="text.primary">
                              {report.project?.name || 'Unknown Project'}
                            </Typography>
                            <Chip 
                              label={`${report.hoursWorked}h`} 
                              size="small" 
                              color="primary" 
                                sx={{ fontWeight: 600 }}
                            />
                          </Box>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(report.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        <Box flex="1" minWidth="300px">
          <Card 
            sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'white',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box textAlign="center" mb={3}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    border: '3px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  <Person sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography variant="h5" fontWeight="700" gutterBottom color="text.primary">
                  {user?.username}
                </Typography>
                <Chip
                  label="Employee"
                  color="primary"
                  variant="outlined"
                  sx={{
                    fontWeight: 600,
                    borderWidth: 2
                  }}
                />
              </Box>
              
              <Box 
                sx={{ 
                  backgroundColor: 'grey.50',
                  borderRadius: 2,
                  p: 2,
                  mb: 2,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Assessment sx={{ fontSize: 16, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="body2" fontWeight="500" color="text.secondary">
                    Member Since
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight="600" sx={{ ml: 4 }} color="text.primary">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>

              <Box 
                sx={{ 
                  backgroundColor: 'grey.50',
                  borderRadius: 2,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: 'success.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Work sx={{ fontSize: 16, color: 'success.main' }} />
                  </Box>
                  <Typography variant="body2" fontWeight="500" color="text.secondary">
                    Active Projects
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="700" sx={{ ml: 4 }} color="success.main">
                  {stats.currentProjects}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
            </Box>
          )}

          {/* Project Details Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                My Projects
              </Typography>
              {projects.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  No projects assigned to you yet.
                </Typography>
              ) : (
                <Card>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Project Name</strong></TableCell>
                          <TableCell><strong>Description</strong></TableCell>
                          <TableCell><strong>Date</strong></TableCell>
                          <TableCell><strong>Works With</strong></TableCell>
                          <TableCell><strong>Total Hours</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {projects.map((project) => (
                          <TableRow key={project._id} hover>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight="medium">
                                {project.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                                {project.description || 'No description'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(project.date).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <People fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {project.employees?.length || 0} member(s)
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <AccessTime fontSize="small" color="action" />
                                <Typography variant="body2" fontWeight="medium">
                                  {calculateProjectTotalHours(project._id)}h
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                color="primary"
                                onClick={() => handleViewProjectDetails(project)}
                                title="View Details"
                              >
                                <Visibility />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              )}
            </Box>
          )}

          {/* Daily Reports Tab */}
          {activeTab === 2 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                {/* <Typography variant="h6">
                  Daily Reports
                </Typography> */}
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenReportDialog()}
                >
                  Add Report
                </Button>
              </Box>

              {/* Filters */}
              <Box display="flex" gap={2} mb={3} flexWrap="wrap">
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
                <TextField
                  type="date"
                  label="Date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              {/* Reports Table */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Project</TableCell>
                      <TableCell>Hours</TableCell>
                      <TableCell>Details</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary" py={2}>
                            No reports found for the selected filters.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReports.map((report) => (
                        <TableRow key={report._id}>
                          <TableCell>
                            {new Date(report.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{report.project.name}</TableCell>
                          <TableCell>{report.hoursWorked}</TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {report.details}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenReportDialog(report)}
                            >
                              <Edit />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Box>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onClose={handleCloseReportDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingReport ? 'Edit Report' : 'Create New Report'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Project</InputLabel>
              <Select
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                label="Project"
                required
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
              type="date"
              label="Date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              type="number"
              label="Hours Worked"
              value={formData.hoursWorked}
              onChange={(e) => setFormData({ ...formData, hoursWorked: Number(e.target.value) })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Details"
              multiline
              rows={4}
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportDialog}>Cancel</Button>
          <Button onClick={handleSaveReport} variant="contained">
            {editingReport ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Details Modal */}
      <Dialog
        open={projectDetailsOpen}
        onClose={handleCloseProjectDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Work color="primary" />
            <Typography variant="h6">
              {selectedProjectDetails?.name} - Project Details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedProjectDetails && (
            <Box>
              {/* Project Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Project Information
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                      <Box flex="1" minWidth="200px">
                        <Typography variant="body2" color="text.secondary">
                          Project Name
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedProjectDetails.name}
                        </Typography>
                      </Box>
                      <Box flex="1" minWidth="200px">
                        <Typography variant="body2" color="text.secondary">
                          Created Date
                        </Typography>
                        <Typography variant="body1">
                          {new Date(selectedProjectDetails.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {selectedProjectDetails.description || 'No description provided'}
                      </Typography>
                    </Box>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                      <Box flex="1" minWidth="200px">
                        <Typography variant="body2" color="text.secondary">
                          Team Members
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                          {selectedProjectDetails.employees?.map((emp: any, index: number) => (
                            <Chip
                              key={index}
                              label={emp.username || 'Unknown'}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                      <Box flex="1" minWidth="200px">
                        <Typography variant="body2" color="text.secondary">
                          Total Hours Spent
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" color="primary">
                          {calculateProjectTotalHours(selectedProjectDetails._id)} hours
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Project Reports */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Project Reports ({projectReportsForModal.length})
                  </Typography>
                  {projectReportsForModal.length === 0 ? (
                    <Typography color="text.secondary" textAlign="center" py={2}>
                      No reports found for this project.
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Date</strong></TableCell>
                            <TableCell><strong>Employee</strong></TableCell>
                            <TableCell><strong>Hours</strong></TableCell>
                            <TableCell><strong>Details</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {projectReportsForModal.map((report) => (
                            <TableRow key={report._id}>
                              <TableCell>
                                {new Date(report.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={report.employee?.username || 'Unknown'}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {report.hoursWorked}h
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ maxWidth: 200 }}>
                                  {report.details}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Weekly Reports Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Weekly Reports Summary
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                View your weekly work summary, project breakdown, and team overview.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.open('/employee/weekly-reports', '_blank')}
                sx={{ mt: 2 }}
              >
                Open Weekly Reports
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProjectDetails} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDashboard;
