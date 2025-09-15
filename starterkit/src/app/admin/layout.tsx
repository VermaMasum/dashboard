"use client";
import { styled, Container, Box, useTheme } from "@mui/material";
import React, { useState } from "react";
import Header from "../(DashboardLayout)/layout/vertical/header/Header";
import Sidebar from "../(DashboardLayout)/layout/vertical/sidebar/Sidebar";
import Customizer from "../(DashboardLayout)/layout/shared/customizer/Customizer";
import Navigation from "../(DashboardLayout)/layout/horizontal/navbar/Navigation";
import HorizontalHeader from "../(DashboardLayout)/layout/horizontal/header/Header";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import ProtectedRoute from "@/components/ProtectedRoute";

const MainWrapper = styled("div")(() => ({
  // display: "flex",
  // minHeight: "100vh",
  // width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: "transparent",
}));

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  return (
    <ProtectedRoute allowedRoles={['admin', 'superAdmin']}>
      <MainWrapper>
        {/* ------------------------------------------- */}
        {/* Header */}
        {/* ------------------------------------------- */}
        {customizer.isHorizontal ? "" : <Header />}
        {/* ------------------------------------------- */}
        {/* Sidebar */}
        {/* ------------------------------------------- */}
        {customizer.isHorizontal ? "" : <Sidebar />}
        {/* ------------------------------------------- */}
        {/* Main Wrapper */}
        {/* ------------------------------------------- */}

        <PageWrapper
          className="page-wrapper"
          sx={{
            ...(customizer.isHorizontal == false && {
              [theme.breakpoints.up("lg")]: {
                ml: `${customizer.SidebarWidth}px`,
              },
            }),

            ...(customizer.isCollapse && {
              [theme.breakpoints.up("lg")]: {
                ml: `${customizer.MiniSidebarWidth}px`,
              },
            }),
          }}
        >
          {/* PageContent */}
          {customizer.isHorizontal ? <HorizontalHeader /> : ""}
          {customizer.isHorizontal ? <Navigation /> : ""}
          <Container
            sx={{
              maxWidth: customizer.isLayout === "boxed" ? "lg" : "100%!important",
            }}
          >
            <Box sx={{ minHeight: "calc(100vh - 170px)" }}>
              {children}
            </Box>
          </Container>
        </PageWrapper>
        <Customizer />
      </MainWrapper>
    </ProtectedRoute>
  );
}