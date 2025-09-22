
import { useEffect, useState } from 'react';
import { useMockAuth } from '@/hooks/useMockAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export const useHourlyReminder = () => {
  const { user } = useMockAuth(); ;
  const { preferences } = useUserPreferences();
  const { toast } = useToast();
  const [lastReminderTime, setLastReminderTime] = useState<number>(0);

  useEffect(() => {
    if (!user || !preferences.hourly_task_reminders) return;

    const checkAndShowReminder = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentTime = now.getTime();
      
      // Only show reminder during work hours (9 AM to 6 PM)
      if (currentHour >= 9 && currentHour <= 18) {
        // Check if it's the start of a new hour and we haven't shown reminder recently
        if (now.getMinutes() === 0 && currentTime - lastReminderTime > 3540000) { // 59 minutes
          setLastReminderTime(currentTime);
          
          toast({
            title: "Hourly Reminder",
            description: "Time to update your timesheet and check your tasks!",
            action: (
              <Button 
                size="sm"
                onClick={() => window.location.href = '/timesheets'}
              >
                Go to Timesheets
              </Button>
            ),
          });
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkAndShowReminder, 60000);

    return () => clearInterval(interval);
  }, [user, preferences.hourly_task_reminders, toast, lastReminderTime]);
};
