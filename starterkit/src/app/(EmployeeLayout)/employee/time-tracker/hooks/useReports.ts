import { useState, useEffect } from "react";
import { Report } from "../types/report";

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then(setReports)
      .catch((err) => console.error("Error fetching reports", err));
  }, []);

  const addReport = async (newReport: Partial<Report>) => {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReport),
    });
    if (res.ok) {
      const saved = await res.json();
      setReports((prev) => [...prev, saved]);
    }
  };

  const updateReport = async (id: string, updated: Partial<Report>) => {
    const res = await fetch(`/api/reports/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      const saved = await res.json();
      setReports((prev) => prev.map((r) => (r._id === id ? saved : r)));
    }
  };

  return { reports, addReport, updateReport };
}
