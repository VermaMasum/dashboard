"use client";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person,
  Email,
  Work,
  Schedule,
  Assessment,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

interface EmployeeProfile {
  _id: string;
  username: string;
  role: string;
  createdAt: string;
}

interface ProfileStats {
  totalReports: number;
  totalHours: number;
  totalProjects: number;
  averageHoursPerDay: number;
}

const EmployeeProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    totalReports: 0,
    totalHours: 0,
    totalProjects: 0,
    averageHoursPerDay: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch employee profile (using current user data)
      if (user) {
        setProfile({
          _id: user.id,
          username: user.username,
          role: user.role,
          createdAt: new Date().toISOString(), // You might want to get this from the actual employee data
        });
      }

      // Fetch employee's reports for stats
      const reportsResponse = await axios.get('/reports');
      const employeeReports = reportsResponse.data.filter((report: any) => 
        report.employee && report.employee._id === user?.id
      );

      // Calculate stats
      const totalReports = employeeReports.length;
      const totalHours = employeeReports.reduce((sum: number, report: any) => sum + report.hoursWorked, 0);
      const uniqueProjects = new Set(employeeReports.map((report: any) => report.project?._id).filter(Boolean));
      const totalProjects = uniqueProjects.size;
      
      // Calculate average hours per day (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentReports = employeeReports.filter((report: any) => 
        new Date(report.date) >= thirtyDaysAgo
      );
      const averageHoursPerDay = recentReports.length > 0 
        ? Math.round((recentReports.reduce((sum: number, report: any) => sum + report.hoursWorked, 0) / 30) * 10) / 10
        : 0;

      setStats({
        totalReports,
        totalHours,
        totalProjects,
        averageHoursPerDay,
      });

    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditData({
      username: profile?.username || '',
    });
    setEditDialog(true);
  };

  const handleSaveProfile = async () => {
    try {
      // Here you would typically update the employee profile
      // For now, we'll just update the local state
      if (profile) {
        setProfile({
          ...profile,
          username: editData.username,
        });
      }
      setEditDialog(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading your profile...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Manage your profile information and view your work statistics.
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                <Avatar
                  src="/images/profile/user2.jpg"
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  {profile?.username}
                </Typography>
                <Chip 
                  label={profile?.role || 'Employee'} 
                  color="primary" 
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={handleEditProfile}
                  fullWidth
                >
                  Edit Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Person color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Username"
                    secondary={profile?.username}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Email color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary="employee@example.com"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Work color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Role"
                    secondary={profile?.role || 'Employee'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Schedule color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Member Since"
                    secondary={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Work Statistics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Work Statistics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary" gutterBottom>
                      {stats.totalReports}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Reports
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main" gutterBottom>
                      {stats.totalHours}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Hours
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main" gutterBottom>
                      {stats.totalProjects}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Projects Worked
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main" gutterBottom>
                      {stats.averageHoursPerDay}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Hours/Day
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Username"
            value={editData.username}
            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveProfile} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeProfile;
