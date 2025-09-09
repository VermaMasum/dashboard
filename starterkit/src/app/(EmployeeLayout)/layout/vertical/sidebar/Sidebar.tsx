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
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            top: "64px",
            height: "calc(100vh - 64px)",
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRight: `1px solid ${theme.palette.divider}`,
            borderRadius: "0 !important",
            sx: {
              height: "100%",
            },
          },
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
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
              borderRadius: "0 !important",
              border: "0 !important",
              boxShadow: (theme) => theme.shadows[8],
            },
          }}
        >
          <Box
            sx={{
              height: "100%",
            }}
          >
            {/* Welcome Section */}
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                color: 'white',
                borderRadius: '0 !important',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  mb: 1,
                  fontSize: customizer.isCollapse ? '1rem' : '1.25rem',
                }}
              >
                Employee Portal
              </Typography>
              {user && !customizer.isCollapse && (
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.9, fontSize: '0.875rem' }}
                >
                  Welcome, {user.username}
                </Typography>
              )}
            </Box>
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
      {/* Welcome Section for Mobile */}
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
          color: 'white',
          borderRadius: '0 !important',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            mb: 1,
          }}
        >
          Employee Portal
        </Typography>
        {user && (
          <Typography
            variant="body2"
            sx={{
              opacity: 0.9,
              fontSize: '0.875rem',
            }}
          >
            Welcome, {user.username}
          </Typography>
        )}
      </Box>
      <SidebarItems />
    </Drawer>
  );
};

export default Sidebar;
