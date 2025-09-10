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
      <Box mb={4}>
        <Typography variant="body1" color="text.secondary">
          Welcome, {user?.username}!
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Today's Reports
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalReports}
                  </Typography>
                </Box>
                <Assessment color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Hours Today
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalHours}
                  </Typography>
                </Box>
                <TrendingUp color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Projects
                  </Typography>
                  <Typography variant="h4">
                    {stats.currentProjects}
                  </Typography>
                </Box>
                <Work color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Reports
                  </Typography>
                  <Typography variant="h4">
                    {stats.thisWeekHours}
                  </Typography>
                </Box>
                <Person color="info" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Interface */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab label="Overview" />
            <Tab label="Project Details" />
            <Tab label="Daily Reports" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ mt: 3 }}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Box>
      {/* Quick Actions */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<Add />}
                    onClick={() => handleOpenReportDialog()}
          >
            Create Daily Report
          </Button>
          <Button
            variant="outlined"
            startIcon={<Assignment />}
                    onClick={() => setActiveTab(1)}
          >
            View My Projects
          </Button>
        </Box>
      </Box>

      {/* Recent Reports */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Reports
              </Typography>
              {recentReports.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  No reports found. Create your first daily report!
                </Typography>
              ) : (
                <List>
                  {recentReports.map((report, index) => (
                    <ListItem key={report._id} divider={index < recentReports.length - 1}>
                      <ListItemIcon>
                        <Assignment color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1">
                              {report.project?.name || 'Unknown Project'}
                            </Typography>
                            <Chip 
                              label={`${report.hoursWorked}h`} 
                              size="small" 
                              color="primary" 
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(report.date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" noWrap>
                              {report.details}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Summary
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Username
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user?.username}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Role
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Employee
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Member Since
                </Typography>
                <Typography variant="body1">
                  {new Date().toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
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
                <Grid container spacing={3}>
                  {projects.map((project) => (
                    <Grid item xs={12} md={6} key={project._id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {project.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {project.description}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} mt={2}>
                            <Chip 
                              label={project.status} 
                              color={project.status === 'active' ? 'success' : 'default'}
                              size="small"
                            />
                            <Typography variant="caption" color="text.secondary">
                              Created: {new Date(project.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Daily Reports Tab */}
          {activeTab === 2 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                  Daily Reports
                </Typography>
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
    </Box>
  );
};

export default EmployeeDashboard;
