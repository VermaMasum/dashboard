import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Menu,
  Avatar,
  Typography,
  Divider,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  IconButton as MuiIconButton,
} from '@mui/material';
import * as dropdownData from './data';

import { IconMail, IconUpload } from '@tabler/icons-react';
import { Stack } from '@mui/system';
// import Image from 'next/image'; // Commented out as requested
import { useAuth } from '@/contexts/AuthContext';


const Profile = () => {
  const { user, logout } = useAuth();
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [currentProfileImg, setCurrentProfileImg] = useState('user-2.jpg');
  const [changeDialogOpen, setChangeDialogOpen] = useState(false);

  useEffect(() => {
    const savedImg = localStorage.getItem('profileImg');
    if (savedImg) {
      setCurrentProfileImg(savedImg);
    }
  }, []);

  const handleProfileImgChange = (newImg: string) => {
    setCurrentProfileImg(newImg);
    localStorage.setItem('profileImg', newImg);
    setChangeDialogOpen(false);
  };

  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleLogout = () => {
    logout();
    handleClose2();
  };

  const handleChangePictureClick = () => {
    setChangeDialogOpen(true);
  };

  const handleCloseChangeDialog = () => {
    setChangeDialogOpen(false);
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          src={`/images/profile/${currentProfileImg}`}
          alt={'ProfileImg'}
          sx={{
            width: 35,
            height: 35,
          }}
        />
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '360px',
            p: 4,
          },
        }}
      >
        <Typography variant="h5">User Profile</Typography>
        <Stack direction="row" py={3} spacing={2} alignItems="center">
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar src={`/images/profile/${currentProfileImg}`} alt={"ProfileImg"} sx={{ width: 95, height: 95 }} />
            <MuiIconButton
              onClick={handleChangePictureClick}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'primary.main',
                color: 'white',
                width: 32,
                height: 32,
                '&:hover': { backgroundColor: 'primary.dark' },
              }}
            >
              <IconUpload size={16} />
            </MuiIconButton>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="textPrimary" fontWeight={600}>
              {user?.username || 'Admin'}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              {user?.role === 'admin' ? 'Admin' : user?.role === 'superAdmin' ? 'SuperAdmin' : 'User'}
            </Typography>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <IconMail width={15} height={15} />
              admin@example.com
            </Typography>
          </Box>
        </Stack>
        <Divider />
        {/* Profile menu items commented out as requested - keeping only logout */}
        {/* {dropdownData.profile.map((profile) => (
          <Box key={profile.title}>
            <Box sx={{ py: 2, px: 0 }} className="hover-text-primary">
              <Link href={profile.href}>
                <Stack direction="row" spacing={2}>
                  <Box
                    width="45px"
                    height="45px"
                    bgcolor="primary.light"
                    display="flex"
                    alignItems="center"
                    justifyContent="center" flexShrink="0"
                  >
                    <Avatar
                      src={profile.icon}
                      alt={profile.icon}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 0,
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="textPrimary"
                      className="text-hover"
                      noWrap
                      sx={{
                        width: '240px',
                      }}
                    >
                      {profile.title}
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="subtitle2"
                      sx={{
                        width: '240px',
                      }}
                      noWrap
                    >
                      {profile.subtitle}
                    </Typography>
                  </Box>
                </Stack>
              </Link>
            </Box>
          </Box>
        ))} */}
        <Box mt={2}>
          {/* Promotional card commented out as requested */}
          {/* <Box bgcolor="primary.light" p={3} mb={3} overflow="hidden" position="relative">
            <Box display="flex" justifyContent="space-between">
              <Box>
                <Typography variant="h5" mb={2}>
                  Unlimited <br />
                  Access
                </Typography>
                <Button variant="contained" color="primary">
                  Upgrade
                </Button>
              </Box>
              <Image src={"/images/backgrounds/unlimited-bg.png"} width={150} height={183} alt="unlimited" className="signup-bg" />
            </Box>
          </Box> */}
          <Button onClick={handleLogout} variant="outlined" color="primary" fullWidth>
            Logout
          </Button>
        </Box>

        {/* Change Profile Dialog */}
        <Dialog open={changeDialogOpen} onClose={handleCloseChangeDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Choose Profile Picture</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {['user-1.jpg', 'user-2.jpg', 'user-3.jpg', 'user-4.jpg', 'user-5.jpg', 'user-6.jpg', 'user-7.jpg', 'user-8.jpg', 'user-9.jpg', 'user-10.jpg'].map((img) => (
                <Grid item xs={4} key={img}>
                  <MuiIconButton
                    onClick={() => handleProfileImgChange(img)}
                    sx={{
                      p: 1,
                      border: currentProfileImg === img ? '2px solid primary.main' : '1px solid grey',
                      borderRadius: 1,
                    }}
                  >
                    <Avatar
                      src={`/images/profile/${img}`}
                      alt={img}
                      sx={{ width: 80, height: 80 }}
                    />
                  </MuiIconButton>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
        </Dialog>
      </Menu>
    </Box>
  );
};

export default Profile;
