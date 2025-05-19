import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Login from './features/auth/pages/Login';
import { Loader } from 'lucide-react';
import LayoutAppRoutes from './features/layout/routes';

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loader className="animate-spin" size={24} />}>
      {/* Wrapping the routes with ThemeProvider and LanguageProvider */}
      <ThemeProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
            <Route path="/app/*" element={<LayoutAppRoutes />} />
          </Routes>
      </ThemeProvider>
    </Suspense>
  );
};

export default AppRoutes;