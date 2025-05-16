import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import PlotPage from './pages/PlotPage/PlotPage';

const PlotRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Remove the leading slash - this is critical */}
            <Route path="index" element={<Index />} />
            
            {/* Add the route for PlotPage */}
            <Route path="view/:id" element={<PlotPage />} />
            
            {/* Use the index prop for the root path */}
            <Route index element={<Navigate to="index" />} />
            
            {/* Change the wildcard redirect to be relative, not absolute */}
            <Route path="*" element={<Navigate to="index" replace />} />
        </Routes>
    );
};

export default PlotRoutes;