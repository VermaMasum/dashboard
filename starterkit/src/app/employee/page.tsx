"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function EmployeePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user?.role === 'employee') {
        // Redirect to employee dashboard
        router.push('/employee/dashboard');
      } else {
        // Redirect to appropriate login page
        router.push('/auth/employee-login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      flexDirection="column"
      gap={2}
    >
      <Typography>Redirecting...</Typography>
    </Box>
  );
}
