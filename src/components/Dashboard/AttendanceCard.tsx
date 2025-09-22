
import React, { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const AttendanceCard = React.memo(() => {
  const { user, checkIn, checkOut } = useAuth();

  const handleCheckIn = useCallback(() => {
    checkIn();
    toast.success('Checked in successfully!');
  }, [checkIn]);

  const handleCheckOut = useCallback(() => {
    checkOut();
    toast.success('Checked out successfully!');
  }, [checkOut]);

  const formatTime = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Attendance
        </CardTitle>
        <CardDescription>Track your daily attendance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
            user?.isCheckedIn 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
          }`}>
            {user?.isCheckedIn ? 'Checked In' : 'Checked Out'}
          </span>
        </div>

        {user?.lastCheckIn && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Check In:</span>
            <span className="text-sm text-muted-foreground">
              {formatTime(user.lastCheckIn)}
            </span>
          </div>
        )}

        {user?.lastCheckOut && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Check Out:</span>
            <span className="text-sm text-muted-foreground">
              {formatTime(user.lastCheckOut)}
            </span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleCheckIn} 
            disabled={user?.isCheckedIn}
            className="flex-1 transition-all duration-200"
            variant={user?.isCheckedIn ? "secondary" : "default"}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Check In
          </Button>
          <Button 
            onClick={handleCheckOut} 
            disabled={!user?.isCheckedIn}
            variant={!user?.isCheckedIn ? "secondary" : "destructive"}
            className="flex-1 transition-all duration-200"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Check Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

AttendanceCard.displayName = 'AttendanceCard';

export default AttendanceCard;
