"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  PersonAdd,
  PersonRemove,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/utils/axios";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

interface Project {
  _id: string;
  name: string;
  description: string;
  employees?: (string | { _id: string; username: string })[];
}

interface Employee {
  _id: string;
  username: string;
  role: string;
}

const ProjectDetails = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dialog states
  const [projectDialog, setProjectDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [assignFormData, setAssignFormData] = useState({
    employeeId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("📋 Fetching projects and employees...");
      const [projectsRes, employeesRes] = await Promise.all([
        axios.get("/projects"),
        axios.get("/users?role=employee"),
      ]);

      console.log("📋 Projects response:", projectsRes.data);
      console.log("📋 Employees response:", employeesRes.data);
      setProjects(projectsRes.data);
      setEmployees(employeesRes.data);
    } catch (err: any) {
      console.error("❌ Error fetching data:", err);
      console.error("❌ Error details:", err.response?.data);
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProjectDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description,
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: "",
        description: "",
      });
    }
    setProjectDialog(true);
  };

  const handleCloseProjectDialog = () => {
    setProjectDialog(false);
    setEditingProject(null);
    setFormData({
      name: "",
      description: "",
    });
  };

  const handleSubmitProject = async () => {
    try {
      if (editingProject) {
        await axios.put(`/projects/${editingProject._id}`, formData);
        setSuccess("Project updated successfully");
      } else {
        await axios.post("/projects", formData);
        setSuccess("Project created successfully");
      }
      handleCloseProjectDialog();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save project");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axios.delete(`/projects/${id}`);
        setSuccess("Project deleted successfully");
        fetchData();
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete project");
      }
    }
  };

  const handleOpenAssignDialog = (project: Project) => {
    setSelectedProject(project);
    setAssignFormData({ employeeId: "" });
    setAssignDialog(true);
  };

  const handleCloseAssignDialog = () => {
    setAssignDialog(false);
    setSelectedProject(null);
    setAssignFormData({ employeeId: "" });
  };

  const handleAssignEmployee = async () => {
    if (!selectedProject || !assignFormData.employeeId) return;

    try {
      await axios.post(`/projects/${selectedProject._id}/assign`, {
        employeeId: assignFormData.employeeId,
      });
      setSuccess("Employee assigned successfully");
      handleCloseAssignDialog();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to assign employee");
    }
  };

  const handleUnassignEmployee = async (
    projectId: string,
    employeeId: string
  ) => {
    try {
      await axios.post(`/projects/${projectId}/unassign`, {
        employeeId: employeeId,
      });
      setSuccess("Employee unassigned successfully");
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to unassign employee");
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
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageContainer title="Project Details">
      <Box sx={{ pt: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" fontWeight="bold" color="#1976D2">
            Assign Employee
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenProjectDialog()}
          >
            Add Project
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccess("")}
          >
            {success}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Assigned Employees</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project._id}>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {project.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {project.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {project.employees?.map((employee) => {
                        const employeeId =
                          typeof employee === "string"
                            ? employee
                            : employee._id;
                        const employeeName =
                          typeof employee === "string"
                            ? employees.find((emp) => emp._id === employee)
                                ?.username || "Unknown"
                            : employee.username;
                        return (
                          <Chip
                            key={employeeId}
                            label={employeeName}
                            size="small"
                            color="primary"
                            onDelete={() =>
                              handleUnassignEmployee(project._id, employeeId)
                            }
                            deleteIcon={<PersonRemove />}
                          />
                        );
                      }) || (
                        <Typography variant="body2" color="text.secondary">
                          No employees assigned
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenAssignDialog(project)}
                      color="primary"
                      title="Assign Employee"
                    >
                      <PersonAdd />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenProjectDialog(project)}
                      color="primary"
                      title="Edit Project"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteProject(project._id)}
                      color="error"
                      title="Delete Project"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Project Dialog */}
        <Dialog
          open={projectDialog}
          onClose={handleCloseProjectDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingProject ? "Edit Project" : "Create New Project"}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Project Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
              multiline
              rows={4}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseProjectDialog}>Cancel</Button>
            <Button onClick={handleSubmitProject} variant="contained">
              {editingProject ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assign Employee Dialog */}
        <Dialog
          open={assignDialog}
          onClose={handleCloseAssignDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Assign Employee to {selectedProject?.name}</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Employee</InputLabel>
              <Select
                value={assignFormData.employeeId}
                onChange={(e) =>
                  setAssignFormData({
                    ...assignFormData,
                    employeeId: e.target.value,
                  })
                }
                required
              >
                {employees
                  .filter((emp) => {
                    if (!selectedProject?.employees) return true;
                    return !selectedProject.employees.some((projEmp) => {
                      const projEmpId =
                        typeof projEmp === "string" ? projEmp : projEmp._id;
                      return projEmpId === emp._id;
                    });
                  })
                  .map((employee) => (
                    <MenuItem key={employee._id} value={employee._id}>
                      {employee.username} ({employee.role})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAssignDialog}>Cancel</Button>
            <Button onClick={handleAssignEmployee} variant="contained">
              Assign
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default ProjectDetails;
