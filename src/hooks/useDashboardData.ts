
import { useMockQuery } from '@/hooks/useMockData';
import { useMockAuth } from '@/hooks/useMockAuth';

export const useDashboardStats = () => {
  const { user } = useMockAuth();

  return useMockQuery(
    ['dashboard-stats', user?.id],
    async () => {
      if (!user) return null;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        totalEmployees: 15,
        presentToday: 12,
        activeProjects: 3,
        pendingTimesheets: 5,
      };
    },
    !!user
  );
};

export const useRecentActivity = () => {
  const { user } = useAuth();

  return useMockQuery(
    ['recent-activity', user?.id],
    async () => {
      if (!user) return [];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const activities = [
        {
          id: '1',
          type: 'announcement' as const,
          title: 'New Office Hours',
          description: 'Office hours updated to 9 AM - 6 PM',
          timestamp: new Date().toISOString(),
          priority: 'high',
          user: 'John Doe',
        },
        {
          id: '2',
          type: 'event' as const,
          title: 'Team Meeting',
          description: 'Weekly standup meeting',
          timestamp: new Date().toISOString(),
          user: 'Jane Smith',
        },
      ];

      return activities;
    },
    !!user
  );
};
