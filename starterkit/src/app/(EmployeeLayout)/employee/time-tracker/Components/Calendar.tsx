"use client";
import { Box, Grid, Typography } from "@mui/material";

interface CalendarProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function Calendar({ currentDate, onSelectDate }: CalendarProps) {
  const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const end = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const days: Date[] = [];
  for (let d = start.getDate(); d <= end.getDate(); d++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), d));
  }

  return (
    <Grid container spacing={1}>
      {days.map((day) => (
        <Grid
          item
          xs={12 / 7}
          key={day.toISOString()}
          onClick={() => onSelectDate(day)}
        >
          <Box
            sx={{
              border: "1px solid #ccc",
              p: 1,
              textAlign: "center",
              cursor: "pointer",
              "&:hover": { background: "#e0f7fa" },
            }}
          >
            <Typography>{day.getDate()}</Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}
