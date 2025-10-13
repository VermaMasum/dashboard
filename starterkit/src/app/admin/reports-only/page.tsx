"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { Assessment, Refresh, Search, Person } from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/utils/axios";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

interface Report {
  _id: string;
  date: string;
  project: {
    _id: string;
    name: string;
  } | null;
  employee: {
    _id: string;
    username: string;
  } | null;
  details: string;
  hoursWorked: number;
  title: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
}

interface Employee {
  _id: string;
  username: string;
  role: string;
}

const ReportsOnly = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters and search
  const [timePeriod, setTimePeriod] = useState<"day" | "week" | "month">("day");
  const [viewCategory, setViewCategory] = useState<
    "project" | "employee" | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Date picker state
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  // Report details modal
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes, projectsRes, employeesRes] = await Promise.all([
        axios.get("/reports"),
        axios.get("/projects"),
        axios.get("/users?role=employee"),
      ]);
      setReports(reportsRes.data);
      setProjects(projectsRes.data);
      setEmployees(employeesRes.data);
    } catch (err: any) {
      console.error("❌ Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReportDetails = (report: Report) => {
    setSelectedReport(report);
    setReportDialogOpen(true);
  };

  const handleCloseReportDetails = () => {
    setSelectedReport(null);
    setReportDialogOpen(false);
  };

  // Calculate start and end based on current period
  const getDateRange = (period: "day" | "week" | "month") => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (period) {
      case "day":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(start);
        end.setDate(start.getDate() + 1);
        break;

      case "week":
        const day = now.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() + diffToMonday);
        end = new Date(start);
        end.setDate(start.getDate() + 7);
        break;

      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;

      default:
        start = new Date(0);
        end = new Date();
    }

    return { start, end };
  };

  // Filtering
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.employee?.username
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      report.project?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const reportDate = new Date(report.date);
    reportDate.setHours(0, 0, 0, 0);

    // If a date is picked manually
    if (selectedDate) {
      const selected = selectedDate.toDate();
      selected.setHours(0, 0, 0, 0);
      return (
        reportDate.getFullYear() === selected.getFullYear() &&
        reportDate.getMonth() === selected.getMonth() &&
        reportDate.getDate() === selected.getDate() &&
        matchesSearch
      );
    }

    // Normal period filtering
    const { start, end } = getDateRange(timePeriod);
    const matchesTimePeriod = reportDate >= start && reportDate < end;

    let matchesViewCategory = true;
    if (viewCategory === "project") matchesViewCategory = !!report.project;
    else if (viewCategory === "employee")
      matchesViewCategory = !!report.employee;

    return matchesSearch && matchesTimePeriod && matchesViewCategory;
  });

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
    <PageContainer title="Reports" description="View and manage reports">
      <Box sx={{ p: 3 }}>
        {/* Top Bar */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
            sx={{ minWidth: 250 }}
          />

          <ToggleButtonGroup
            value={timePeriod}
            exclusive
            onChange={(_, val) => val && setTimePeriod(val)}
            aria-label="time period"
            size="small"
            disabled={!!selectedDate} // disable when custom date selected
          >
            <ToggleButton value="day">Today</ToggleButton>
            <ToggleButton value="week">This Week</ToggleButton>
            <ToggleButton value="month">This Month</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={viewCategory}
            exclusive
            onChange={(_, val) => val && setViewCategory(val)}
            aria-label="view category"
            size="small"
          >
            <ToggleButton value="all">All Reports</ToggleButton>
            <ToggleButton value="project">By Project</ToggleButton>
            <ToggleButton value="employee">By Employee</ToggleButton>
          </ToggleButtonGroup>

          {/* Calendar Date Picker */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={(newValue: Dayjs | null) => {
                setSelectedDate(newValue);
              }}
              renderInput={(params) => (
                <TextField {...params} size="small" sx={{ minWidth: 150 }} />
              )}
            />
            {selectedDate && (
              <Button
                size="small"
                onClick={() => setSelectedDate(null)}
                sx={{ textTransform: "none", ml: 1 }}
              >
                Clear Date
              </Button>
            )}
          </LocalizationProvider>
        </Box>

        {/* Reports Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Project</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Details</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Hours</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          {searchQuery || selectedDate
                            ? "No reports found for selected criteria"
                            : "No reports available"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((report) => (
                      <TableRow key={report._id} hover>
                        <TableCell>
                          {new Date(report.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Person
                              sx={{ fontSize: 16, color: "text.secondary" }}
                            />
                            {report.employee?.username || "Unknown"}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {report.project ? (
                            <Chip
                              label={report.project.name}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ) : (
                            <Typography color="text.secondary" variant="body2">
                              No Project
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {report.title || "Untitled Report"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 300 }}>
                            {report.details || "No details provided"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {report.hoursWorked}h
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => handleOpenReportDetails(report)}
                            sx={{ textTransform: "none" }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Report Details Dialog */}
        <Dialog
          open={reportDialogOpen}
          onClose={handleCloseReportDetails}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Report Details</DialogTitle>
          <DialogContent>
            {selectedReport && (
              <Box sx={{ pt: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                  {selectedReport.title || "Untitled Report"}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Date: {new Date(selectedReport.date).toLocaleDateString()}
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Employee
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedReport.employee?.username || "Unknown"}
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Project
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedReport.project?.name || "No project assigned"}
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Hours Worked
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedReport.hoursWorked} hours
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Details
                </Typography>
                <Typography variant="body2">
                  {selectedReport.details || "No details provided"}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReportDetails}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default ReportsOnly;

// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Chip,
//   Alert,
//   TextField,
//   ToggleButton,
//   ToggleButtonGroup,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
// } from "@mui/material";
// import { Refresh, Search, Person } from "@mui/icons-material";
// import { useAuth } from "@/contexts/AuthContext";
// import axios from "@/utils/axios";
// import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import dayjs, { Dayjs } from "dayjs";
// import { CalendarMonth } from "@mui/icons-material";

// interface Report {
//   _id: string;
//   date: string;
//   project: {
//     _id: string;
//     name: string;
//   } | null;
//   employee: {
//     _id: string;
//     username: string;
//   } | null;
//   details: string;
//   hoursWorked: number;
//   title: string;
// }

// interface Project {
//   _id: string;
//   name: string;
//   description: string;
// }

// interface Employee {
//   _id: string;
//   username: string;
//   role: string;
// }

// const ReportsOnly = () => {
//   const { user } = useAuth();
//   const [reports, setReports] = useState<Report[]>([]);
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [timePeriod, setTimePeriod] = useState<"day" | "week" | "month">("day");
//   const [viewCategory, setViewCategory] = useState<
//     "project" | "employee" | "all"
//   >("all");

//   const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedReport, setSelectedReport] = useState<Report | null>(null);
//   const [reportDialogOpen, setReportDialogOpen] = useState(false);

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(fetchData, 30000); // Auto-refresh
//     return () => clearInterval(interval);
//   }, []);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const [reportsRes, projectsRes, employeesRes] = await Promise.all([
//         axios.get("/reports"),
//         axios.get("/projects"),
//         axios.get("/users?role=employee"),
//       ]);

//       setReports(reportsRes.data);
//       setProjects(projectsRes.data);
//       setEmployees(employeesRes.data);
//     } catch (err: any) {
//       console.error("❌ Error fetching data:", err);
//       setError(err.response?.data?.message || "Failed to fetch data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleTimePeriodChange = (
//     event: React.MouseEvent<HTMLElement>,
//     newPeriod: "day" | "week" | "month" | null
//   ) => {
//     if (newPeriod !== null) {
//       setTimePeriod(newPeriod);
//     }
//   };

//   const handleViewCategoryChange = (
//     event: React.MouseEvent<HTMLElement>,
//     newCategory: "project" | "employee" | "all" | null
//   ) => {
//     if (newCategory !== null) {
//       setViewCategory(newCategory);
//     }
//   };

//   const handleOpenReportDetails = (report: Report) => {
//     setSelectedReport(report);
//     setReportDialogOpen(true);
//   };

//   const handleCloseReportDetails = () => {
//     setSelectedReport(null);
//     setReportDialogOpen(false);
//   };

//   // ✅ FIXED DATE RANGE LOGIC
//   const getDateRange = (period: "day" | "week" | "month") => {
//     const now = new Date();
//     let start: Date;
//     let end: Date;

//     switch (period) {
//       case "day":
//         start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//         end = new Date(start);
//         end.setDate(start.getDate() + 1);
//         break;

//       case "week":
//         const day = now.getDay(); // 0 = Sunday
//         const diffToMonday = day === 0 ? -6 : 1 - day;
//         start = new Date(now);
//         start.setHours(0, 0, 0, 0);
//         start.setDate(start.getDate() + diffToMonday);
//         end = new Date(start);
//         end.setDate(start.getDate() + 7);
//         break;

//       case "month":
//         start = new Date(now.getFullYear(), now.getMonth(), 1);
//         end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
//         break;

//       default:
//         start = new Date(0);
//         end = new Date();
//     }

//     return { start, end };
//   };

//   // ✅ FILTER LOGIC
//   const filteredReports = reports.filter((report) => {
//     // Search match
//     const matchesSearch =
//       report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       report.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       report.employee?.username
//         ?.toLowerCase()
//         .includes(searchQuery.toLowerCase()) ||
//       report.project?.name?.toLowerCase().includes(searchQuery.toLowerCase());

//     // Time period filter
//     const dateRange = getDateRange(timePeriod);
//     const reportDate = new Date(report.date);
//     reportDate.setHours(0, 0, 0, 0);

//     const matchesTimePeriod =
//       reportDate >= dateRange.start && reportDate < dateRange.end;

//     // Category filter
//     let matchesViewCategory = true;
//     if (viewCategory === "project") {
//       matchesViewCategory = !!report.project;
//     } else if (viewCategory === "employee") {
//       matchesViewCategory = !!report.employee;
//     }

//     return matchesSearch && matchesTimePeriod && matchesViewCategory;
//   });

//   if (loading) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         minHeight="400px"
//       >
//         <Typography>Loading...</Typography>
//       </Box>
//     );
//   }

//   return (
//     <PageContainer title="Reports" description="View and manage reports">
//       <Box sx={{ p: 3 }}>
//         {/* Header */}
//         <Box
//           sx={{
//             mb: 3,
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <Typography variant="h5" sx={{ fontWeight: "bold" }}>
//             Reports
//           </Typography>
//           <Button
//             variant="outlined"
//             startIcon={<Refresh />}
//             onClick={fetchData}
//             disabled={loading}
//           >
//             Refresh
//           </Button>
//         </Box>

//         {error && (
//           <Alert severity="error" sx={{ mb: 2 }}>
//             {error}
//           </Alert>
//         )}

//         {/* Filters & Search */}
//         <Box
//           sx={{
//             mb: 3,
//             display: "flex",
//             gap: 2,
//             alignItems: "center",
//             flexWrap: "wrap",
//           }}
//         >
//           <TextField
//             placeholder="Search reports..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <Search sx={{ mr: 1, color: "text.secondary" }} />
//               ),
//             }}
//             sx={{ minWidth: 250 }}
//           />

//           <ToggleButtonGroup
//             value={timePeriod}
//             exclusive
//             onChange={handleTimePeriodChange}
//             aria-label="time period"
//             size="small"
//           >
//             <ToggleButton value="day" aria-label="day">
//               Today
//             </ToggleButton>
//             <ToggleButton value="week" aria-label="week">
//               This Week
//             </ToggleButton>
//             <ToggleButton value="month" aria-label="month">
//               This Month
//             </ToggleButton>
//           </ToggleButtonGroup>

//           <ToggleButtonGroup
//             value={viewCategory}
//             exclusive
//             onChange={handleViewCategoryChange}
//             aria-label="view category"
//             size="small"
//           >
//             <ToggleButton value="all" aria-label="all">
//               All Reports
//             </ToggleButton>
//             <ToggleButton value="project" aria-label="project">
//               By Project
//             </ToggleButton>
//             <ToggleButton value="employee" aria-label="employee">
//               By Employee
//             </ToggleButton>
//           </ToggleButtonGroup>
//         </Box>

//         {/* Reports Table */}
//         <Card>
//           <CardContent sx={{ p: 0 }}>
//             <TableContainer component={Paper} elevation={0}>
//               <Table>
//                 <TableHead>
//                   <TableRow sx={{ backgroundColor: "grey.50" }}>
//                     <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
//                     <TableCell sx={{ fontWeight: "bold" }}>Employee</TableCell>
//                     <TableCell sx={{ fontWeight: "bold" }}>Project</TableCell>
//                     <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
//                     <TableCell sx={{ fontWeight: "bold" }}>Details</TableCell>
//                     <TableCell sx={{ fontWeight: "bold" }}>Hours</TableCell>
//                     <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
//                   </TableRow>
//                 </TableHead>

//                 <TableBody>
//                   {filteredReports.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
//                         <Typography color="text.secondary">
//                           {searchQuery
//                             ? "No reports found matching your search"
//                             : "No reports available"}
//                         </Typography>
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     filteredReports.map((report) => (
//                       <TableRow key={report._id} hover>
//                         <TableCell>
//                           {new Date(report.date).toLocaleDateString()}
//                         </TableCell>

//                         <TableCell>
//                           <Box
//                             sx={{
//                               display: "flex",
//                               alignItems: "center",
//                               gap: 1,
//                             }}
//                           >
//                             <Person
//                               sx={{ fontSize: 16, color: "text.secondary" }}
//                             />
//                             {report.employee?.username || "Unknown"}
//                           </Box>
//                         </TableCell>

//                         <TableCell>
//                           {report.project ? (
//                             <Chip
//                               label={report.project.name}
//                               size="small"
//                               color="primary"
//                               variant="outlined"
//                             />
//                           ) : (
//                             <Typography color="text.secondary" variant="body2">
//                               No Project
//                             </Typography>
//                           )}
//                         </TableCell>

//                         <TableCell>
//                           <Typography variant="body2" sx={{ fontWeight: 500 }}>
//                             {report.title || "Untitled Report"}
//                           </Typography>
//                         </TableCell>

//                         <TableCell>
//                           <Typography variant="body2" sx={{ maxWidth: 300 }}>
//                             {report.details || "No details provided"}
//                           </Typography>
//                         </TableCell>

//                         <TableCell>
//                           <Typography variant="body2" sx={{ fontWeight: 500 }}>
//                             {report.hoursWorked}h
//                           </Typography>
//                         </TableCell>

//                         <TableCell>
//                           <Button
//                             size="small"
//                             onClick={() => handleOpenReportDetails(report)}
//                             sx={{ textTransform: "none" }}
//                           >
//                             View Details
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </CardContent>
//         </Card>

//         {/* Report Details Dialog */}
//         <Dialog
//           open={reportDialogOpen}
//           onClose={handleCloseReportDetails}
//           maxWidth="md"
//           fullWidth
//         >
//           <DialogTitle>Report Details</DialogTitle>
//           <DialogContent>
//             {selectedReport && (
//               <Box sx={{ pt: 1 }}>
//                 <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
//                   {selectedReport.title || "Untitled Report"}
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   color="text.secondary"
//                   sx={{ mb: 2 }}
//                 >
//                   Date: {new Date(selectedReport.date).toLocaleDateString()}
//                 </Typography>

//                 <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
//                   Employee
//                 </Typography>
//                 <Typography variant="body2" sx={{ mb: 2 }}>
//                   {selectedReport.employee?.username || "Unknown"}
//                 </Typography>

//                 <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
//                   Project
//                 </Typography>
//                 <Typography variant="body2" sx={{ mb: 2 }}>
//                   {selectedReport.project?.name || "No project assigned"}
//                 </Typography>

//                 <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
//                   Hours Worked
//                 </Typography>
//                 <Typography variant="body2" sx={{ mb: 2 }}>
//                   {selectedReport.hoursWorked} hours
//                 </Typography>

//                 <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
//                   Details
//                 </Typography>
//                 <Typography variant="body2">
//                   {selectedReport.details || "No details provided"}
//                 </Typography>
//               </Box>
//             )}
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleCloseReportDetails}>Close</Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </PageContainer>
//   );
// };

// export default ReportsOnly;
