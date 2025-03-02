import { UserType } from '../auth/interfaces/user';
import { authApi } from '../auth/api/auth';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  verify2FA: (token: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tempToken');
    setUser(null);
    navigate('/login');
  };
  
  const checkAuth = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const { data } = await authApi.me();
        setUser(data);
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const verify2FA = async (token: string, rememberMe: boolean) => {
    const { data } = await authApi.verify2FA({ token, rememberMe });
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, verify2FA }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};