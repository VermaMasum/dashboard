"use client";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Person,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import axios from '@/utils/axios';

interface Employee {
  _id: string;
  username: string;
  role: string;
  email?: string;
  phone?: string;
  department?: string;
}

const EmployeeList = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/users?role=employee');
      setEmployees(response.data);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError(err.response?.data?.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'primary';
      case 'superAdmin': return 'secondary';
      case 'employee': return 'default';
      default: return 'default';
    }
  };

  const getRoleStats = () => {
    const stats = {
      total: employees.length,
      admin: employees.filter(emp => emp.role === 'admin').length,
      superAdmin: employees.filter(emp => emp.role === 'superAdmin').length,
      employee: employees.filter(emp => emp.role === 'employee').length,
    };
    return stats;
  };

  const stats = getRoleStats();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Employee List
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Employees
                  </Typography>
                  <Typography variant="h4">
                    {stats.total}
                  </Typography>
                </Box>
                <Person color="primary" />
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
                    Regular Employees
                  </Typography>
                  <Typography variant="h4">
                    {stats.employee}
                  </Typography>
                </Box>
                <Person color="default" />
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
                    Admins
                  </Typography>
                  <Typography variant="h4">
                    {stats.admin}
                  </Typography>
                </Box>
                <Person color="primary" />
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
                    Super Admins
                  </Typography>
                  <Typography variant="h4">
                    {stats.superAdmin}
                  </Typography>
                </Box>
                <Person color="secondary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Department</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee._id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Person />
                    <Typography variant="subtitle1" fontWeight="bold">
                      {employee.username}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={employee.role} 
                    size="small" 
                    color={getRoleColor(employee.role) as any}
                  />
                </TableCell>
                <TableCell>{employee.email || 'N/A'}</TableCell>
                <TableCell>{employee.phone || 'N/A'}</TableCell>
                <TableCell>{employee.department || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EmployeeList;