"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DashboardContextType {
  activeTab: number;
  setActiveTab: (tab: number) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);

  const value: DashboardContextType = {
    activeTab,
    setActiveTab,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
