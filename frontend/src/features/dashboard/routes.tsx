import React from "react"
import { Route, Routes, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import DashboardIndex from "./components/DashboardIndex";

const DashboardRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/index" element={<DashboardIndex />} />
      <Route path="*" element={<Navigate to="/app/dashboard/index" />} />
    </Routes>
  );
};

export default DashboardRoutes;