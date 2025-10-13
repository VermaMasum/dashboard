"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  CircularProgress,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
} from "@mui/material";
import Link from "next/link";
import { toast } from "react-toastify";
import { IconUpload } from "@tabler/icons-react";
import { loginType } from "@/app/(DashboardLayout)/types/auth/auth";
import CustomCheckbox from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomCheckbox";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomFormLabel";
import { useAuth } from "@/contexts/AuthContext";

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const [currentProfileImg, setCurrentProfileImg] = useState("user-1.jpg");
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        // Redirect based on user role
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.role === 'employee') {
          toast.success(`Welcome ${userData.username}! Redirecting to Employee Dashboard...`);
          router.push("/employee/dashboard");
        } else {
          toast.success(`Welcome ${userData.username}! Redirecting to Admin Dashboard...`);
          router.push("/");
        }
      } else {
        // Handle login failure
        toast.error(result.message || "Invalid email or password");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box display="flex" justifyContent="center" mb={3}>
        <Box position="relative">
          <Avatar
            src={`/images/profile/${currentProfileImg}`}
            alt="Profile"
            sx={{ width: 80, height: 80 }}
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
      </Box>
      <form onSubmit={handleSubmit}>
        {title ? (
          <Typography fontWeight="700" variant="h3" mb={1}>
            {title}
          </Typography>
        ) : null}

        {subtext}

      <Stack>
        <Box>
          <CustomFormLabel htmlFor="email">Email</CustomFormLabel>
          <CustomTextField 
            id="email" 
            type="email"
            variant="outlined" 
            fullWidth 
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </Box>
        <Box>
          <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
          <CustomTextField
            id="password"
            type="password"
            variant="outlined"
            fullWidth
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </Box>
        <Stack
          justifyContent="space-between"
          direction="row"
          alignItems="center"
          my={2}
        >
          <FormGroup>
            <FormControlLabel
              control={<CustomCheckbox defaultChecked />}
              label="Remember this Device"
            />
          </FormGroup>
          <Typography
            component={Link}
            href="/auth/auth1/forgot-password"
            fontWeight="500"
            sx={{
              textDecoration: "none",
              color: "primary.main",
            }}
          >
            Forgot Password ?
          </Typography>
        </Stack>
      </Stack>
      <Box>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
        </Button>
      </Box>
        {subtitle}
      </form>
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
    </>
  );
};

export default AuthLogin;
