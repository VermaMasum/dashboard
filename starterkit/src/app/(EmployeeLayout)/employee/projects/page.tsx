"use client";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
} from '@mui/material';
import {
  Work,
  Assignment,
  Person,
  Schedule,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import axios from '@/utils/axios';

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

interface ProjectReport {
  _id: string;
  date: string;
  project: {
    _id: string;
    name: string;
  };
  details: string;
  hoursWorked: number;
}

const EmployeeProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectReports, setProjectReports] = useState<ProjectReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching employee projects data for:', user?.username);
      
      // Fetch all projects and reports
      const [projectsResponse, reportsResponse] = await Promise.all([
        axios.get('/projects'),
        axios.get('/reports'),
      ]);

      console.log('📊 All projects response:', projectsResponse.data);
      console.log('📊 All reports response:', reportsResponse.data);

      // Filter projects assigned to current employee
      const assignedProjects = projectsResponse.data.filter((project: any) => 
        project.employees && project.employees.includes(user?._id)
      );

      // Filter employee's reports
      const employeeReports = reportsResponse.data.filter((report: any) => 
        report.employee && report.employee._id === user?._id
      );

      console.log('📊 Assigned projects:', assignedProjects);
      console.log('📊 Employee reports:', employeeReports);

      setProjects(assignedProjects);
      setProjectReports(employeeReports);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get projects that the employee has worked on
  const getEmployeeProjects = () => {
    const workedOnProjectIds = new Set(projectReports.map(report => report.project._id));
    return projects.filter(project => workedOnProjectIds.has(project._id));
  };

  // Get project statistics
  const getProjectStats = (projectId: string) => {
    const projectReportsList = projectReports.filter(report => report.project._id === projectId);
    const totalHours = projectReportsList.reduce((sum, report) => sum + report.hoursWorked, 0);
    const totalReports = projectReportsList.length;
    const lastWorked = projectReportsList.length > 0 
      ? new Date(Math.max(...projectReportsList.map(r => new Date(r.date).getTime())))
      : null;

    return { totalHours, totalReports, lastWorked };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading your projects...</Typography>
      </Box>
    );
  }

  const employeeProjects = getEmployeeProjects();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Projects
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Projects you have worked on and your contribution to each project.
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Projects
                  </Typography>
                  <Typography variant="h4">
                    {employeeProjects.length}
                  </Typography>
                </Box>
                <Work color="primary" />
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
                    Total Hours
                  </Typography>
                  <Typography variant="h4">
                    {projectReports.reduce((sum, report) => sum + report.hoursWorked, 0)}
                  </Typography>
                </Box>
                <Schedule color="success" />
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
                    Total Reports
                  </Typography>
                  <Typography variant="h4">
                    {projectReports.length}
                  </Typography>
                </Box>
                <Assignment color="warning" />
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
                    Avg Hours/Project
                  </Typography>
                  <Typography variant="h4">
                    {employeeProjects.length > 0 
                      ? Math.round(projectReports.reduce((sum, report) => sum + report.hoursWorked, 0) / employeeProjects.length)
                      : 0
                    }
                  </Typography>
                </Box>
                <Person color="info" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Projects List */}
      {employeeProjects.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Work sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Projects Yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You haven't worked on any projects yet. Start by creating your first daily report!
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {employeeProjects.map((project) => {
            const stats = getProjectStats(project._id);
            return (
              <Grid item xs={12} md={6} key={project._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" gutterBottom>
                        {project.name}
                      </Typography>
                      <Chip 
                        label={project.status || 'Active'} 
                        color="primary" 
                        size="small" 
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" mb={3}>
                      {project.description || 'No description available'}
                    </Typography>

                    <Box display="flex" gap={2} mb={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total Hours
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {stats.totalHours}h
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Reports
                        </Typography>
                        <Typography variant="h6" color="secondary">
                          {stats.totalReports}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Last Worked
                        </Typography>
                        <Typography variant="body2">
                          {stats.lastWorked 
                            ? stats.lastWorked.toLocaleDateString()
                            : 'Never'
                          }
                        </Typography>
                      </Box>
                    </Box>

                    {/* Recent Reports for this project */}
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Recent Reports
                      </Typography>
                      {projectReports
                        .filter(report => report.project._id === project._id)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 3)
                        .map((report) => (
                          <Box key={report._id} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                            <Typography variant="body2" noWrap sx={{ flex: 1, mr: 2 }}>
                              {report.details}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {report.hoursWorked}h
                            </Typography>
                          </Box>
                        ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* All Available Projects */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          All Available Projects
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Complete list of all projects in the system.
        </Typography>
        
        <Paper>
          <List>
            {projects.map((project, index) => (
              <ListItem key={project._id} divider={index < projects.length - 1}>
                <ListItemIcon>
                  <Work color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1">
                        {project.name}
                      </Typography>
                      <Chip 
                        label={project.status || 'Active'} 
                        size="small" 
                        color={employeeProjects.some(p => p._id === project._id) ? 'primary' : 'default'}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {project.description || 'No description available'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(project.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default EmployeeProjects;
