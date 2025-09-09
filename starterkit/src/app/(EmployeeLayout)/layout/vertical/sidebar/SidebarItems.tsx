"use client";
import React from "react";
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Menuitems from "./MenuItems";

const SidebarItems = () => {
  const pathname = usePathname();
  const { user } = useAuth();

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
                  selected={pathname === item.href}
                  onClick={() => {
                    // Handle navigation - you can use Next.js router here
                    window.location.href = item.href;
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
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: pathname === item.href ? "white" : "text.secondary",
                    }}
                  >
                    {item.icon}
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
