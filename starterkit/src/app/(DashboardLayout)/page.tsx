"use client";
import React, { useState, useEffect } from 'react';
import { Typography, CircularProgress, Box } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/app/admin/dashboard/admin-dashboard";

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  if (isLoading || authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageContainer title="Admin Dashboard" description="Admin Dashboard Overview">
      <AdminDashboard />
    </PageContainer>
  );
}