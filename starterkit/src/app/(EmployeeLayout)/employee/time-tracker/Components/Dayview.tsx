"use client";
import { Box, Typography } from "@mui/material";
import { Report } from "../types/report";
import ReportCard from "../Components/ReportCard";

interface DayViewProps {
  date: Date;
  reports: Report[];
  onEdit: (report: Report) => void;
}

export default function DayView({ date, reports, onEdit }: DayViewProps) {
  const filtered = reports.filter(
    (r) => new Date(r.date).toDateString() === date.toDateString()
  );

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6">Reports for {date.toDateString()}</Typography>
      {filtered.length === 0 ? (
        <Typography sx={{ mt: 2 }}>No reports for this day</Typography>
      ) : (
        filtered.map((report) => (
          <ReportCard key={report._id} report={report} onEdit={onEdit} />
        ))
      )}
    </Box>
  );
}
