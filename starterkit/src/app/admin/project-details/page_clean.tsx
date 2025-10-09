"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Autocomplete,
  Checkbox,
  Popover,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  PersonAdd,
  PersonRemove,
  Visibility,
  People,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/utils/axios";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

interface Project {
  _id: string;
  name: string;
  description: string;
  status?: string;
  employees?: (string | { _id: string; username: string })[];
}

