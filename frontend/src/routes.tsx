import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './features/auth/pages/Login';
import { Loader } from 'lucide-react';
import LayoutAppRoutes from './features/layout/routes';
import Register from './features/auth/pages/Register';

const AppRoutes: React.FC = () => {
  return (
    <ThemeProvider>
      <Suspense fallback={<Loader className="animate-spin" size={24} />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/app/*" element={<LayoutAppRoutes />} />
          <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
};

export default AppRoutes;