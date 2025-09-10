"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '@/utils/axios';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'superAdmin' | 'employee';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  register: (username: string, password: string, role: 'admin' | 'superAdmin' | 'employee') => Promise<{ success: boolean; message?: string }>;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  const clearAuth = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      console.log('🔐 Attempting login for user:', username);
      clearAuth(); // Ensure auth data is cleared before attempt
      
      let response;
      try {
        // Try regular auth first (for admin/superAdmin)
        console.log('🔄 Trying admin auth for user:', username);
        response = await axios.post('/auth/login', { username, password });
        console.log('✅ Admin login successful for user:', username, 'Response:', response.data);
      } catch (adminError: any) {
        console.log('❌ Admin login failed:', adminError.response?.status, adminError.response?.data);
        if (adminError.response?.status === 401) {
          // If admin login fails, try employee auth
          console.log('🔄 Trying employee auth for user:', username);
          response = await axios.post('/employee-auth/login', { username, password });
          console.log('✅ Employee login successful for user:', username, 'Response:', response.data);
        } else {
          console.log('❌ Admin login error (not 401):', adminError.message);
          throw adminError;
        }
      }
      
      if (response.data && response.data.token) {
        const userData = {
          id: response.data._id,
          username: response.data.username,
          role: response.data.role,
        };
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      } else {
        console.log('❌ No token in response:', response.data);
        return { success: false, message: 'Login failed - Invalid response' };
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error.response?.data?.message || error.message);
      clearAuth(); // Ensure auth state is cleared on any error
      if (error.response?.status === 401) {
        return { success: false, message: 'Invalid credentials. Please check your username and password.' };
      }
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string, role: 'admin' | 'superAdmin' | 'employee'): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/register', { username, password, role });
      if (response.data && response.data.token) {
        const userData = {
          id: response.data._id,
          username: response.data.username,
          role: response.data.role,
        };
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, message: 'Registration failed - Invalid response' };
      }
    } catch (error: any) {
      console.error('Registration failed:', error.response?.data?.message || error.message);
      if (error.response?.status === 400) {
        return { success: false, message: 'Username already exists' };
      }
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
  };

  useEffect(() => {
    const initAuth = () => {
      console.log('🔍 Initializing authentication...');
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('✅ User authenticated from localStorage:', parsedUser.username);
          setUser(parsedUser);
        } catch (error) {
          console.log('❌ Error parsing user data, clearing localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        console.log('ℹ️ No authentication data found - user needs to login');
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (user) {
      console.log('👤 User state updated:', user.username, 'Role:', user.role, 'ID:', user.id);
    } else {
      console.log('👤 User state cleared');
    }
  }, [user]);

  // Axios interceptor is handled in utils/axios.js

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};