"use client";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Snackbar,
} from "@mui/material";
import {
  People,
  Assignment,
  Work,
  TrendingUp,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/utils/axios";

interface AdminStats {
  totalUsers: number;
  totalEmployees: number;
  totalAdmins: number;
  totalSuperAdmins: number;
  totalProjects: number;
  totalReports: number;
}

interface RecentReport {
  id: string;
  title: string;
  employee: string;
  date: string;
  hoursWorked: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalEmployees: 0,
    totalAdmins: 0,
    totalSuperAdmins: 0,
    totalProjects: 0,
    totalReports: 0,
  });
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      console.log('📊 Fetching admin dashboard data...');

      // Use fallback approach directly (simpler and more reliable)
      console.log('📊 Making parallel API calls...');
      const [usersRes, projectsRes, reportsRes] = await Promise.all([
        axios.get('/users/all'),
        axios.get('/projects'),
        axios.get('/reports')
      ]);

      console.log('📊 API calls completed, processing data...');
      const allUsers = usersRes.data.all || usersRes.data;
      const projects = projectsRes.data;
      const reports = reportsRes.data;

      // Calculate statistics
      const userStats = {
        total: allUsers.length,
        employee: allUsers.filter((user: any) => user.role === 'employee').length,
        admin: allUsers.filter((user: any) => user.role === 'admin').length,
        superAdmin: allUsers.filter((user: any) => user.role === 'superAdmin').length,
      };

      setStats({
        totalUsers: userStats.total,
        totalEmployees: userStats.employee,
        totalAdmins: userStats.admin,
        totalSuperAdmins: userStats.superAdmin,
        totalProjects: projects.length,
        totalReports: reports.length,
      });

      // Get recent reports (last 5)
      const recentReports = reports
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map((report: any) => ({
          id: report._id,
          title: report.title || 'Daily Report',
          employee: report.employee?.username || 'Unknown',
          date: report.date,
          hoursWorked: report.hoursWorked || 0,
        }));

      setRecentReports(recentReports);
      console.log('✅ Dashboard data loaded successfully');
    } catch (error: any) {
      console.error('❌ Error fetching dashboard data:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setError('')}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Users
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`${stats.totalEmployees} Employees`} 
                  size="small" 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  label={`${stats.totalAdmins} Admins`} 
                  size="small" 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Projects */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Work sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalProjects}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Projects
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Reports */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Assignment sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalReports}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Reports
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Status */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Active
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    System Status
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Reports */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Recent Reports
          </Typography>
          {recentReports.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No recent reports found.
            </Typography>
          ) : (
            <List>
              {recentReports.map((report, index) => (
                <ListItem
                  key={report.id}
                  sx={{
                    borderBottom: index < recentReports.length - 1 ? '1px solid #e0e0e0' : 'none',
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight="bold">
                          {report.title}
                        </Typography>
                        <Chip 
                          label={`${report.hoursWorked}h`} 
                          size="small" 
                          color="primary"
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {report.employee} • {new Date(report.date).toLocaleDateString()}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}