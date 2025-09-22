import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import HourlyUpdatePopup from '@/components/Timesheets/HourlyUpdatePopup';
import TaskList from '@/components/Tasks/TaskList';
import HourlyTimesheetForm from '@/components/Timesheets/HourlyTimesheetForm';
import HourlyTimesheetTable from '@/components/Timesheets/HourlyTimesheetTable';
import TaskAssignmentTable from '@/components/Timesheets/TaskAssignmentTable';
import NotificationPermissionBanner from '@/components/Timesheets/NotificationPermissionBanner';
import AllTimesheetsView from '@/components/Timesheets/AllTimesheetsView';
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications';

interface HourlyUpdate {
  hour: number;
  description: string;
  timestamp: string;
}

interface Timesheet {
  id: string;
  date: string;
  hours_worked: number;
  status: string;
  hourly_updates: HourlyUpdate[];
  user_id: string;
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

const Timesheets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { permission, requestPermission, isSupported } = useBrowserNotifications();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHourlyPopup, setShowHourlyPopup] = useState(false);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [activeTab, setActiveTab] = useState<'hourly-form' | 'tasks' | 'timesheets' | 'hourly-table' | 'assign' | 'all-timesheets'>('hourly-form');
  const [showNotificationBanner, setShowNotificationBanner] = useState(true);

  // Request notification permission on component mount
  useEffect(() => {
    if (isSupported && permission === 'default' && showNotificationBanner) {
      // Auto-request permission after 2 seconds if user hasn't dismissed
      const timer = setTimeout(() => {
        requestPermission();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, requestPermission, showNotificationBanner]);

  useEffect(() => {
    if (user) {
      fetchTimesheets();
    }
  }, [user]);

  const fetchTimesheets = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('timesheets')
        .select(`
          *,
          profiles!user_id (
            first_name,
            last_name
          )
        `)
        .order('date', { ascending: false });

      if (user.role !== 'founder' && user.role !== 'manager' && user.role !== 'hr') {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching timesheets:', error);
        toast({
          title: "Error",
          description: "Failed to fetch timesheets.",
          variant: "destructive",
        });
        return;
      }

      const processedData = data?.map(timesheet => ({
        ...timesheet,
        hourly_updates: Array.isArray(timesheet.hourly_updates) 
          ? (timesheet.hourly_updates as unknown as HourlyUpdate[])
          : [],
        profiles: timesheet.profiles || null
      })) || [];

      setTimesheets(processedData);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWorkOnTask = (taskId: string) => {
    setCurrentHour(new Date().getHours());
    setShowHourlyPopup(true);
  };

  const handleRequestNotificationPermission = async (): Promise<NotificationPermission> => {
    const result = await requestPermission();
    if (result === 'granted') {
      toast({
        title: "Notifications Enabled",
        description: "You'll now receive notifications for new task assignments.",
      });
      setShowNotificationBanner(false);
    } else if (result === 'denied') {
      toast({
        title: "Notifications Blocked",
        description: "Please enable notifications in your browser settings to receive task alerts.",
        variant: "destructive",
      });
    }
    return result;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isManagerOrAbove = user?.role === 'founder' || user?.role === 'manager' || user?.role === 'hr';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Work Management</h1>
        {isManagerOrAbove && (
          <div className="text-xs sm:text-sm text-muted-foreground">
            Managing all employee data
          </div>
        )}
      </div>

      <NotificationPermissionBanner 
        isSupported={isSupported}
        permission={permission}
        onRequestPermission={handleRequestNotificationPermission}
        onDismiss={() => setShowNotificationBanner(false)}
      />

      <div className="flex bg-muted rounded-lg p-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('hourly-form')}
          className={`flex-shrink-0 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'hourly-form' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Hourly Timesheet
        </button>
        <button
          onClick={() => setActiveTab('hourly-table')}
          className={`flex-shrink-0 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'hourly-table' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Hourly Tasks
        </button>
        {isManagerOrAbove && (
          <button
            onClick={() => setActiveTab('assign')}
            className={`flex-shrink-0 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'assign' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Assign Tasks
          </button>
        )}
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-shrink-0 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'tasks' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          My Tasks
        </button>
        <button
          onClick={() => setActiveTab('timesheets')}
          className={`flex-shrink-0 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'timesheets' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          My Timesheets
        </button>
        {isManagerOrAbove && (
          <button
            onClick={() => setActiveTab('all-timesheets')}
            className={`flex-shrink-0 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all-timesheets' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Timesheets
          </button>
        )}
      </div>

      {activeTab === 'hourly-form' && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Daily Activity Tracker</h2>
          <HourlyTimesheetForm />
        </div>
      )}

      {activeTab === 'hourly-table' && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Hourly Schedule</h2>
          <HourlyTimesheetTable />
        </div>
      )}

      {activeTab === 'assign' && isManagerOrAbove && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Task Assignment</h2>
          <TaskAssignmentTable />
        </div>
      )}

      {activeTab === 'tasks' && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Active Tasks</h2>
          <TaskList onStartWorkOnTask={handleStartWorkOnTask} />
        </div>
      )}

      {activeTab === 'timesheets' && (
        <div className="grid gap-3 sm:gap-4 md:gap-6">
          {timesheets.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground text-sm">
                  No timesheets found.
                </p>
              </CardContent>
            </Card>
          ) : (
            timesheets.map((timesheet) => (
              <Card key={timesheet.id}>
                <CardHeader className="pb-2 sm:pb-3 md:pb-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm sm:text-base md:text-lg break-words">
                        {timesheet.profiles && (
                          <span className="block sm:inline">
                            {`${timesheet.profiles.first_name} ${timesheet.profiles.last_name}`}
                            <span className="hidden sm:inline"> - </span>
                          </span>
                        )}
                        <span className="block sm:inline">
                          {new Date(timesheet.date).toLocaleDateString()}
                        </span>
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Hours worked: {timesheet.hours_worked}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(timesheet.status)} text-xs flex-shrink-0`}>
                      {timesheet.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {timesheet.hourly_updates && timesheet.hourly_updates.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Hourly Updates:</h4>
                      <div className="space-y-2">
                        {timesheet.hourly_updates.map((update, index) => (
                          <div key={index} className="border-l-2 border-primary pl-2 sm:pl-3 md:pl-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                              <span className="font-medium text-xs sm:text-sm md:text-base">{update.hour}:00</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(update.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                              {update.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'all-timesheets' && isManagerOrAbove && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">All Employee Timesheets</h2>
          <AllTimesheetsView />
        </div>
      )}

      {user && (
        <HourlyUpdatePopup
          isOpen={showHourlyPopup}
          onClose={() => setShowHourlyPopup(false)}
          userId={user.id}
          currentHour={currentHour}
        />
      )}
    </div>
  );
};

export default Timesheets;
