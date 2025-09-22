
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import AttendanceTable from '@/components/Attendance/AttendanceTable';
import HourlyUpdatePopup from '@/components/Timesheets/HourlyUpdatePopup';

const Attendance = () => {
  const { user, checkIn, checkOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showHourlyPopup, setShowHourlyPopup] = useState(false);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  const { data: attendanceRecords, refetch } = useQuery({
    queryKey: ['attendance', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleCheckIn = async () => {
    setIsLoading(true);
    await checkIn();
    await refetch();
    setIsLoading(false);
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    await checkOut();
    await refetch();
    setIsLoading(false);
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {user && (
        <HourlyUpdatePopup
          isOpen={showHourlyPopup}
          onClose={() => setShowHourlyPopup(false)}
          userId={user.id}
          currentHour={currentHour}
        />
      )}
      
      <div className="px-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Attendance</h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Track your daily attendance and working hours</p>
      </div>

      {/* Check In/Out Card */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3 md:pb-6">
          <CardTitle className="text-base sm:text-lg md:text-xl">Today's Attendance</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-2 flex-wrap">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">Status:</span>
                <Badge variant={user?.isCheckedIn ? "default" : "secondary"} className="text-xs">
                  {user?.isCheckedIn ? 'Checked In' : 'Checked Out'}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {!user?.isCheckedIn ? (
                <Button onClick={handleCheckIn} disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? 'Checking In...' : 'Check In'}
                </Button>
              ) : (
                <Button onClick={handleCheckOut} disabled={isLoading} variant="outline" className="w-full sm:w-auto">
                  {isLoading ? 'Checking Out...' : 'Check Out'}
                </Button>
              )}
            </div>
          </div>
          
          {user?.lastCheckIn && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Check In Time</p>
                <p className="font-medium text-xs sm:text-sm md:text-base">{format(new Date(user.lastCheckIn), 'h:mm a')}</p>
              </div>
              {user?.lastCheckOut && (
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Check Out Time</p>
                  <p className="font-medium text-xs sm:text-sm md:text-base">{format(new Date(user.lastCheckOut), 'h:mm a')}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Attendance Records */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3 md:pb-6">
          <CardTitle className="text-base sm:text-lg md:text-xl">Recent Attendance</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Your attendance history for the past 10 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {attendanceRecords?.map((record) => (
              <div key={record.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 border rounded-lg gap-2 sm:gap-3">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs sm:text-sm md:text-base truncate">{format(new Date(record.date), 'MMM d, yyyy')}</p>
                    <p className="text-xs text-muted-foreground">
                      {record.check_in_time && format(new Date(record.check_in_time), 'h:mm a')} - 
                      {record.check_out_time ? format(new Date(record.check_out_time), 'h:mm a') : 'In Progress'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-1 sm:gap-1">
                  <Badge variant={record.status === 'present' ? 'default' : 'secondary'} className="text-xs">
                    {record.status}
                  </Badge>
                  {record.hours_worked && (
                    <p className="text-xs text-muted-foreground">
                      {record.hours_worked}h worked
                    </p>
                  )}
                </div>
              </div>
            ))}
            {!attendanceRecords?.length && (
              <p className="text-center text-muted-foreground py-4 text-xs sm:text-sm">No attendance records found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Founder can see all employee attendance - Desktop only */}
      <div className="hidden lg:block">
        <AttendanceTable />
      </div>
      
      {/* Mobile message for founder table */}
      {user?.role === 'founder' && (
        <div className="lg:hidden">
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <p className="text-center text-muted-foreground text-xs sm:text-sm">
                Employee attendance table is available on desktop view
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Attendance;
