
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useDashboardStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const today = new Date().toISOString().split('T')[0];
      
      // Get total employees
      const { count: totalEmployees } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get today's attendance
      const { count: presentToday } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'present');

      // Get active projects
      const { count: activeProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get pending timesheets for managers
      let pendingTimesheets = 0;
      if (user.role === 'manager' || user.role === 'founder' || user.role === 'hr') {
        const { count } = await supabase
          .from('timesheets')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'submitted');
        pendingTimesheets = count || 0;
      }

      return {
        totalEmployees: totalEmployees || 0,
        presentToday: presentToday || 0,
        activeProjects: activeProjects || 0,
        pendingTimesheets,
      };
    },
    enabled: !!user,
  });
};

export const useRecentActivity = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-activity', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get recent announcements
      const { data: announcements } = await supabase
        .from('announcements')
        .select(`
          id,
          title,
          content,
          priority,
          created_at,
          created_by,
          profiles!announcements_created_by_fkey(first_name, last_name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get upcoming calendar events
      const { data: events } = await supabase
        .from('calendar_events')
        .select(`
          id,
          title,
          description,
          start_date,
          end_date,
          created_by,
          profiles!calendar_events_created_by_fkey(first_name, last_name)
        `)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(3);

      const activities = [
        ...(announcements || []).map(announcement => ({
          id: announcement.id,
          type: 'announcement' as const,
          title: announcement.title,
          description: announcement.content,
          timestamp: announcement.created_at,
          priority: announcement.priority,
          user: announcement.profiles 
            ? `${announcement.profiles.first_name} ${announcement.profiles.last_name}`
            : 'Unknown',
        })),
        ...(events || []).map(event => ({
          id: event.id,
          type: 'event' as const,
          title: event.title,
          description: event.description || '',
          timestamp: event.start_date,
          user: event.profiles 
            ? `${event.profiles.first_name} ${event.profiles.last_name}`
            : 'Unknown',
        })),
      ];

      return activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 10);
    },
    enabled: !!user,
  });
};
