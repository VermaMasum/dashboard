"use client";
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, Alert,
  Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip,
  CircularProgress, Grid, Divider,
} from '@mui/material';
import { Add, Edit, Delete, Assessment, Visibility } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import axios from '@/utils/axios';

interface Report {
  _id: string;
  date: string;
  title: string;
  description: string;
  hoursWorked: number;
  project?: {
    _id: string;
    name: string;
  };
  employee?: {
    _id: string;
    username: string;
  };
}

interface Project {
  _id: string;
  name: string;
  description: string;
}

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reportDialog, setReportDialog] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    project: '',
    title: '',
    description: '',
    hoursWorked: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('👤 Fetching employee data...');
      
      const [reportsRes, projectsRes] = await Promise.all([
        axios.get('/reports'),
        axios.get('/projects'),
      ]);

      // Filter reports for current employee only
      const employeeReports = reportsRes.data.filter((report: Report) => 
        report.employee?._id === user?.id || report.employee?._id === user?._id
      );

      console.log('👤 Employee reports:', employeeReports);
      console.log('👤 Available projects:', projectsRes.data);

      setReports(employeeReports);
      setProjects(projectsRes.data);
    } catch (err: any) {
      console.error('❌ Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (report?: Report) => {
    if (report) {
      setEditingReport(report);
      setFormData({
        date: report.date.split('T')[0],
        project: report.project?._id || '',
        title: report.title || '',
        description: report.description,
        hoursWorked: report.hoursWorked,
      });
    } else {
      setEditingReport(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        project: '',
        title: '',
        description: '',
        hoursWorked: 0,
      });
    }
    setReportDialog(true);
  };

  const handleCloseDialog = () => {
    setReportDialog(false);
    setEditingReport(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      project: '',
      title: '',
      description: '',
      hoursWorked: 0,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingReport) {
        await axios.put(`/reports/${editingReport._id}`, formData);
        setSuccess('Report updated successfully');
      } else {
        // For new reports, include the current employee ID
        const reportData = {
          ...formData,
          employee: user?.id || user?._id,
        };
        await axios.post('/reports', reportData);
        setSuccess('Report submitted successfully');
      }
      handleCloseDialog();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save report');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await axios.delete(`/reports/${id}`);
        setSuccess('Report deleted successfully');
        fetchData();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete report');
      }
    }
  };

  const todayReports = reports.filter(r => new Date(r.date).toDateString() === new Date().toDateString());
  const totalHoursToday = todayReports.reduce((sum, report) => sum + report.hoursWorked, 0);
  const totalHoursThisWeek = reports
    .filter(r => {
      const reportDate = new Date(r.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return reportDate >= weekAgo;
    })
    .reduce((sum, report) => sum + report.hoursWorked, 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1">
            Employee Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Welcome, {user?.username}! Submit your daily reports and track your work.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Submit Report
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Today's Reports
                  </Typography>
                  <Typography variant="h4">
                    {todayReports.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Hours Today
                  </Typography>
                  <Typography variant="h4">
                    {totalHoursToday}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Hours This Week
                  </Typography>
                  <Typography variant="h4">
                    {totalHoursThisWeek}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Reports
                  </Typography>
                  <Typography variant="h4">
                    {reports.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Past Reports Section */}
      <Box mb={3}>
        <Typography variant="h5" component="h2" gutterBottom>
          Your Past Reports
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          View and manage your submitted reports
        </Typography>
      </Box>

      {/* Reports Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Hours</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No reports submitted yet. Click "Submit Report" to get started!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              reports
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((report) => (
                  <TableRow key={report._id}>
                    <TableCell>
                      {new Date(report.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={report.project?.name || 'No Project'} 
                        color="primary" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {report.title || 'No Title'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {report.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {report.hoursWorked}h
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(report)}
                        color="primary"
                        title="Edit Report"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(report._id)}
                        color="error"
                        title="Delete Report"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Report Dialog */}
      <Dialog open={reportDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingReport ? 'Edit Report' : 'Submit New Report'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
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
            <FormControl fullWidth margin="normal">
              <InputLabel>Project</InputLabel>
              <Select
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
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
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              margin="normal"
              placeholder="Brief title for your work"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              placeholder="Detailed description of what you worked on..."
              required
            />
            <TextField
              fullWidth
              type="number"
              label="Hours Worked"
              value={formData.hoursWorked}
              onChange={(e) => setFormData({ ...formData, hoursWorked: Number(e.target.value) })}
              margin="normal"
              inputProps={{ min: 0, max: 24, step: 0.5 }}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingReport ? 'Update Report' : 'Submit Report'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDashboard;
