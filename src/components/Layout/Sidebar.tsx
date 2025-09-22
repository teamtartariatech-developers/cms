
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useMockAuth } from '@/hooks/useMockAuth';
import { cn } from '@/lib/utils';
import { useLeadsPermission } from '@/hooks/useLeadsAccess';
import { 
  LayoutDashboard, 
  Clock, 
  Users, 
  FolderOpen, 
  Calendar,
  FileText,
  Settings,
  BarChart3,
  MessageSquare,
  UserCheck,
  UserCog,
  DollarSign,
  UserPlus
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useMockAuth();
  const { canAccessLeads } = useLeadsPermission();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, access: ['all'] },
    { name: 'Attendance', href: '/attendance', icon: Clock, access: ['all'] },
    { name: 'Timesheets', href: '/timesheets', icon: FileText, access: ['all'] },
    { name: 'Projects', href: '/projects', icon: FolderOpen, access: ['all'] },
    { name: 'Employees', href: '/employees', icon: Users, access: ['founder', 'cofounder', 'manager', 'hr'] },
    { name: 'Clients', href: '/client-management', icon: UserCog, access: ['founder', 'cofounder'] },
    { name: 'Leads', href: '/leads', icon: UserPlus, access: ['all'] },
    { name: 'Company Expenses', href: '/company-expenses', icon: DollarSign, access: ['founder', 'cofounder'] },
    { name: 'Calendar', href: '/calendar', icon: Calendar, access: ['all'] },
    { name: 'Reports', href: '/reports', icon: BarChart3, access: ['founder', 'cofounder', 'manager', 'hr'] },
    { name: 'Announcements', href: '/announcements', icon: MessageSquare, access: ['all'] },
    { name: 'User Management', href: '/user-management', icon: UserCheck, access: ['founder', 'cofounder', 'hr'] },
    { name: 'Settings', href: '/settings', icon: Settings, access: ['all'] },
  ];

  const hasAccess = (accessRoles: string[]) => {
    return accessRoles.includes('all') || accessRoles.includes(user?.role || '');
  };

  return (
    <div className="w-64 bg-card border-r border-border h-full">
      <div className="p-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            if (item.href === '/leads') {
              const showLeads = (user?.role === 'founder') || canAccessLeads;
              if (!showLeads) return null;
            } else if (!hasAccess(item.access)) {
              return null;
            }
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
