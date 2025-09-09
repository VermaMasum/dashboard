"use client";
import React, { useState } from "react";
import {
  Box,
  AppBar,
  useMediaQuery,
  Toolbar,
  styled,
  Stack,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Button,
} from "@mui/material";
import { IconPower, IconMail } from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));
  const [anchorEl2, setAnchorEl2] = useState(null);
  const { user, logout } = useAuth();

  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow:
      "0 3px 5px -1px rgba(0, 0, 0, .2),0 5px 8px 0 rgba(0, 0, 0, .14),0 1px 14px 0 rgba(0, 0, 0, .12)!important",
    background: theme.palette.primary.main,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    [theme.breakpoints.up("lg")]: {
      minHeight: "64px",
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: "100%",
    color: theme.palette.warning.contrastText,
  }));

  const getUserDisplayName = () => user?.username || 'Employee';
  const getUserRole = () => {
    if (user?.role === 'employee') return 'Employee';
    return 'Employee';
  };
  const getUserEmail = () => 'employee@example.com';

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        {/* Employee Portal Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: 'white',
            fontSize: '1.25rem',
          }}
        >
          Employee Portal
        </Typography>

        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          {/* Profile Dropdown */}
          <Box>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="account-menu"
              aria-haspopup="true"
              onClick={handleClick2}
              color="inherit"
            >
              <Avatar
                src={"/images/profile/user2.jpg"}
                alt={"ProfileImg"}
                sx={{ width: 35, height: 35 }}
              />
            </IconButton>
            <Menu
              id="account-menu"
              anchorEl={anchorEl2}
              open={Boolean(anchorEl2)}
              onClose={handleClose2}
              onClick={handleClose2}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&:before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Typography variant="h5">Employee Profile</Typography>
              <Stack direction="row" py={3} spacing={2} alignItems="center">
                <Avatar src={"/images/profile/user2.jpg"} alt={"ProfileImg"} sx={{ width: 95, height: 95 }} />
                <Box>
                  <Typography variant="subtitle2" color="textPrimary" fontWeight={600}>
                    {getUserDisplayName()}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    {getUserRole()}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <IconMail width={15} height={15} />
                    {getUserEmail()}
                  </Typography>
                </Box>
              </Stack>
              <Divider />
              <Box mt={2}>
                <Button
                  onClick={logout}
                  variant="outlined"
                  color="primary"
                  fullWidth
                >
                  Logout
                </Button>
              </Box>
            </Menu>
          </Box>
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default Header;
