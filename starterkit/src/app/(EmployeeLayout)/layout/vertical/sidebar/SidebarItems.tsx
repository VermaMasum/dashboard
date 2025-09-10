"use client";
import React from "react";
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/contexts/DashboardContext";
import Menuitems from "./MenuItems";

const SidebarItems = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { setActiveTab } = useDashboard();

  return (
    <Box>
      <List sx={{ px: 0 }}>
        {Menuitems.map((item) => {
          if (item.subheader) {
            return (
              <Typography
                key={item.subheader}
                variant="subtitle2"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "text.secondary",
                  px: 2,
                  py: 1,
                  mt: 2,
                }}
              >
                {item.subheader}
              </Typography>
            );
          } else {
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={pathname === item.href || (pathname === '/employee/dashboard' && item.href?.includes('tab='))}
                  onClick={() => {
                    // Handle navigation for dashboard tabs
                    if (item.href?.includes('tab=')) {
                      // Extract tab number and set it directly
                      const tabMatch = item.href.match(/tab=(\d+)/);
                      if (tabMatch) {
                        const tabNumber = parseInt(tabMatch[1]);
                        setActiveTab(tabNumber);
                      }
                      // Always navigate to dashboard for tab items
                      if (pathname !== '/employee/dashboard') {
                        router.push('/employee/dashboard');
                      }
                    } else {
                      // For other pages, use normal navigation
                      router.push(item.href || '/');
                    }
                  }}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    "&.Mui-selected": {
                      backgroundColor: "primary.main",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "primary.light",
                      color: "primary.main",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: pathname === item.href ? "white" : "text.secondary",
                    }}
                  >
                    {item.icon && React.createElement(item.icon)}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontSize: "0.875rem",
                        fontWeight: pathname === item.href ? 600 : 400,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          }
        })}
      </List>
    </Box>
  );
};

export default SidebarItems;
