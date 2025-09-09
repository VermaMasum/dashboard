"use client";
import React, { useState, useEffect } from 'react';
import { Typography, CircularProgress, Box } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import Breadcrumb from "@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import { useAuth } from "@/contexts/AuthContext";
import { useContent } from "@/contexts/ContentContext";
import AdminDashboard from "@/app/admin/dashboard/page";
import ProjectDetails from "@/app/admin/project-details/page";
import DailyReports from "@/app/admin/daily-reports/page";
import EmployeeManagement from "@/app/admin/employees/page";
import EmployeeList from "@/app/admin/employee-list/page";
import EmployeeDashboard from "@/app/employee/dashboard/page";

const BCrumb = [
  {
    to: "/",
    title: "Dashboard",
  },
];

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);
  const { currentContent } = useContent();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  const renderContent = () => {
    switch (currentContent) {
      case 'project-details':
        return <ProjectDetails />;
      case 'daily-reports':
        return <DailyReports />;
      case 'employees':
        return <EmployeeManagement />;
      case 'employee-list':
        return <EmployeeList />;
      case 'EmployeeDashboard':
        return <EmployeeDashboard />;
      default:
        // Check user role to show appropriate dashboard
        if (user?.role === 'employee') {
          return <EmployeeDashboard />;
        }
        return <AdminDashboard />;
    }
  };

  const getPageTitle = () => {
    switch (currentContent) {
      case 'project-details':
        return 'Project Details';
      case 'daily-reports':
        return 'Daily Reports';
      case 'employees':
        return 'Employee Management';
      case 'employee-list':
        return 'Employee List';
      default:
        return 'Admin Dashboard';
    }
  };

  const getBreadcrumbItems = () => {
    const baseItems = [
      {
        to: "/",
        title: "Dashboard",
      },
    ];

    if (currentContent !== 'dashboard') {
      baseItems.push({
        title: getPageTitle(),
      });
    }

    return baseItems;
  };

  if (isLoading || authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageContainer title={getPageTitle()} description="Admin Dashboard">
      <Breadcrumb title={getPageTitle()} items={getBreadcrumbItems()} />
      {renderContent()}
    </PageContainer>
  );
}
