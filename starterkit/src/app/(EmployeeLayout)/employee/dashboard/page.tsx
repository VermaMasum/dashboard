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
} from '@mui/material';
import {
  Assessment,
  Work,
  Person,
  TrendingUp,
  Add,
  Assignment,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

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

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<EmployeeStats>({
    totalReports: 0,
    totalHours: 0,
    currentProjects: 0,
    thisWeekHours: 0,
  });
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch employee's reports
      const reportsResponse = await axios.get('/reports');
      const reports = reportsResponse.data.filter((report: any) => 
        report.employee && report.employee._id === user?.id
      );

      // Calculate stats
      const totalReports = reports.length;
      const totalHours = reports.reduce((sum: number, report: any) => sum + report.hoursWorked, 0);
      
      // Get unique projects
      const uniqueProjects = new Set(reports.map((report: any) => report.project?._id).filter(Boolean));
      const currentProjects = uniqueProjects.size;

      // Calculate this week's hours
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekReports = reports.filter((report: any) => 
        new Date(report.date) >= oneWeekAgo
      );
      const thisWeekHours = thisWeekReports.reduce((sum: number, report: any) => sum + report.hoursWorked, 0);

      setStats({
        totalReports,
        totalHours,
        currentProjects,
        thisWeekHours,
      });

      // Get recent reports (last 5)
      const sortedReports = reports
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      
      setRecentReports(sortedReports);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading your dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your work activity and recent reports.
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
                    Total Reports
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
                    Total Hours
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
                    Active Projects
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
                    This Week
                  </Typography>
                  <Typography variant="h4">
                    {stats.thisWeekHours}h
                  </Typography>
                </Box>
                <Person color="info" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => window.location.href = '/employee/reports'}
          >
            Create Daily Report
          </Button>
          <Button
            variant="outlined"
            startIcon={<Assignment />}
            onClick={() => window.location.href = '/employee/projects'}
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
  );
};

export default EmployeeDashboard;
