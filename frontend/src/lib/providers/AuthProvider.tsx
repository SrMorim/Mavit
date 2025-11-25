'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, setTokens, clearTokens, getTokens } from '@/lib/api';
import { User, LoginCredentials, RegisterCredentials, AuthTokens } from '@/types';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const { accessToken, refreshToken } = getTokens();
      
      if (accessToken && refreshToken) {
        try {
          // Verify token and get user profile
          const response = await apiClient.auth.getProfile();
          setUser(response.data.data.user);
        } catch (error) {
          // Token might be expired, try refresh
          try {
            const refreshResponse = await apiClient.auth.refreshToken(refreshToken);
            const tokens = refreshResponse.data.data.tokens;
            setTokens(tokens);
            
            // Get user profile with new token
            const profileResponse = await apiClient.auth.getProfile();
            setUser(profileResponse.data.data.user);
          } catch (refreshError) {
            // Refresh failed, clear tokens
            clearTokens();
            setUser(null);
          }
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      const response = await apiClient.auth.login(credentials);
      const { user: userData, tokens } = response.data.data;
      
      // Store tokens
      setTokens(tokens);
      setUser(userData);
      
      toast.success('Login realizado com sucesso!');
      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Erro ao fazer login';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);
      
      const response = await apiClient.auth.register(credentials);
      const { user: userData, tokens } = response.data.data;
      
      // Store tokens
      setTokens(tokens);
      setUser(userData);
      
      toast.success('Conta criada com sucesso!');
      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Erro ao criar conta';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Try to notify server about logout
      await apiClient.auth.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      // Clear local state regardless
      clearTokens();
      setUser(null);
      router.push('/auth/login');
      toast.success('Logout realizado com sucesso!');
    }
  };

  const refreshAuth = async () => {
    const { accessToken, refreshToken } = getTokens();
    
    if (refreshToken) {
      try {
        const response = await apiClient.auth.refreshToken(refreshToken);
        const tokens = response.data.data.tokens;
        setTokens(tokens);
        
        // Get updated user profile
        const profileResponse = await apiClient.auth.getProfile();
        setUser(profileResponse.data.data.user);
      } catch (error) {
        // Refresh failed, logout user
        clearTokens();
        setUser(null);
        router.push('/auth/login');
      }
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};