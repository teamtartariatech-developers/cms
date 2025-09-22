
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useBrowserNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!user || permission !== 'granted' || !('Notification' in window)) return;

    console.log('Setting up real-time notifications for user:', user.id);

    // Subscribe to real-time notifications for hourly tasks
    const channel = supabase
      .channel('hourly-task-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hourly_tasks',
          filter: `assigned_to=eq.${user.id}`
        },
        (payload) => {
          console.log('New hourly task assigned:', payload);
          const task = payload.new;
          
          if (task && task.task_description) {
            new Notification('New Hourly Task Assigned', {
              body: `You have been assigned a task for ${task.hour}:00 - ${task.task_description}`,
              icon: '/favicon.ico',
              tag: `hourly-task-${task.id}`,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification:', payload);
          const notification = payload.new;
          
          if (notification && notification.type === 'task') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
              tag: `notification-${notification.id}`,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Notification subscription status:', status);
      });

    return () => {
      console.log('Cleaning up notification subscription');
      supabase.removeChannel(channel);
    };
  }, [user, permission]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return 'denied';
    }

    if (permission === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result);
      console.log('Notification permission result:', result);
      return result;
    }
    return permission;
  };

  return {
    permission,
    requestPermission,
    isSupported: 'Notification' in window,
  };
};
