import { AppSidebar } from '@/components/layout/app-sidebar';
import { SiteHeader } from '@/components/layout/site-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import DashboardRoutes from '../dashboard/routes';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';
import TwoStepConfigure from '../auth/pages/TwoStepConfiguration';
import { Toaster } from "@/components/ui/toaster"
import PlotRoutes from '../plots/routes';
import MapRoutes from '../map/routes';
import CalendarRoutes from '../calendar/routes';
import YieldRoutes from '../yieldPredictor/routes';
import AiRoutes from '../plots/aiRoutes';
import FieldNoteRoutes from '../fieldNotes/routes';

const LayoutAppRoutes: React.FC = () => {
    return (
        <AuthMiddleware>
            <Toaster />
            <SidebarProvider className="flex flex-col">
                <div className="flex min-h-screen">
                    <AppSidebar />
                    <div className="flex-1">
                        <SiteHeader />
                        <main className="p-4">
                            <Routes>
                                <Route path="dashboard/*" element={<DashboardRoutes />} />
                                <Route path="plots/*" element={<PlotRoutes />} />
                                <Route path="calendar/*" element={<CalendarRoutes />} />
                                <Route path="map/*" element={<MapRoutes />} />
                                <Route path="two-step" element={<TwoStepConfigure />} />
                                <Route path="field-notes/*" element={<FieldNoteRoutes />} />
                                <Route path="yield/*" element={<YieldRoutes />} />
                                <Route path="ai-chat/*" element={<AiRoutes />} />
                                <Route index element={<Navigate to="dashboard" replace />} />
                                <Route path="*" element={<Navigate to="dashboard" replace />} />
                            </Routes>
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </AuthMiddleware>
    );
};

export default LayoutAppRoutes;