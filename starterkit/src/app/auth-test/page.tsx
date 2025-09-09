"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Alert } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

const AuthTest = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    const results = [];
    results.push(`Loading: ${loading}`);
    results.push(`Is Authenticated: ${isAuthenticated}`);
    if (user) {
      results.push(`User: ${user.username}`);
      results.push(`Role: ${user.role}`);
      results.push(`ID: ${user.id}`);
    } else {
      results.push('No user data');
    }
    setTestResults(results);
  }, [user, isAuthenticated, loading]);

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Authentication System Test
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Status
          </Typography>
          {testResults.map((result, index) => (
            <Typography key={index} variant="body2" sx={{ mb: 1 }}>
              {result}
            </Typography>
          ))}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Instructions
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            1. Go to <strong>/auth/auth1/login</strong> and login with admin credentials
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            2. Go to <strong>/auth/employee-login</strong> and login with employee credentials
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            3. Check if the authentication status updates correctly
          </Typography>
          <Typography variant="body2">
            4. Try accessing protected routes to test authorization
          </Typography>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Admin Credentials:</strong> admin / admin<br/>
          <strong>SuperAdmin Credentials:</strong> superAdmin / superAdmin<br/>
          <strong>Employee Credentials:</strong> employee1 / employee1 (create with backend script)
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={() => window.location.href = '/auth/auth1/login'}
        >
          Admin Login
        </Button>
        <Button
          variant="contained"
          onClick={() => window.location.href = '/auth/employee-login'}
        >
          Employee Login
        </Button>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
        >
          Refresh Status
        </Button>
      </Box>
    </Box>
  );
};

export default AuthTest;
