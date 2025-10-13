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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from '@mui/material';
import { Visibility, People, AccessTime } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import axios from '@/utils/axios';

interface Project {
  _id: string;
  name: string;
  description: string;
  date: string;
  employees: Array<{
    _id: string;
    username: string;
  }>;
  createdAt: string;
  status: "not started" | "in progress" | "completed";
}

interface Report {
  _id: string;
  project: {
    _id: string;
    name: string;
  };
  date: string;
  details: string;
  hoursWorked: number;
  employee: {
    _id: string;
    username: string;
  };
}

const EmployeeProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectDetailsOpen, setProjectDetailsOpen] = useState(false);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState<Project | null>(null);
  const [projectReportsForModal, setProjectReportsForModal] = useState<Report[]>([]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching projects data for user:', user?.username);
      
      const [projectsResponse, reportsResponse] = await Promise.all([
        axios.get('/projects'),
        axios.get('/reports'),
      ]);

      console.log('📋 Projects response:', projectsResponse.data);
      console.log('📊 Reports response:', reportsResponse.data);

      setProjects(projectsResponse.data);
      setReports(reportsResponse.data);
    } catch (error: any) {
      console.error('❌ Error fetching data:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateProjectTotalHours = (projectId: string) => {
    return reports
      .filter(report => report.project && report.project._id === projectId)
      .reduce((total, report) => total + (report.hoursWorked || 0), 0);
  };

  const handleViewProjectDetails = async (project: Project) => {
    try {
      setSelectedProjectDetails(project);
      
      // Fetch reports for this specific project
      const projectReportsResponse = await axios.get(`/reports?project=${project._id}`);
      setProjectReportsForModal(projectReportsResponse.data);
      
      setProjectDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

  const handleCloseProjectDetails = () => {
    setProjectDetailsOpen(false);
    setSelectedProjectDetails(null);
    setProjectReportsForModal([]);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Projects
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage and view all your assigned projects
        </Typography>
      </Box>

      {/* Projects Table */}
      {projects.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" textAlign="center" py={4}>
              No projects assigned to you yet.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Project Name</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Created Date</strong></TableCell>
                  <TableCell><strong>Team Members</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Total Hours</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {project.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block'
                        }}
                      >
                        {project.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {project.date ? new Date(project.date).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <People fontSize="small" color="action" />
                        <Typography variant="body2">
                          {project.employees ? project.employees.length : 0} member(s)
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={project.status ? project.status.toUpperCase() : "UNKNOWN"}
                        size="small"
                        sx={{
                          backgroundColor: project.status === "completed" ? "#4caf50" :
                            project.status === "in progress" ? "#ff9800" :
                            project.status === "not started" ? "#f44336" : "#9e9e9e",
                          color: "white",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          fontSize: "0.75rem",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          display: "inline-block",
                          minWidth: 80,
                          textAlign: "center",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight="medium">
                          {calculateProjectTotalHours(project._id)}h
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewProjectDetails(project)}
                        title="View Details"
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Project Details Dialog */}
      <Dialog
        open={projectDetailsOpen}
        onClose={handleCloseProjectDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Project Details: {selectedProjectDetails?.name}
        </DialogTitle>
        <DialogContent>
          {selectedProjectDetails && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Description:
              </Typography>
              <Box
                sx={{
                  maxHeight: 200,
                  overflowY: "auto",
                  paddingRight: 1,
                  backgroundColor: "#f9f9f9",
                  borderRadius: 1,
                  border: "1px solid #ddd",
                  whiteSpace: "pre-wrap",
                  mb: 2,
                }}
              >
                <Typography sx={{ p: 1 }}>
                  {selectedProjectDetails.description}
                </Typography>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Created Date
                  </Typography>
                  <Typography variant="body1">
                    {selectedProjectDetails.date ? new Date(selectedProjectDetails.date).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Team Members
                  </Typography>
                  {selectedProjectDetails.employees && selectedProjectDetails.employees.length > 0 ? (
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {selectedProjectDetails.employees.map((employee) => (
                        <Chip
                          key={employee._id}
                          label={employee.username}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontSize: '0.75rem',
                            height: '24px'
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No members assigned
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Hours
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" color="primary">
                    {calculateProjectTotalHours(selectedProjectDetails._id)}h
                  </Typography>
                </Box>
              </Box>
              
              {/* Project Reports */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Project Reports ({projectReportsForModal.length})
                  </Typography>
                  {projectReportsForModal.length === 0 ? (
                    <Typography color="text.secondary" textAlign="center" py={2}>
                      No reports found for this project.
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Employee</TableCell>
                            <TableCell>Hours</TableCell>
                            <TableCell>Description</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {projectReportsForModal.map((report) => (
                            <TableRow key={report._id}>
                              <TableCell>
                                {new Date(report.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={report.employee?.username || 'Unknown'}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {report.hoursWorked}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ maxWidth: 200 }}>
                                  {report.details}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProjectDetails} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeProjects;