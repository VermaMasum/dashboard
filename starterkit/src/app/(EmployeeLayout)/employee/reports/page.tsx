"use client";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Assessment,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

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

interface Project {
  _id: string;
  name: string;
  description: string;
}

const EmployeeReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [reportDialog, setReportDialog] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    project: '',
    details: '',
    hoursWorked: 0,
  });

  // Filter states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes, projectsRes] = await Promise.all([
        axios.get('/reports'),
        axios.get('/projects'),
      ]);

      // Filter reports for current employee only
      const employeeReports = reportsRes.data.filter((report: Report) => 
        report.employee && report.employee._id === user?.id
      );

      setReports(employeeReports);
      setProjects(projectsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (report?: Report) => {
    if (report) {
      setEditingReport(report);
      setFormData({
        project: report.project._id,
        details: report.details,
        hoursWorked: report.hoursWorked,
      });
    } else {
      setEditingReport(null);
      setFormData({
        project: '',
        details: '',
        hoursWorked: 0,
      });
    }
    setReportDialog(true);
  };

  const handleCloseDialog = () => {
    setReportDialog(false);
    setEditingReport(null);
    setFormData({
      project: '',
      details: '',
      hoursWorked: 0,
    });
  };

  const handleSubmit = async () => {
    try {
      const reportData = {
        ...formData,
        employee: user?.id, // Set current employee
        date: selectedDate,
      };

      if (editingReport) {
        await axios.put(`/reports/${editingReport._id}`, reportData);
        setSuccess('Report updated successfully');
      } else {
        await axios.post('/reports', reportData);
        setSuccess('Report created successfully');
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

  const filteredReports = reports.filter(report => 
    new Date(report.date).toDateString() === new Date(selectedDate).toDateString()
  );

  const totalHoursToday = filteredReports.reduce((sum, report) => sum + report.hoursWorked, 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading your reports...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          My Daily Reports
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Create Report
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
      <Box display="flex" gap={3} mb={4} flexWrap="wrap">
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Today's Reports
                </Typography>
                <Typography variant="h4">
                  {filteredReports.length}
                </Typography>
              </Box>
              <Assessment color="primary" />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Hours Today
                </Typography>
                <Typography variant="h4">
                  {totalHoursToday}
                </Typography>
              </Box>
              <Assessment color="success" />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Reports
                </Typography>
                <Typography variant="h4">
                  {reports.length}
                </Typography>
              </Box>
              <Assessment color="warning" />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Date Filter */}
      <Box display="flex" gap={2} mb={3} alignItems="center">
        <TextField
          type="date"
          label="Select Date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button
          variant="outlined"
          onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
        >
          Today
        </Button>
      </Box>

      {/* Reports Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Hours</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" py={2}>
                    No reports found for this date. Create your first report!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report._id}>
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
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {report.details}
                    </Typography>
                  </TableCell>
                  <TableCell>{report.hoursWorked}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(report)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(report._id)}
                      color="error"
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
      <Dialog open={reportDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingReport ? 'Edit Report' : 'Create New Report'}
        </DialogTitle>
        <DialogContent>
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
            label="Report Details"
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            margin="normal"
            multiline
            rows={4}
            required
          />
          <TextField
            fullWidth
            label="Hours Worked"
            type="number"
            value={formData.hoursWorked}
            onChange={(e) => setFormData({ ...formData, hoursWorked: Number(e.target.value) })}
            margin="normal"
            inputProps={{ min: 0, step: 0.5 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingReport ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeReports;
