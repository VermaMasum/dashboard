"use client";
import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const TestAuth = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Authentication Test Page
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Authentication Status
          </Typography>
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

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={() => router.push('/auth/auth1/login')}
        >
          Go to Admin Login
        </Button>
        <Button
          variant="contained"
          onClick={() => router.push('/auth/employee-login')}
        >
          Go to Employee Login
        </Button>
        <Button
          variant="contained"
          onClick={() => router.push('/')}
        >
          Go to Admin Dashboard
        </Button>
        <Button
          variant="contained"
          onClick={() => router.push('/employee/dashboard')}
        >
          Go to Employee Dashboard
        </Button>
        {isAuthenticated && (
          <Button
            variant="outlined"
            color="error"
            onClick={logout}
          >
            Logout
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default TestAuth;