"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ContentType = 'dashboard' | 'project-details' | 'daily-reports' | 'employees' | 'employee-list';

interface ContentContextType {
  currentContent: ContentType;
  setCurrentContent: (content: ContentType) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

interface ContentProviderProps {
  children: ReactNode;
}

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const [currentContent, setCurrentContent] = useState<ContentType>('dashboard');

  const value: ContentContextType = {
    currentContent,
    setCurrentContent,
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};