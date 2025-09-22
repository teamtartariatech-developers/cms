
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';

interface NotificationPermissionBannerProps {
  isSupported: boolean;
  permission: NotificationPermission;
  onRequestPermission: () => Promise<NotificationPermission>;
  onDismiss?: () => void;
}

const NotificationPermissionBanner = ({ 
  isSupported, 
  permission, 
  onRequestPermission,
  onDismiss 
}: NotificationPermissionBannerProps) => {
  if (!isSupported || permission === 'granted') {
    return null;
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">Enable Browser Notifications</h4>
              <p className="text-sm text-yellow-700">
                Get notified when new tasks are assigned to you or when it's time to update your timesheet.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={onRequestPermission} 
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Enable Notifications
            </Button>
            {onDismiss && (
              <Button 
                onClick={onDismiss} 
                size="sm" 
                variant="ghost"
                className="text-yellow-600 hover:text-yellow-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPermissionBanner;
