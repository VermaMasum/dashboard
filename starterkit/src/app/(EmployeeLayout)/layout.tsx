"use client";
import { ReactNode } from "react";
import { Box } from "@mui/material";
import EmployeeSidebar from "./layout/vertical/sidebar/Sidebar";
import EmployeeHeader from "./layout/vertical/header/Header";
import EmployeeProtectedRoute from "@/components/EmployeeProtectedRoute";

interface EmployeeLayoutProps {
  children: ReactNode;
}

const EmployeeLayout = ({ children }: EmployeeLayoutProps) => {
  return (
    <EmployeeProtectedRoute>
      <Box sx={{ display: "flex", width: "100%" }}>
        {/* Sidebar */}
        <EmployeeSidebar />
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            width: { sm: `calc(100% - 240px)` },
            minHeight: "100vh",
            backgroundColor: (theme) => theme.palette.background.default,
          }}
        >
          {/* Header */}
          <EmployeeHeader />
          
          {/* Page Content */}
          <Box sx={{ mt: 2 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </EmployeeProtectedRoute>
  );
};

export default EmployeeLayout;
