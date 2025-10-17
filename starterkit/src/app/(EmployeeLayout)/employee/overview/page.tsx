"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { Home } from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/utils/axios";

interface EmployeeStats {
  totalReports: number;
  totalHours: number;
  currentProjects: number;
  thisWeekHours: number;
}

const EmployeeOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<EmployeeStats>({
    totalReports: 0,
    totalHours: 0,
    currentProjects: 0,
    thisWeekHours: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching dashboard data for user:", user?.username);

      // Fetch employee's reports and projects
      const [reportsResponse, projectsResponse] = await Promise.all([
        axios.get("/reports"),
        axios.get("/projects"),
      ]);

      console.log("📊 Reports response:", reportsResponse.data);
      console.log("📋 Projects response:", projectsResponse.data);

      const employeeReports = reportsResponse.data;
      const assignedProjects = projectsResponse.data;

      // Calculate stats
      const totalHours = employeeReports.reduce(
        (sum: number, report: any) => sum + (report.hoursWorked || 0),
        0
      );
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      const todayReports = employeeReports.filter((report: any) => {
        const reportDate = new Date(report.date);
        return reportDate >= todayStart && reportDate < todayEnd;
      });

      const totalHoursToday = todayReports.reduce(
        (sum: number, report: any) => sum + (report.hoursWorked || 0),
        0
      );

      setStats({
        totalReports: employeeReports.length,
        totalHours: totalHours,
        currentProjects: assignedProjects.length,
        thisWeekHours: totalHoursToday,
      });
    } catch (error: any) {
      console.error("❌ Error fetching dashboard data:", error);
      console.error("Error details:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        {/* <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            href="/employee/overview"
            color="inherit"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Home sx={{ mr: 0.5, fontSize: 20 }} />
            Employee Portal
          </Link>
          <Typography color="text.primary">Overview</Typography>
        </Breadcrumbs> */}

        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome back, {user?.username}! 👋
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Here&apos;s your complete dashboard overview
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            lg: "1fr 1fr 1fr 1fr",
          },
          gap: 3,
          mb: 4,
        }}
      >
        <Card sx={{ backgroundColor: "white", border: "1px solid #e0e0e0" }}>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {stats.totalReports}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Reports
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: "white", border: "1px solid #e0e0e0" }}>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h4" fontWeight="bold" color="secondary">
                  {stats.totalHours}h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Hours
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: "white", border: "1px solid #e0e0e0" }}>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {stats.currentProjects}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Projects
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: "white", border: "1px solid #e0e0e0" }}>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {stats.thisWeekHours}h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Today&apos;s Hours
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Employee Profile Summary */}
      <Card sx={{ mb: 3, background: "white", border: "1px solid #e0e0e0" }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={3}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "#1976d2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                color: "white",
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || "E"}
            </Box>
            <Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                color="primary"
              >
                {user?.username || "Employee"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Employee ID: {user?.id || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Role: Employee
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 3,
        }}
      >
        <Card
          sx={{ cursor: "pointer", "&:hover": { boxShadow: 3 } }}
          onClick={() => (window.location.href = "/employee/projects")}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              View Projects
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and view all your assigned projects
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{ cursor: "pointer", "&:hover": { boxShadow: 3 } }}
          onClick={() => (window.location.href = "/employee/reports")}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              View Reports
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check your daily, weekly, and monthly reports
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default EmployeeOverview;
