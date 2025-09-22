
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/Layout/MainLayout';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Attendance from '@/pages/Attendance';
import Projects from '@/pages/Projects';
import Employees from '@/pages/Employees';
import CompanyExpenses from '@/pages/CompanyExpenses';
import Timesheets from '@/pages/Timesheets';
import Calendar from '@/pages/Calendar';
import Reports from '@/pages/Reports';
import Announcements from '@/pages/Announcements';
import UserManagement from '@/pages/UserManagement';
import ClientManagement from '@/pages/ClientManagement';
import Leads from '@/pages/Leads';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public route for non-authenticated users */}
        <Route path="/" element={!user ? <Index /> : <Navigate to="/dashboard" replace />} />
        
        {/* Protected routes for authenticated users */}
        {user ? (
          <Route path="/" element={<MainLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="projects" element={<Projects />} />
            <Route path="employees" element={<Employees />} />
            <Route path="company-expenses" element={<CompanyExpenses />} />
            <Route path="timesheets" element={<Timesheets />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="reports" element={<Reports />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="client-management" element={<ClientManagement />} />
            <Route path="leads" element={<Leads />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        ) : (
          /* Redirect all other routes to home for non-authenticated users */
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
        
        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
