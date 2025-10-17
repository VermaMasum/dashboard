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
  Autocomplete,
  Checkbox,
  Menu,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Pagination,
  Stack,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  PersonAdd,
  PersonRemove,
  Visibility,
  People,
  ExpandMore,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/utils/axios";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

interface Project {
  _id: string;
  name: string;
  description: string;
  status?: string;
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

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5; // Changed to 5 for better testing

  // Dialog states
  const [projectDialog, setProjectDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [viewProject, setViewProject] = useState<Project | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "not started",
    assignedEmployees: [] as string[],
  });

  const [assignFormData, setAssignFormData] = useState({
    employeeId: "",
  });

  // Popover anchor for employee checkbox list
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Search term for employee list
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      console.log(`🔍 Fetching projects - Page: ${page}, Limit: ${limit}`);
      const [projectsRes, employeesRes] = await Promise.all([
        axios.get(`/projects?page=${page}&limit=${limit}`),
        axios.get("/users?role=employee"),
      ]);

      console.log("📊 Projects API Response:", projectsRes.data);

      // Handle paginated response
      if (projectsRes.data.data) {
        console.log("✅ Paginated response detected");
        setProjects(projectsRes.data.data);
        setTotalPages(projectsRes.data.totalPages);
        setTotal(projectsRes.data.total);
      } else {
        // Fallback for non-paginated response
        console.log("⚠️ Non-paginated response, using fallback");
        const projectsData = projectsRes.data || [];
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setTotal(projectsData.length);
        setTotalPages(Math.ceil(projectsData.length / limit));
      }

      setEmployees(employeesRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [page, fetchData]);

  // ---------- NEW: handle inline status change ----------
  const handleStatusChange = async (projectId: string, newStatus: string) => {
    // optimistic UI update
    setProjects((prev) =>
      prev.map((p) => (p._id === projectId ? { ...p, status: newStatus } : p))
    );

    try {
      await axios.put(`/projects/${projectId}`, { status: newStatus });
      setSuccess("Project status updated successfully");
      // optionally re-fetch to sync additional fields:
      // fetchData();
    } catch (err: any) {
      // rollback on error
      setProjects((prev) =>
        prev.map((p) =>
          p._id === projectId
            ? { ...p, status: p.status === newStatus ? undefined : p.status }
            : p
        )
      );
      setError(err.response?.data?.message || "Failed to update status");
    }
  };
  // -----------------------------------------------------

  const handleOpenProjectDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData((prev) => ({
        ...prev,
        name: project.name,
        description: project.description,
        status: project.status || "not started",
        assignedEmployees: project.employees
          ? project.employees.map((emp) =>
              typeof emp === "string" ? emp : emp._id
            )
          : [],
      }));
    } else {
      setEditingProject(null);
      setFormData({
        name: "",
        description: "",
        status: "not started",
        assignedEmployees: [],
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
      status: "not started",
      assignedEmployees: [],
    });
    setAnchorEl(null);
    setSearchTerm("");
  };

  const handleSubmitProject = async () => {
    try {
      const { assignedEmployees, ...rest } = formData;
      const submitData = { ...rest, employees: assignedEmployees };
      if (editingProject) {
        await axios.put(`/projects/${editingProject._id}`, submitData);
        setSuccess("Project updated successfully");
      } else {
        await axios.post("/projects", submitData);
        setSuccess("Project created successfully");
        // Reset to first page when creating new project
        setPage(1);
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
      await axios.post(`/projects/${projectId}/unassign`, { employeeId });
      setSuccess("Employee unassigned successfully");
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to unassign employee");
    }
  };

  const handleOpenViewDialog = (project: Project) => {
    setViewProject(project);
    setViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setViewProject(null);
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

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setError("")}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>

        {/* Success Snackbar */}
        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={() => setSuccess("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSuccess("")}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {success}
          </Alert>
        </Snackbar>

        {/* Project Count Info */}
        <Box mb={2}>
          <Typography variant="body1" color="text.secondary">
            Total Projects: <strong>{total}</strong>
          </Typography>
        </Box>

        {/* Projects Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              {/* <TableRow>  */}
              <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Project Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Assigned Employees
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
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
                    <Typography
                      variant="body2"
                      title={project.description}
                      sx={{
                        maxWidth: 350,
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "normal",
                      }}
                    >
                      {project.description}
                    </Typography>
                  </TableCell>

                  {/* ---------- UPDATED: Inline editable status dropdown ---------- */}
                  <TableCell>
                    <FormControl
                      size="small"
                      sx={{
                        minWidth: 150,
                        borderRadius: 2,
                        // small background to mimic chip-like look
                        background:
                          project.status === "completed"
                            ? "rgba(76, 175, 80, 0.12)"
                            : project.status === "in progress"
                            ? "rgba(255, 152, 0, 0.12)"
                            : "rgba(158, 158, 158, 0.08)",
                      }}
                    >
                      <Select
                        value={project.status || "not started"}
                        onChange={(e: any) =>
                          handleStatusChange(project._id, e.target.value)
                        }
                        renderValue={(selected) => {
                          // custom label that mimics chip text
                          const label = selected || "not started";
                          return (
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color:
                                  label === "completed"
                                    ? "#2e7d32"
                                    : label === "in progress"
                                    ? "#ef6c00"
                                    : "#616161",
                              }}
                            >
                              {label}
                            </Typography>
                          );
                        }}
                        sx={{
                          "& .MuiSelect-select": {
                            paddingY: 0.5,
                            display: "flex",
                            alignItems: "center",
                          },
                          "& fieldset": { border: "none" },
                        }}
                      >
                        <MenuItem value="not started">Not Started</MenuItem>
                        <MenuItem value="in progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  {/* ------------------------------------------------------------------ */}

                  <TableCell>
                    <Typography
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <People fontSize="small" />
                      {project.employees?.length || 0} member
                      {project.employees && project.employees.length > 1
                        ? "s"
                        : ""}
                    </Typography>
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
                      onClick={() => handleOpenViewDialog(project)}
                      color="info"
                      title="View Project Details"
                    >
                      <Visibility />
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Box mt={3} display="flex" justifyContent="center">
            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Stack>
          </Box>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <Typography variant="h6" color="text.secondary">
              No projects found.Click &quot;Add Employee&quot; to create one..
            </Typography>
          </Box>
        )}

        {/* View Project Details Dialog */}
        <Dialog
          open={viewDialog}
          onClose={handleCloseViewDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Project Details</DialogTitle>
          <DialogContent dividers>
            {viewProject ? (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Name:
                </Typography>
                <Typography mb={2}>{viewProject.name}</Typography>

                <Typography variant="subtitle1" fontWeight="bold">
                  Description:
                </Typography>
                <TextField
                  value={viewProject.description}
                  multiline
                  fullWidth
                  minRows={6}
                  maxRows={12}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />

                <Typography variant="subtitle1" fontWeight="bold">
                  Status:
                </Typography>
                <Chip
                  label={viewProject.status || "not started"}
                  color={
                    viewProject.status === "completed"
                      ? "success"
                      : viewProject.status === "in progress"
                      ? "warning"
                      : "default"
                  }
                  size="small"
                  sx={{ mb: 2 }}
                />

                {/* Assigned Employees Count with View button */}
                <Typography variant="subtitle1" fontWeight="bold">
                  Assigned Employees:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  {viewProject.employees && viewProject.employees.length > 0 ? (
                    viewProject.employees.map((employee, index) => {
                      const employeeId =
                        typeof employee === "string" ? employee : employee._id;
                      const employeeName =
                        typeof employee === "string"
                          ? employees.find((e) => e._id === employee)
                              ?.username || "Unknown"
                          : employee.username;
                      return (
                        <Chip
                          key={employeeId}
                          label={employeeName}
                          size="small"
                          color="primary"
                          onDelete={() =>
                            handleUnassignEmployee(viewProject!._id, employeeId)
                          }
                          deleteIcon={<PersonRemove />}
                        />
                      );
                    })
                  ) : (
                    <Typography color="text.secondary">
                      No employees assigned
                    </Typography>
                  )}
                </Box>
              </Box>
            ) : (
              <Typography>Loading project details...</Typography>
            )}
          </DialogContent>
          {/* <DialogActions>
            <Button onClick={() => handleDeleteProject(viewProject!._id)} color="error" variant="contained">
              Delete Project
            </Button>
            <Button onClick={() => { handleCloseViewDialog(); handleOpenProjectDialog(viewProject!); }} color="primary" variant="contained">
              Edit Project
            </Button>
            <Button onClick={handleCloseViewDialog}>Close</Button>
          </DialogActions> */}
        </Dialog>

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
            <FormControl fullWidth margin="normal">
              <InputLabel>Project Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                label="Project Status"
                required
              >
                <MenuItem value="not started">Not Started</MenuItem>
                <MenuItem value="in progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>

            {/* Assigned Employees with button-triggered checkbox list */}
            <FormControl margin="normal" fullWidth>
              <Button
                variant="outlined"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                endIcon={<ExpandMore />}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorEl) ? "true" : undefined}
                aria-controls={
                  Boolean(anchorEl) ? "employee-checkbox-list" : undefined
                }
              >
                {formData.assignedEmployees.length > 0
                  ? `${formData.assignedEmployees.length} employee(s) selected`
                  : "Select Employees"}
              </Button>
              <Menu
                id="employee-checkbox-list"
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => {
                  setAnchorEl(null);
                  setSearchTerm("");
                }}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                PaperProps={{
                  style: {
                    maxHeight: 350,
                    width: 550,
                    // width: "calc(100% - 64px)",
                    padding: "10px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    boxSizing: "border-box",
                    overflow: "hidden",
                  },
                }}
              >
                <Box sx={{ p: 2, pb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ borderRadius: "8px" }}
                  />
                </Box>
                <List
                  dense
                  sx={{
                    maxHeight: 350,
                    overflowY: "auto",
                    paddingX: 0,
                    maxwidth: 350,
                  }}
                >
                  {employees
                    .filter((employee) =>
                      employee.username
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((employee) => {
                      const isChecked = formData.assignedEmployees.includes(
                        employee._id
                      );
                      return (
                        <ListItem
                          key={employee._id}
                          button
                          onClick={async () => {
                            if (editingProject) {
                              try {
                                if (isChecked) {
                                  await axios.post(
                                    `/projects/${editingProject._id}/unassign`,
                                    { employeeId: employee._id }
                                  );
                                  setFormData({
                                    ...formData,
                                    assignedEmployees:
                                      formData.assignedEmployees.filter(
                                        (id) => id !== employee._id
                                      ),
                                  });
                                } else {
                                  await axios.post(
                                    `/projects/${editingProject._id}/assign`,
                                    { employeeId: employee._id }
                                  );
                                  setFormData({
                                    ...formData,
                                    assignedEmployees: [
                                      ...formData.assignedEmployees,
                                      employee._id,
                                    ],
                                  });
                                }
                                setSuccess(
                                  "Employee assignments updated successfully"
                                );
                                fetchData();
                              } catch (err: any) {
                                setError(
                                  err.response?.data?.message ||
                                    "Failed to update employee assignments"
                                );
                              }
                            } else {
                              // For new projects, just update the form data
                              if (isChecked) {
                                setFormData({
                                  ...formData,
                                  assignedEmployees:
                                    formData.assignedEmployees.filter(
                                      (id) => id !== employee._id
                                    ),
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  assignedEmployees: [
                                    ...formData.assignedEmployees,
                                    employee._id,
                                  ],
                                });
                              }
                            }
                          }}
                        >
                          <Checkbox
                            edge="start"
                            checked={isChecked}
                            tabIndex={-1}
                            disableRipple
                          />
                          <ListItemText primary={employee.username} />
                        </ListItem>
                      );
                    })}
                </List>
              </Menu>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseProjectDialog}>Cancel</Button>
            <Button onClick={handleSubmitProject} variant="contained">
              {editingProject ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assign Employee Dialog */}
        {/* <Dialog
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
        </Dialog> */}
        {/* ✅ Assign Employees Checkbox Dialog */}

        {/* ✅ Assign Employees Checkbox Dialog with Working Search */}
        <Dialog
          open={assignDialog}
          onClose={handleCloseAssignDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Assign Employees to {selectedProject?.name}</DialogTitle>
          <DialogContent dividers>
            {/* 🔍 Search Input */}
            <Box sx={{ p: 2, pb: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ borderRadius: "8px" }}
              />
              p
            </Box>

            {/* ✅ Filtered List */}
            <List sx={{ maxHeight: 400, overflowY: "auto" }}>
              {employees
                .filter((employee) =>
                  employee.username
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
                )
                .map((employee) => {
                  const isAssigned = selectedProject?.employees?.some((emp) => {
                    const id = typeof emp === "string" ? emp : emp._id;
                    return id === employee._id;
                  });

                  return (
                    <ListItem
                      key={employee._id}
                      button
                      onClick={async () => {
                        try {
                          if (isAssigned) {
                            await axios.post(
                              `/projects/${selectedProject?._id}/unassign`,
                              { employeeId: employee._id }
                            );
                          } else {
                            await axios.post(
                              `/projects/${selectedProject?._id}/assign`,
                              { employeeId: employee._id }
                            );
                          }

                          // ✅ Update UI instantly
                          setSelectedProject((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  employees: isAssigned
                                    ? prev.employees?.filter(
                                        (emp) =>
                                          (typeof emp === "string"
                                            ? emp
                                            : emp._id) !== employee._id
                                      )
                                    : [...(prev.employees || []), employee],
                                }
                              : prev
                          );

                          fetchData();
                          setSuccess("Employee assignment updated");
                        } catch (err: any) {
                          setError(
                            err.response?.data?.message ||
                              "Failed to update assignment"
                          );
                        }
                      }}
                    >
                      <Checkbox checked={isAssigned} />
                      <ListItemText primary={employee.username} />
                    </ListItem>
                  );
                })}

              {/* No results found */}
              {employees.filter((e) =>
                e.username.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
                <Typography
                  color="text.secondary"
                  textAlign="center"
                  sx={{ p: 2 }}
                >
                  No employees found
                </Typography>
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAssignDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default ProjectDetails;

// "use client";
// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Button,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Chip,
//   Alert,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   IconButton,
//   CircularProgress,
//   Autocomplete,
//   Checkbox,
//   Menu,
//   List,
//   ListItem,
//   ListItemText,
//   Snackbar,
// } from "@mui/material";
// import {
//   Add,
//   Edit,
//   Delete,
//   PersonAdd,
//   PersonRemove,
//   Visibility,
//   People,
//   ExpandMore,
// } from "@mui/icons-material";
// import { useAuth } from "@/contexts/AuthContext";
// import axios from "@/utils/axios";
// import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

// interface Project {
//   _id: string;
//   name: string;
//   description: string;
//   status?: string;
//   employees?: (string | { _id: string; username: string })[];
// }

// interface Employee {
//   _id: string;
//   username: string;
//   role: string;
// }

// const ProjectDetails = () => {
//   const { user } = useAuth();
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // Dialog states
//   const [projectDialog, setProjectDialog] = useState(false);
//   const [assignDialog, setAssignDialog] = useState(false);
//   const [editingProject, setEditingProject] = useState<Project | null>(null);
//   const [selectedProject, setSelectedProject] = useState<Project | null>(null);
//   const [viewDialog, setViewDialog] = useState(false);
//   const [viewProject, setViewProject] = useState<Project | null>(null);

//   // Form state
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     status: "not started",
//     assignedEmployees: [] as string[],
//   });

//   const [assignFormData, setAssignFormData] = useState({
//     employeeId: "",
//   });

//   // Popover anchor for employee checkbox list
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

//   // Search term for employee list
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const [projectsRes, employeesRes] = await Promise.all([
//         axios.get("/projects"),
//         axios.get("/users?role=employee"),
//       ]);
//       setProjects(projectsRes.data);
//       setEmployees(employeesRes.data);
//     } catch (err: any) {
//       setError(err.response?.data?.message || "Failed to fetch data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOpenProjectDialog = (project?: Project) => {
//     if (project) {
//       setEditingProject(project);
//       setFormData((prev) => ({
//         ...prev,
//         name: project.name,
//         description: project.description,
//         status: project.status || "not started",
//         assignedEmployees: project.employees
//           ? project.employees.map((emp) =>
//               typeof emp === "string" ? emp : emp._id
//             )
//           : [],
//       }));
//     } else {
//       setEditingProject(null);
//       setFormData({
//         name: "",
//         description: "",
//         status: "not started",
//         assignedEmployees: [],
//       });
//     }
//     setProjectDialog(true);
//   };

//   const handleCloseProjectDialog = () => {
//     setProjectDialog(false);
//     setEditingProject(null);
//     setFormData({
//       name: "",
//       description: "",
//       status: "not started",
//       assignedEmployees: [],
//     });
//     setAnchorEl(null);
//     setSearchTerm("");
//   };

//   const handleSubmitProject = async () => {
//     try {
//       if (editingProject) {
//         await axios.put(`/projects/${editingProject._id}`, formData);
//         setSuccess("Project updated successfully");
//       } else {
//         await axios.post("/projects", formData);
//         setSuccess("Project created successfully");
//       }
//       handleCloseProjectDialog();
//       fetchData();
//     } catch (err: any) {
//       setError(err.response?.data?.message || "Failed to save project");
//     }
//   };

//   const handleDeleteProject = async (id: string) => {
//     if (window.confirm("Are you sure you want to delete this project?")) {
//       try {
//         await axios.delete(`/projects/${id}`);
//         setSuccess("Project deleted successfully");
//         fetchData();
//       } catch (err: any) {
//         setError(err.response?.data?.message || "Failed to delete project");
//       }
//     }
//   };

//   const handleOpenAssignDialog = (project: Project) => {
//     setSelectedProject(project);
//     setAssignFormData({ employeeId: "" });
//     setAssignDialog(true);
//   };

//   const handleCloseAssignDialog = () => {
//     setAssignDialog(false);
//     setSelectedProject(null);
//     setAssignFormData({ employeeId: "" });
//   };

//   const handleAssignEmployee = async () => {
//     if (!selectedProject || !assignFormData.employeeId) return;
//     try {
//       await axios.post(`/projects/${selectedProject._id}/assign`, {
//         employeeId: assignFormData.employeeId,
//       });
//       setSuccess("Employee assigned successfully");
//       handleCloseAssignDialog();
//       fetchData();
//     } catch (err: any) {
//       setError(err.response?.data?.message || "Failed to assign employee");
//     }
//   };

//   const handleUnassignEmployee = async (
//     projectId: string,
//     employeeId: string
//   ) => {
//     try {
//       await axios.post(`/projects/${projectId}/unassign`, { employeeId });
//       setSuccess("Employee unassigned successfully");
//       fetchData();
//     } catch (err: any) {
//       setError(err.response?.data?.message || "Failed to unassign employee");
//     }
//   };

//   const handleOpenViewDialog = (project: Project) => {
//     setViewProject(project);
//     setViewDialog(true);
//   };

//   const handleCloseViewDialog = () => {
//     setViewDialog(false);
//     setViewProject(null);
//   };

//   if (loading) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         minHeight="400px"
//       >
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <PageContainer title="Project Details">
//       <Box sx={{ pt: 3 }}>
//         <Box
//           display="flex"
//           justifyContent="space-between"
//           alignItems="center"
//           mb={3}
//         >
//           <Typography variant="h4" fontWeight="bold" color="#1976D2">
//             Assign Employee
//           </Typography>
//           <Button
//             variant="contained"
//             startIcon={<Add />}
//             onClick={() => handleOpenProjectDialog()}
//           >
//             Add Project
//           </Button>
//         </Box>

//         {/* Error Snackbar */}
//         <Snackbar
//           open={!!error}
//           autoHideDuration={6000}
//           onClose={() => setError("")}
//           anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//         >
//           <Alert
//             onClose={() => setError("")}
//             severity="error"
//             variant="filled"
//             sx={{ width: "100%" }}
//           >
//             {error}
//           </Alert>
//         </Snackbar>

//         {/* Success Snackbar */}
//         <Snackbar
//           open={!!success}
//           autoHideDuration={4000}
//           onClose={() => setSuccess("")}
//           anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//         >
//           <Alert
//             onClose={() => setSuccess("")}
//             severity="success"
//             variant="filled"
//             sx={{ width: "100%" }}
//           >
//             {success}
//           </Alert>
//         </Snackbar>

//         {/* Projects Table */}
//         <TableContainer component={Paper}>
//           <Table>
//             <TableHead>
//               {/* <TableRow>  */}
//               <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
//                 <TableCell sx={{ fontWeight: "bold" }}>Project Name</TableCell>
//                 <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
//                 <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
//                 <TableCell sx={{ fontWeight: "bold" }}>
//                   Assigned Employees
//                 </TableCell>
//                 <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {projects.map((project) => (
//                 <TableRow key={project._id}>
//                   <TableCell>
//                     <Typography variant="subtitle1" fontWeight="bold">
//                       {project.name}
//                     </Typography>
//                   </TableCell>
//                   <TableCell>
//                     <Typography
//                       variant="body2"
//                       title={project.description}
//                       sx={{
//                         maxWidth: 350,
//                         display: "-webkit-box",
//                         WebkitLineClamp: 1,
//                         WebkitBoxOrient: "vertical",
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                         whiteSpace: "normal",
//                       }}
//                     >
//                       {project.description}
//                     </Typography>
//                   </TableCell>
//                   <TableCell>
//                     <Chip
//                       label={project.status || "not started"}
//                       color={
//                         project.status === "completed"
//                           ? "success"
//                           : project.status === "in progress"
//                           ? "warning"
//                           : "default"
//                       }
//                       size="small"
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <Typography
//                       sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
//                     >
//                       <People fontSize="small" />
//                       {project.employees?.length || 0} member
//                       {project.employees && project.employees.length > 1
//                         ? "s"
//                         : ""}
//                     </Typography>
//                   </TableCell>
//                   <TableCell>
//                     <IconButton
//                       size="small"
//                       onClick={() => handleOpenAssignDialog(project)}
//                       color="primary"
//                       title="Assign Employee"
//                     >
//                       <PersonAdd />
//                     </IconButton>

//                     <IconButton
//                       size="small"
//                       onClick={() => handleOpenViewDialog(project)}
//                       color="info"
//                       title="View Project Details"
//                     >
//                       <Visibility />
//                     </IconButton>

//                     <IconButton
//                       size="small"
//                       onClick={() => handleOpenProjectDialog(project)}
//                       color="primary"
//                       title="Edit Project"
//                     >
//                       <Edit />
//                     </IconButton>
//                     <IconButton
//                       size="small"
//                       onClick={() => handleDeleteProject(project._id)}
//                       color="error"
//                       title="Delete Project"
//                     >
//                       <Delete />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>

//         {/* View Project Details Dialog */}
//         <Dialog
//           open={viewDialog}
//           onClose={handleCloseViewDialog}
//           maxWidth="sm"
//           fullWidth
//         >
//           <DialogTitle>Project Details</DialogTitle>
//           <DialogContent dividers>
//             {viewProject ? (
//               <Box>
//                 <Typography variant="subtitle1" fontWeight="bold">
//                   Name:
//                 </Typography>
//                 <Typography mb={2}>{viewProject.name}</Typography>

//                 <Typography variant="subtitle1" fontWeight="bold">
//                   Description:
//                 </Typography>
//                 <TextField
//                   value={viewProject.description}
//                   multiline
//                   fullWidth
//                   minRows={6}
//                   maxRows={12}
//                   InputProps={{
//                     readOnly: true,
//                   }}
//                   variant="outlined"
//                   sx={{ mb: 2 }}
//                 />

//                 <Typography variant="subtitle1" fontWeight="bold">
//                   Status:
//                 </Typography>
//                 <Chip
//                   label={viewProject.status || "not started"}
//                   color={
//                     viewProject.status === "completed"
//                       ? "success"
//                       : viewProject.status === "in progress"
//                       ? "warning"
//                       : "default"
//                   }
//                   size="small"
//                   sx={{ mb: 2 }}
//                 />

//                 {/* Assigned Employees Count with View button */}
//                 <Typography variant="subtitle1" fontWeight="bold">
//                   Assigned Employees:
//                 </Typography>
//                 <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
//                   {viewProject.employees && viewProject.employees.length > 0 ? (
//                     viewProject.employees.map((employee, index) => {
//                       const employeeId =
//                         typeof employee === "string" ? employee : employee._id;
//                       const employeeName =
//                         typeof employee === "string"
//                           ? employees.find((e) => e._id === employee)
//                               ?.username || "Unknown"
//                           : employee.username;
//                       return (
//                         <Chip
//                           key={employeeId}
//                           label={employeeName}
//                           size="small"
//                           color="primary"
//                           onDelete={() =>
//                             handleUnassignEmployee(viewProject!._id, employeeId)
//                           }
//                           deleteIcon={<PersonRemove />}
//                         />
//                       );
//                     })
//                   ) : (
//                     <Typography color="text.secondary">
//                       No employees assigned
//                     </Typography>
//                   )}
//                 </Box>
//               </Box>
//             ) : (
//               <Typography>Loading project details...</Typography>
//             )}
//           </DialogContent>
//           {/* <DialogActions>
//             <Button onClick={() => handleDeleteProject(viewProject!._id)} color="error" variant="contained">
//               Delete Project
//             </Button>
//             <Button onClick={() => { handleCloseViewDialog(); handleOpenProjectDialog(viewProject!); }} color="primary" variant="contained">
//               Edit Project
//             </Button>
//             <Button onClick={handleCloseViewDialog}>Close</Button>
//           </DialogActions> */}
//         </Dialog>

//         {/* Project Dialog */}
//         <Dialog
//           open={projectDialog}
//           onClose={handleCloseProjectDialog}
//           maxWidth="sm"
//           fullWidth
//         >
//           <DialogTitle>
//             {editingProject ? "Edit Project" : "Create New Project"}
//           </DialogTitle>
//           <DialogContent>
//             <TextField
//               fullWidth
//               label="Project Name"
//               value={formData.name}
//               onChange={(e) =>
//                 setFormData({ ...formData, name: e.target.value })
//               }
//               margin="normal"
//               required
//             />
//             <TextField
//               fullWidth
//               label="Description"
//               value={formData.description}
//               onChange={(e) =>
//                 setFormData({ ...formData, description: e.target.value })
//               }
//               margin="normal"
//               multiline
//               rows={4}
//               required
//             />
//             <FormControl fullWidth margin="normal">
//               <InputLabel>Project Status</InputLabel>
//               <Select
//                 value={formData.status}
//                 onChange={(e) =>
//                   setFormData({ ...formData, status: e.target.value })
//                 }
//                 label="Project Status"
//                 required
//               >
//                 <MenuItem value="not started">Not Started</MenuItem>
//                 <MenuItem value="in progress">In Progress</MenuItem>
//                 <MenuItem value="completed">Completed</MenuItem>
//               </Select>
//             </FormControl>

//             {/* Assigned Employees with button-triggered checkbox list */}
//             <FormControl margin="normal" fullWidth>
//               <Button
//                 variant="outlined"
//                 onClick={(e) => setAnchorEl(e.currentTarget)}
//                 endIcon={<ExpandMore />}
//                 aria-haspopup="true"
//                 aria-expanded={Boolean(anchorEl) ? "true" : undefined}
//                 aria-controls={
//                   Boolean(anchorEl) ? "employee-checkbox-list" : undefined
//                 }
//               >
//                 {formData.assignedEmployees.length > 0
//                   ? `${formData.assignedEmployees.length} employee(s) selected`
//                   : "Select Employees"}
//               </Button>
//               <Menu
//                 id="employee-checkbox-list"
//                 open={Boolean(anchorEl)}
//                 anchorEl={anchorEl}
//                 onClose={() => {
//                   setAnchorEl(null);
//                   setSearchTerm("");
//                 }}
//                 anchorOrigin={{
//                   vertical: "top",
//                   horizontal: "left",
//                 }}
//                 transformOrigin={{
//                   vertical: "bottom",
//                   horizontal: "left",
//                 }}
//                 PaperProps={{
//                   style: {
//                     maxHeight: 350,
//                     width: 550,
//                     // width: "calc(100% - 64px)",
//                     padding: "10px",
//                     borderRadius: "8px",
//                     boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//                     boxSizing: "border-box",
//                     overflow: "hidden",
//                   },
//                 }}
//               >
//                 <Box sx={{ p: 2, pb: 1 }}>
//                   <TextField
//                     fullWidth
//                     size="small"
//                     placeholder="Search employees..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     sx={{ borderRadius: "8px" }}
//                   />
//                 </Box>
//                 <List
//                   dense
//                   sx={{
//                     maxHeight: 350,
//                     overflowY: "auto",
//                     paddingX: 0,
//                     maxwidth: 350,
//                   }}
//                 >
//                   {employees
//                     .filter((employee) =>
//                       employee.username
//                         .toLowerCase()
//                         .includes(searchTerm.toLowerCase())
//                     )
//                     .map((employee) => {
//                       const isChecked = formData.assignedEmployees.includes(
//                         employee._id
//                       );
//                       return (
//                         <ListItem
//                           key={employee._id}
//                           button
//                           onClick={async () => {
//                             try {
//                               if (isChecked) {
//                                 await axios.post(
//                                   `/projects/${editingProject?._id}/unassign`,
//                                   { employeeId: employee._id }
//                                 );
//                                 setFormData({
//                                   ...formData,
//                                   assignedEmployees:
//                                     formData.assignedEmployees.filter(
//                                       (id) => id !== employee._id
//                                     ),
//                                 });
//                               } else {
//                                 await axios.post(
//                                   `/projects/${editingProject?._id}/assign`,
//                                   { employeeId: employee._id }
//                                 );
//                                 setFormData({
//                                   ...formData,
//                                   assignedEmployees: [
//                                     ...formData.assignedEmployees,
//                                     employee._id,
//                                   ],
//                                 });
//                               }
//                               setSuccess(
//                                 "Employee assignments updated successfully"
//                               );
//                               fetchData();
//                             } catch (err: any) {
//                               setError(
//                                 err.response?.data?.message ||
//                                   "Failed to update employee assignments"
//                               );
//                             }
//                           }}
//                         >
//                           <Checkbox
//                             edge="start"
//                             checked={isChecked}
//                             tabIndex={-1}
//                             disableRipple
//                           />
//                           <ListItemText primary={employee.username} />
//                         </ListItem>
//                       );
//                     })}
//                 </List>
//               </Menu>
//             </FormControl>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleCloseProjectDialog}>Cancel</Button>
//             <Button onClick={handleSubmitProject} variant="contained">
//               {editingProject ? "Update" : "Create"}
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Assign Employee Dialog */}
//         {/* <Dialog
//           open={assignDialog}
//           onClose={handleCloseAssignDialog}
//           maxWidth="sm"
//           fullWidth
//         >
//           <DialogTitle>Assign Employee to {selectedProject?.name}</DialogTitle>
//           <DialogContent>
//             <FormControl fullWidth margin="normal">
//               <InputLabel>Select Employee</InputLabel>
//               <Select
//                 value={assignFormData.employeeId}
//                 onChange={(e) =>
//                   setAssignFormData({
//                     ...assignFormData,
//                     employeeId: e.target.value,
//                   })
//                 }
//                 required
//               >
//                 {employees
//                   .filter((emp) => {
//                     if (!selectedProject?.employees) return true;
//                     return !selectedProject.employees.some((projEmp) => {
//                       const projEmpId =
//                         typeof projEmp === "string" ? projEmp : projEmp._id;
//                       return projEmpId === emp._id;
//                     });
//                   })
//                   .map((employee) => (
//                     <MenuItem key={employee._id} value={employee._id}>
//                       {employee.username} ({employee.role})
//                     </MenuItem>
//                   ))}
//               </Select>
//             </FormControl>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleCloseAssignDialog}>Cancel</Button>
//             <Button onClick={handleAssignEmployee} variant="contained">
//               Assign
//             </Button>
//           </DialogActions>
//         </Dialog> */}
//         {/* ✅ Assign Employees Checkbox Dialog */}

//         {/* ✅ Assign Employees Checkbox Dialog with Working Search */}
//         <Dialog
//           open={assignDialog}
//           onClose={handleCloseAssignDialog}
//           maxWidth="sm"
//           fullWidth
//         >
//           <DialogTitle>Assign Employees to {selectedProject?.name}</DialogTitle>
//           <DialogContent dividers>
//             {/* 🔍 Search Input */}
//             <Box sx={{ p: 2, pb: 1 }}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 placeholder="Search employees..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 sx={{ borderRadius: "8px" }}
//               />
//             </Box>

//             {/* ✅ Filtered List */}
//             <List sx={{ maxHeight: 400, overflowY: "auto" }}>
//               {employees
//                 .filter((employee) =>
//                   employee.username
//                     ?.toLowerCase()
//                     .includes(searchTerm.toLowerCase())
//                 )
//                 .map((employee) => {
//                   const isAssigned = selectedProject?.employees?.some((emp) => {
//                     const id = typeof emp === "string" ? emp : emp._id;
//                     return id === employee._id;
//                   });

//                   return (
//                     <ListItem
//                       key={employee._id}
//                       button
//                       onClick={async () => {
//                         try {
//                           if (isAssigned) {
//                             await axios.post(
//                               `/projects/${selectedProject?._id}/unassign`,
//                               { employeeId: employee._id }
//                             );
//                           } else {
//                             await axios.post(
//                               `/projects/${selectedProject?._id}/assign`,
//                               { employeeId: employee._id }
//                             );
//                           }

//                           // ✅ Update UI instantly
//                           setSelectedProject((prev) =>
//                             prev
//                               ? {
//                                   ...prev,
//                                   employees: isAssigned
//                                     ? prev.employees?.filter(
//                                         (emp) =>
//                                           (typeof emp === "string"
//                                             ? emp
//                                             : emp._id) !== employee._id
//                                       )
//                                     : [...(prev.employees || []), employee],
//                                 }
//                               : prev
//                           );

//                           fetchData();
//                           setSuccess("Employee assignment updated");
//                         } catch (err: any) {
//                           setError(
//                             err.response?.data?.message ||
//                               "Failed to update assignment"
//                           );
//                         }
//                       }}
//                     >
//                       <Checkbox checked={isAssigned} />
//                       <ListItemText primary={employee.username} />
//                     </ListItem>
//                   );
//                 })}

//               {/* ❌ No results found */}
//               {employees.filter((e) =>
//                 e.username.toLowerCase().includes(searchTerm.toLowerCase())
//               ).length === 0 && (
//                 <Typography
//                   color="text.secondary"
//                   textAlign="center"
//                   sx={{ p: 2 }}
//                 >
//                   No employees found
//                 </Typography>
//               )}
//             </List>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleCloseAssignDialog}>Close</Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </PageContainer>
//   );
// };

// export default ProjectDetails;
