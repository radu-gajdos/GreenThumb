import { useAuth } from 'hooks/useAuth';
import React from 'react';
import { Navigate } from 'react-router-dom';

interface AuthMiddlewareProps {
  children: React.ReactNode;
}

export const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null; // or a loading spinner
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};