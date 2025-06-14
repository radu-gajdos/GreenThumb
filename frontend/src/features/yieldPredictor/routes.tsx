import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import AnalyticsPage from './pages/Index';

const YieldRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Remove the leading slash - this is critical */}
            <Route path="index" element={<AnalyticsPage />} />
            
            {/* Use the index prop for the root path */}
            <Route index element={<Navigate to="index" />} />
            
            {/* Change the wildcard redirect to be relative, not absolute */}
            <Route path="*" element={<Navigate to="index" replace />} />
        </Routes>
    );
};

export default YieldRoutes;