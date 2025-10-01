"use client";
import { Card, CardContent, Typography, Box, Button } from "@mui/material";
import { Report } from "../types/report";

interface ReportCardProps {
  report: Report;
  onEdit?: (report: Report) => void;
}

const colors = [
  "#4db6ac",
  "#f06292",
  "#4fc3f7",
  "#ba68c8",
  "#ffd54f",
  "#81c784",
  "#e57373",
];

function getColor(index: number) {
  return colors[index % colors.length];
}

export default function ReportCard({ report, onEdit }: ReportCardProps) {
  // Use project name hash or report id to pick color
  const colorIndex = report.project?.name
    ? report.project.name.charCodeAt(0) % colors.length
    : 0;
  const bgColor = getColor(colorIndex);

  return (
    <Card
      sx={{
        mb: 2,
        backgroundColor: bgColor,
        color: "white",
        borderRadius: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
      }}
    >
      <Box>
        <Typography variant="h6" fontWeight="bold">
          {report.project?.name || "No Project"}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {report.details || "No description provided."}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {report.hoursWorked.toFixed(2)}h
        </Typography>
        <Button
          variant="outlined"
          size="small"
          sx={{ color: "white", borderColor: "white" }}
          onClick={() => onEdit?.(report)}
        >
          Edit
        </Button>
      </Box>
    </Card>
  );
}
