"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Box, Typography, CircularProgress } from '@mui/material';

interface EmployeeProtectedRouteProps {
  children: React.ReactNode;
}

const EmployeeProtectedRoute: React.FC<EmployeeProtectedRouteProps> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.push('/auth/employee-login');
        return;
      }
      if (user && user.role !== 'employee') {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'admin' || user.role === 'superAdmin') {
          router.push('/');
        } else {
          router.push('/auth/employee-login');
        }
        return;
      }
    }
  }, [user, loading, isAuthenticated, router]);

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

  if (!isAuthenticated || !user || user.role !== 'employee') {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        flexDirection="column"
        gap={2}
      >
        <Typography variant="h6">Access Denied</Typography>
        <Typography color="text.secondary">
          Only employees can access this page.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default EmployeeProtectedRoute;
