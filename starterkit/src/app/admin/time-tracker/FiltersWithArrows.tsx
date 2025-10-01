import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Button,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

interface FiltersWithArrowsProps {
  employees: { _id: string; username: string }[];
  projects: { _id: string; name: string }[];
  filterEmployee: string;
  filterProject: string;
  setFilterEmployee: (value: string) => void;
  setFilterProject: (value: string) => void;
  onPrevDate: () => void;
  onNextDate: () => void;
  clearFilters: () => void;
}

const FiltersWithArrows: React.FC<FiltersWithArrowsProps> = ({
  employees,
  projects,
  filterEmployee,
  filterProject,
  setFilterEmployee,
  setFilterProject,
  onPrevDate,
  onNextDate,
  clearFilters,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        mb: 3,
        p: 2,
        backgroundColor: "white",
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Employee</InputLabel>
          <Select
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            label="Employee"
          >
            <MenuItem value="">All Employees ({employees.length})</MenuItem>
            {employees.map((employee) => (
              <MenuItem key={employee._id} value={employee._id}>
                {employee.username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Project</InputLabel>
          <Select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            label="Project"
          >
            <MenuItem value="">All Projects ({projects.length})</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project._id} value={project._id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {(filterEmployee || filterProject) && (
          <Button
            variant="outlined"
            size="small"
            onClick={clearFilters}
            sx={{
              minWidth: 100,
              borderColor: "#f44336",
              color: "#f44336",
              "&:hover": {
                borderColor: "#d32f2f",
                backgroundColor: "#ffebee",
              },
            }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          onClick={onPrevDate}
          size="small"
          sx={{ backgroundColor: "#f5f5f5" }}
          aria-label="Previous Date"
        >
          <ArrowBack />
        </IconButton>
        <IconButton
          onClick={onNextDate}
          size="small"
          sx={{ backgroundColor: "#f5f5f5" }}
          aria-label="Next Date"
        >
          <ArrowForward />
        </IconButton>
      </Box>
    </Box>
  );
};

export default FiltersWithArrows;
