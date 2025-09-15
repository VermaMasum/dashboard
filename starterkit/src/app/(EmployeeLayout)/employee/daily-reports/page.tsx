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
  TextField,
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
  Add,
  Edit,
  Delete,
  Visibility,
  Person,
  DateRange,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import axios from '@/utils/axios';

interface Report {
  _id: string;
  date: string;
  hoursWorked: number;
  description: string;
  project: {
    _id: string;
    name: string;
    description: string;
  };
  employee: {
    _id: string;
    username: string;
  };
}

interface Project {
  _id: string;
  name: string;
  description: string;
}

const EmployeeDailyReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchReports();
  }, [selectedDate]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/projects');
      setProjects(response.data);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/reports', {
        params: {
          date: selectedDate,
        }
      });
      setReports(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getHoursColor = (hours: number) => {
    if (hours >= 8) return 'success';
    if (hours >= 6) return 'primary';
    if (hours >= 4) return 'warning';
    return 'error';
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setViewDialog(true);
  };

  const totalHours = reports.reduce((sum, report) => sum + report.hoursWorked, 0);
  const totalReports = reports.length;
  const uniqueProjects = new Set(reports.map(report => report.project._id)).size;

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading daily reports...
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            My Daily Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {formatDate(selectedDate)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            variant="outlined"
            size="small"
            label="Select Date"
          />
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
                {totalHours}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Today
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
                {totalReports}
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
                {uniqueProjects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Worked on
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Avg/Report</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {totalReports > 0 ? (totalHours / totalReports).toFixed(1) : 0}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Per report
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reports Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Daily Reports
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                // Navigate to create report page or open dialog
                console.log('Create new report');
              }}
            >
              Add Report
            </Button>
          </Box>

          {reports.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No reports found for this date
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click "Add Report" to create your first report for today
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Hours</TableCell>
                    <TableCell align="right">Time</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">
                            {report.project.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {report.project.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {report.description || 'No description'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${report.hoursWorked}h`}
                          color={getHoursColor(report.hoursWorked)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatTime(report.date)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleViewReport(report)}
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            // Edit report functionality
                            console.log('Edit report:', report._id);
                          }}
                          title="Edit Report"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            // Delete report functionality
                            console.log('Delete report:', report._id);
                          }}
                          title="Delete Report"
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Report Details Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Report Details
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Project
                  </Typography>
                  <Typography variant="h6">
                    {selectedReport.project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedReport.project.description}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Hours Worked
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {selectedReport.hoursWorked} hours
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {selectedReport.description || 'No description provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedReport.date)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Time
                  </Typography>
                  <Typography variant="body1">
                    {formatTime(selectedReport.date)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
          <Button variant="contained" onClick={() => {
            setViewDialog(false);
            // Edit functionality
            console.log('Edit report:', selectedReport?._id);
          }}>
            Edit Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDailyReports;
