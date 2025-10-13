"use client";
import {
  Box,
  Typography,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
} from "@mui/material";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconUpload } from "@tabler/icons-react";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomFormLabel";
import { Stack } from "@mui/system";
import { registerType } from "@/app/(DashboardLayout)/types/auth/auth";
import AuthSocialButtons from "./AuthSocialButtons";
import axios from "@/utils/axios";

const AuthRegister = ({ title, subtitle, subtext }: registerType) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear errors when user types
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      console.log("📝 Registering user:", formData.username);
      const response = await axios.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: "admin", // Default role for registration
      });

      console.log("✅ Registration successful:", response.data);
      setSuccess("Registration successful! Redirecting to login...");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/auth1/login");
      }, 2000);
    } catch (err: any) {
      console.error("❌ Registration error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Registration failed";
      setError(errorMessage);
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
      {title ? (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}
      {/* <AuthSocialButtons title="Sign up with" /> */}

      {/* <Box mt={3}>
        <Divider>
          <Typography
            component="span"
            color="textSecondary"
            variant="h6"
            fontWeight="400"
            position="relative"
            px={2}
          >
            or sign up with
          </Typography>
        </Divider>
      </Box> */}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack mb={3}>
          <CustomFormLabel htmlFor="username">Username</CustomFormLabel>
          <CustomTextField
            id="username"
            name="username"
            variant="outlined"
            fullWidth
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            required
          />

          <CustomFormLabel htmlFor="email">Email Address</CustomFormLabel>
          <CustomTextField
            id="email"
            name="email"
            type="email"
            variant="outlined"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
          />

          <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
          <CustomTextField
            id="password"
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            required
          />

          <CustomFormLabel htmlFor="confirmPassword">
            Confirm Password
          </CustomFormLabel>
          <CustomTextField
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            variant="outlined"
            fullWidth
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </Stack>

        <Button
          type="submit"
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
              Signing Up...
            </>
          ) : (
            "Sign Up"
          )}
        </Button>
      </Box>
      {subtitle}
      <Dialog open={changeDialogOpen} onClose={handleCloseChangeDialog}>
        <DialogTitle>Choose Profile Picture</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {Array.from({ length: 10 }, (_, i) => `user-${i + 1}.jpg`).map(
              (img) => (
                <Grid item xs={4} key={img}>
                  <IconButton onClick={() => handleProfileImgChange(img)}>
                    <Avatar
                      src={`/images/profile/${img}`}
                      alt={img}
                      sx={{ width: 60, height: 60 }}
                    />
                  </IconButton>
                </Grid>
              )
            )}
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthRegister;
