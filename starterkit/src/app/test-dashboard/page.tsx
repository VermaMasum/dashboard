"use client";
import React from 'react';
import { Box, Typography, Button, Card, CardContent, Alert } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/contexts/ContentContext';

const TestDashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { currentContent, setCurrentContent } = useContent();

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Test Page
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Authentication Status
          </Typography>
          <Typography>Loading: {loading ? 'Yes' : 'No'}</Typography>
          <Typography>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Typography>
          {user && (
            <>
              <Typography>Username: {user.username}</Typography>
              <Typography>Role: {user.role}</Typography>
              <Typography>User ID: {user.id}</Typography>
            </>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Content Context Status
          </Typography>
          <Typography>Current Content: {currentContent}</Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Navigation
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setCurrentContent('dashboard')}
            >
              Dashboard
            </Button>
            <Button
              variant="outlined"
              onClick={() => setCurrentContent('project-details')}
            >
              Project Details
            </Button>
            <Button
              variant="outlined"
              onClick={() => setCurrentContent('daily-reports')}
            >
              Daily Reports
            </Button>
            <Button
              variant="outlined"
              onClick={() => setCurrentContent('employees')}
            >
              Employee Management
            </Button>
            {user?.role === 'superAdmin' && (
              <Button
                variant="outlined"
                onClick={() => setCurrentContent('employee-list')}
              >
                Employee List
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info">
        <Typography variant="body2">
          <strong>Instructions:</strong><br/>
          1. Login with admin credentials (admin/admin or superAdmin/superAdmin)<br/>
          2. Use the navigation buttons above to test content switching<br/>
          3. Check if the sidebar navigation works correctly<br/>
          4. Verify that role-based menu items are shown/hidden properly
        </Typography>
      </Alert>
    </Box>
  );
};

export default TestDashboard;
