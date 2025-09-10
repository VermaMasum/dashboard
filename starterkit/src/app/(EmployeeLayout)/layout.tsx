"use client";
import { ReactNode } from "react";
import { Box } from "@mui/material";
import EmployeeSidebar from "./layout/vertical/sidebar/Sidebar";
import EmployeeHeader from "./layout/vertical/header/Header";
import EmployeeProtectedRoute from "@/components/EmployeeProtectedRoute";
import { DashboardProvider } from "@/contexts/DashboardContext";

interface EmployeeLayoutProps {
  children: ReactNode;
}

const EmployeeLayout = ({ children }: EmployeeLayoutProps) => {
  return (
    <EmployeeProtectedRoute>
      <DashboardProvider>
        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
          {/* Header - Full Width */}
          <EmployeeHeader />
          
          {/* Content Area */}
          <Box sx={{ display: "flex", flexGrow: 1 }}>
            {/* Sidebar */}
            <EmployeeSidebar />
            
            {/* Main Content */}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                minHeight: "calc(100vh - 64px)",
                backgroundColor: (theme) => theme.palette.background.default,
              }}
            >
              {/* Page Content */}
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {children}
              </Box>
            </Box>
          </Box>
        </Box>
      </DashboardProvider>
    </EmployeeProtectedRoute>
  );
};

export default EmployeeLayout;
