import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Index from './pages/Index';

const PlotRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/index" element={<Index />} />
            <Route path="*" element={<Navigate to="/app/plots/index" />} />
        </Routes>
    );
};

export default PlotRoutes;