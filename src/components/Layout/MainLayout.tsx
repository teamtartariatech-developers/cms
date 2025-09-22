
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useHourlyReminder } from '@/hooks/useHourlyReminder';
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications';

const MainLayout = () => {
  // Initialize hourly reminder system
  useHourlyReminder();
  
  // Initialize browser notifications
  useBrowserNotifications();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-background w-full">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="p-2 sm:p-3 md:p-4 lg:p-6 max-w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
