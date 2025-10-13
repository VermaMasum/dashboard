"use client";
import React, { useState, useEffect } from "react";
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
  Avatar,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
} from "@mui/material";
import { IconMail, IconMenu2, IconUpload } from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDispatch } from "@/store/hooks";
import { toggleMobileSidebar } from "@/store/customizer/CustomizerSlice";

const Header = () => {
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const [anchorEl2, setAnchorEl2] = useState(null);
  const { user, logout } = useAuth();
  const dispatch = useDispatch();
  const [currentProfileImg, setCurrentProfileImg] = useState("user2.jpg");
  const [changeDialogOpen, setChangeDialogOpen] = useState(false);

  useEffect(() => {
    const savedImg = localStorage.getItem("profileImg");
    if (savedImg) {
      setCurrentProfileImg(savedImg);
    }
  }, []);

  const handleProfileImgChange = (img: string) => {
    setCurrentProfileImg(img);
    localStorage.setItem("profileImg", img);
    setChangeDialogOpen(false);
  };

  const handleChangePictureClick = () => {
    setChangeDialogOpen(true);
  };

  const handleCloseChangeDialog = () => {
    setChangeDialogOpen(false);
  };

  const handleClick2 = (event: any) => {
    console.log("Profile icon clicked, opening dropdown");
    console.log("Current anchorEl2:", anchorEl2);
    setAnchorEl2(event.currentTarget);
    console.log("New anchorEl2 set to:", event.currentTarget);
  };

  const handleClose2: () => void = () => {
    setAnchorEl2(null);
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    handleClose2();
    logout();
  };

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow:
      "0 3px 5px -1px rgba(0, 0, 0, .2),0 5px 8px 0 rgba(0, 0, 0, .14),0 1px 14px 0 rgba(0, 0, 0, .12)!important",
    background: theme.palette.primary.main,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    width: "100%",
    position: "relative",
    [theme.breakpoints.up("lg")]: {
      minHeight: "64px",
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: "100%",
    color: theme.palette.warning.contrastText,
  }));

  const getUserDisplayName = () => user?.username || "Employee";
  const getUserRole = () => {
    if (user?.role === "employee") return "Employee";
    return "Employee";
  };
  const getUserEmail = () => "employee@example.com";

  return (
    <AppBarStyled position="static" color="default">
      <ToolbarStyled>
        {/* Mobile Menu Button - Only visible on mobile */}
        {lgDown && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => dispatch(toggleMobileSidebar())}
            edge="start"
            sx={{
              mr: 2,
              color: "white",
            }}
          >
            <IconMenu2 size="20" />
          </IconButton>
        )}

        {/* Employee Portal Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "white",
            fontSize: { xs: "1rem", sm: "1.25rem" },
            marginRight: 1,
          }}
        >
          Employee Portal
        </Typography>

        <Box flexGrow={1} />
        <Stack
          spacing={1}
          direction="row"
          alignItems="center"
          sx={{ marginRight: 2 }}
        >
          {/* Profile Dropdown */}
          <Box>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="account-menu"
              aria-haspopup="true"
              onClick={handleClick2}
              color="inherit"
              sx={{
                ...(typeof anchorEl2 === "object" && {
                  color: "primary.main",
                }),
              }}
            >
              <Avatar
                src={`/images/profile/${currentProfileImg}`}
                alt={"ProfileImg"}
                sx={{ width: 35, height: 35 }}
              />
            </IconButton>
            <Menu
              id="account-menu"
              anchorEl={anchorEl2}
              keepMounted
              open={Boolean(anchorEl2)}
              onClose={handleClose2}
              // onOpen={() => console.log('Menu opened, anchorEl2:', anchorEl2)}
              anchorOrigin={{ horizontal: "right", vertical: "top" }}
              transformOrigin={{ horizontal: "right", vertical: "bottom" }}
              disablePortal={false}
              sx={{
                "& .MuiMenu-paper": {
                  width: "360px",
                  p: 4,
                  mt: 1,
                  mr: 1,
                  zIndex: 9999,
                },
              }}
            >
              <Typography variant="h5">Employee Profile</Typography>
              <Stack direction="row" py={3} spacing={2} alignItems="center">
                <Box position="relative">
                  <Avatar
                    src={`/images/profile/${currentProfileImg}`}
                    alt={"ProfileImg"}
                    sx={{ width: 95, height: 95 }}
                  />
                  <IconButton
                    onClick={handleChangePictureClick}
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.7)",
                      },
                    }}
                    size="small"
                  >
                    <IconUpload size={16} />
                  </IconButton>
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="textPrimary"
                    fontWeight={600}
                  >
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
                  onClick={handleLogout}
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
      <Dialog open={changeDialogOpen} onClose={handleCloseChangeDialog}>
        <DialogTitle>Choose Profile Picture</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {Array.from({ length: 10 }, (_, i) => `user-${i + 1}.jpg`).map((img) => (
              <Grid item xs={4} key={img}>
                <IconButton onClick={() => handleProfileImgChange(img)}>
                  <Avatar
                    src={`/images/profile/${img}`}
                    alt={img}
                    sx={{ width: 60, height: 60 }}
                  />
                </IconButton>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </AppBarStyled>
  );
};

export default Header;
