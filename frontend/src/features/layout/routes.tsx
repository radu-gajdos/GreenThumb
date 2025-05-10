import { AppSidebar } from '@/components/layout/app-sidebar';
import { SiteHeader } from '@/components/layout/site-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardRoutes from '../dashboard/routes';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster"

const LayoutAppRoutes: React.FC = () => {
    return (
        <>
            <AuthProvider>
                <AuthMiddleware>
                    <Toaster />
                    <SidebarProvider className="flex flex-col">
                        <div className="flex overflow-x-hidden">
                            <AppSidebar />
                            <div className="flex-1 overflow-auto">
                                <SiteHeader />
                                <Routes>
                                    <Route path="/dashboard/*" element={<DashboardRoutes />} />
                                </Routes>
                            </div>
                        </div>
                    </SidebarProvider>
                </AuthMiddleware>
            </AuthProvider>
        </>
    );
};

export default LayoutAppRoutes;