import { AppSidebar } from '@/components/layout/app-sidebar';
import { SiteHeader } from '@/components/layout/site-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardRoutes from '../dashboard/routes';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster"
import PlotRoutes from '../plots/routes';
import TwoStepConfigure from '../auth/pages/TwoStepConfiguration';

const LayoutAppRoutes: React.FC = () => {
    return (
        <>
            <AuthProvider>
                <AuthMiddleware>
                    <Toaster />
                    <SidebarProvider className="flex flex-col">
                        <div className="flex overflow-x-hidden">
                            <AppSidebar />
                            <div className="">
                                <SiteHeader />
                                <div className='overflow-y-auto h-[calc(100vh-64px)]'>
                                    <Routes>
                                        <Route path="/dashboard/*" element={<DashboardRoutes />} />
                                        <Route path="/plots/*" element={<PlotRoutes />} />
                                        <Route path="/two-step" element={<TwoStepConfigure />} />
                                    </Routes>
                                </div>
                            </div>
                        </div>
                    </SidebarProvider>
                </AuthMiddleware>
            </AuthProvider>
        </>
    );
};

export default LayoutAppRoutes;