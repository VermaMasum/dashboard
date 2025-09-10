"use client";
import React, { useState } from "react";
import { useMediaQuery, Box, Drawer, useTheme, Typography } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import SidebarItems from "./SidebarItems";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const theme = useTheme();
  const customizer = useSelector((state: AppState) => state.customizer);
  const { user } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  if (lgUp) {
    return (
      <Box
        sx={{
          width: customizer.isCollapse ? 0 : 240,
          flexShrink: 0,
          minHeight: "100vh",
          background: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Drawer
          anchor="left"
          open={true}
          variant="permanent"
          sx={{
            zIndex: 1001,
            display: { xs: "none", lg: "block" },
            "& .MuiDrawer-paper": {
              position: "relative",
              border: "0 !important",
              boxShadow: "none !important",
              width: 240,
              minHeight: "100vh",
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
              borderRadius: "0 !important",
            },
          }}
        >
          <Box
            sx={{
              minHeight: "100vh",
            }}
          >
            <SidebarItems />
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      variant="temporary"
      sx={{
        zIndex: 1001,
        display: { xs: "block", lg: "none" },
        "& .MuiDrawer-paper": {
          width: 240,
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: "0 !important",
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      <SidebarItems />
    </Drawer>
  );
};

export default Sidebar;
