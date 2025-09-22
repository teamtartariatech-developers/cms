
import React from 'react';
import { useMockQuery, useMockMutation } from '@/hooks/useMockData';
import { mockSupabase } from '@/services/mockSupabase';
import { useMockAuth } from '@/hooks/useMockAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const NotificationCenter = () => {
  const { user } = useMockAuth();

  const { data: notifications } = useMockQuery(
    ['notifications', user?.id],
    async () => {
      if (!user?.id) return [];
      const { data, error } = await mockSupabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .execute();
      
      if (error) throw error;
      return data;
    },
    !!user?.id
  );

  const markAsRead = useMockMutation(async (id: string) => {
      const { error } = await mockSupabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
  });

  const deleteNotification = useMockMutation(async (id: string) => {
      const { error } = await mockSupabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Notification deleted');
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications?.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border rounded-lg ${
                !notification.is_read ? 'bg-muted/50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                  </p>
                </div>
                <div className="flex space-x-1">
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead.mutate(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNotification.mutate(notification.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {!notifications?.length && (
            <p className="text-center text-muted-foreground py-4">
              No notifications
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
