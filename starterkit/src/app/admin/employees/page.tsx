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
  Snackbar,
} from "@mui/material";
import { Add, Edit, Delete, Person } from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/utils/axios";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

interface Employee {
  _id: string;
  username: string;
  role: string;
  email?: string;
  phone?: string;
  department?: string;
}

const EmployeeManagement = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dialog states
  const [employeeDialog, setEmployeeDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "employee",
    email: "",
    phone: "",
    department: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log(
        "👥 Fetching employees from /users endpoint with role=employee..."
      );
      const response = await axios.get("/users?role=employee");
      console.log("👥 Employees response:", response.data);
      setEmployees(response.data);
    } catch (err: any) {
      console.error("❌ Error fetching employees:", err);
      console.error("❌ Error details:", err.response?.data);
      setError(err.response?.data?.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        username: employee.username,
        password: "",
        role: employee.role,
        email: employee.email || "",
        phone: employee.phone || "",
        department: employee.department || "",
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        username: "",
        password: "",
        role: "employee",
        email: "",
        phone: "",
        department: "",
      });
    }
    setEmployeeDialog(true);
  };

  const handleCloseDialog = () => {
    setEmployeeDialog(false);
    setEditingEmployee(null);
    setFormData({
      username: "",
      password: "",
      role: "employee",
      email: "",
      phone: "",
      department: "",
    });
  };

  const handleSubmit = async () => {
    try {
      setError(""); // Clear previous errors
      console.log("💾 Submitting employee data:", formData);

      // Validate required fields
      if (!formData.username || !formData.password) {
        setError("Username and password are required");
        return;
      }

      if (editingEmployee) {
        console.log("📝 Updating employee:", editingEmployee._id);
        const response = await axios.put(
          `/users/${editingEmployee._id}`,
          formData
        );
        console.log("✅ Employee updated:", response.data);
        setSuccess("Employee updated successfully");
      } else {
        console.log("➕ Creating new employee");
        const userData = { ...formData, role: "employee" };
        console.log("📤 Sending data:", userData);
        const response = await axios.post("/users", userData);
        console.log("✅ Employee created:", response.data);
        setSuccess("Employee created successfully");
      }
      handleCloseDialog();
      fetchData();
    } catch (err: any) {
      console.error("❌ Error saving employee:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      setError(
        err.response?.data?.message || err.message || "Failed to save employee"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`/users/${id}`);
        setSuccess("Employee deleted successfully");
        fetchData();
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete employee");
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "primary";
      // case "superAdmin":
      //   return "secondary";
      case "employee":
        return "default";
      default:
        return "default";
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
    <PageContainer
      title="Employee Management"
      description="Manage employees and their information"
    >
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={5}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            color="#1976D2"
          >
            Employee Management
          </Typography>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ mb: 5 }}
          >
            Add Employee
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Actions</TableCell>
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
                  <TableCell>{employee.email || "N/A"}</TableCell>
                  <TableCell>{employee.phone || "N/A"}</TableCell>
                  <TableCell>{employee.department || "N/A"}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(employee)}
                      color="primary"
                      title="Edit Employee"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(employee._id)}
                      color="error"
                      title="Delete Employee"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Employee Dialog */}
        <Dialog
          open={employeeDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingEmployee ? "Edit Employee" : "Create New Employee"}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                required
                label="Role" // Add a label so it aligns well with the TextField elements
                fullWidth // Ensure the Select field takes full width
              >
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                {/* <MenuItem value="superAdmin">Super Admin</MenuItem> */}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Department"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingEmployee ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default EmployeeManagement;
