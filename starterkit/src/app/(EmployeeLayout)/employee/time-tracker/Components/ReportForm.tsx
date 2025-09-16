"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogContent,
  DialogActions,
  DialogTitle,
  Dialog,
} from "@mui/material";
import { Report } from "../types/report";

interface ReportFormProps {
  report: Report | null;
  onClose: () => void;
  onSubmit: () => void;
}

export default function ReportForm({
  report,
  onClose,
  onSubmit,
}: ReportFormProps) {
  const [formData, setFormData] = useState({
    project: report?.project?._id || "",
    details: report?.details || "",
    hoursWorked: report?.hoursWorked || 0,
    date: report
      ? new Date(report.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (report) {
      setFormData({
        project: report.project?._id || "",
        details: report.details || "",
        hoursWorked: report.hoursWorked || 0,
        date: new Date(report.date).toISOString().split("T")[0],
      });
    }
  }, [report]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (report) {
        // Update existing report
        await fetch(`/api/reports/${report._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new report
        await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      onSubmit();
    } catch (error) {
      console.error("Failed to save report", error);
    }
  };

  return (
    <>
      <DialogTitle>{report ? "Edit Report" : "Create Report"}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Date"
            type="date"
            fullWidth
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Project ID"
            fullWidth
            value={formData.project}
            onChange={(e) => handleChange("project", e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Details"
            fullWidth
            multiline
            rows={4}
            value={formData.details}
            onChange={(e) => handleChange("details", e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Hours Worked"
            type="number"
            fullWidth
            value={formData.hoursWorked}
            onChange={(e) =>
              handleChange("hoursWorked", Number(e.target.value))
            }
            inputProps={{ min: 0, max: 24, step: 0.25 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {report ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </>
  );
}
