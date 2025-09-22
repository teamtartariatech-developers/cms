
import React, { useState, useEffect } from 'react';
import { useMockAuth } from '@/hooks/useMockAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Clock, Save, Lock } from 'lucide-react';

interface HourlyEntry {
  hour: number;
  activity: string;
  timestamp?: string;
  isLocked: boolean;
}

const HourlyTimesheetForm = () => {
  const { user } = useMockAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<HourlyEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Work hours from 9 AM to 6 PM (9 hours total)
  const workHours = Array.from({ length: 9 }, (_, i) => i + 9);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      loadExistingEntries();
    }
  }, [user]);

  useEffect(() => {
    // Update lock status when current time changes
    updateLockStatus();
  }, [currentTime, entries]);

  const loadExistingEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('timesheets')
        .select('hourly_updates')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading timesheet:', error);
        return;
      }

      const existingUpdates = data?.hourly_updates as any[] || [];
      const initialEntries: HourlyEntry[] = workHours.map(hour => {
        const existingEntry = existingUpdates.find(update => update.hour === hour);
        return {
          hour,
          activity: existingEntry?.description || '',
          timestamp: existingEntry?.timestamp,
          isLocked: isHourLocked(hour)
        };
      });

      setEntries(initialEntries);
    } catch (error) {
      console.error('Error loading existing entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isHourLocked = (hour: number): boolean => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // Calculate the deadline for this hour (2 hours after the hour ends)
    const hourEnd = hour + 1;
    const deadline = hourEnd + 2;
    
    // If current time is past the deadline, lock the field
    if (currentHour > deadline || (currentHour === deadline && currentMinutes >= 0)) {
      return true;
    }
    
    return false;
  };

  const updateLockStatus = () => {
    setEntries(prevEntries => 
      prevEntries.map(entry => ({
        ...entry,
        isLocked: isHourLocked(entry.hour)
      }))
    );
  };

  const updateActivity = (hour: number, activity: string) => {
    setEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.hour === hour ? { ...entry, activity } : entry
      )
    );
  };

  const saveEntry = async (hour: number) => {
    if (!user) return;

    const entry = entries.find(e => e.hour === hour);
    if (!entry || !entry.activity.trim()) {
      toast({
        title: "Error",
        description: "Please enter an activity description.",
        variant: "destructive",
      });
      return;
    }

    if (entry.isLocked) {
      toast({
        title: "Entry Locked",
        description: "This time slot is no longer editable.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Get existing timesheet
      const { data: existingTimesheet } = await supabase
        .from('timesheets')
        .select('hourly_updates, hours_worked')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      const newUpdate = {
        hour,
        description: entry.activity.trim(),
        timestamp: new Date().toISOString()
      };

      let updates = [];
      if (existingTimesheet?.hourly_updates) {
        const existing = Array.isArray(existingTimesheet.hourly_updates) 
          ? existingTimesheet.hourly_updates as any[]
          : [];
        
        // Remove any existing entry for this hour and add the new one
        updates = existing.filter((u: any) => u.hour !== hour);
        updates.push(newUpdate);
      } else {
        updates = [newUpdate];
      }

      // Calculate total hours worked based on filled entries
      const hoursWorked = updates.length;

      if (existingTimesheet) {
        // Update existing timesheet
        const { error } = await supabase
          .from('timesheets')
          .update({ 
            hourly_updates: updates,
            hours_worked: hoursWorked
          })
          .eq('user_id', user.id)
          .eq('date', today);

        if (error) throw error;
      } else {
        // Create new timesheet
        const { error } = await supabase
          .from('timesheets')
          .insert({
            user_id: user.id,
            date: today,
            hours_worked: hoursWorked,
            hourly_updates: updates,
            status: 'draft'
          });

        if (error) throw error;
      }

      // Update local state with timestamp
      setEntries(prevEntries =>
        prevEntries.map(e =>
          e.hour === hour ? { ...e, timestamp: newUpdate.timestamp } : e
        )
      );

      toast({
        title: "Entry Saved",
        description: `Activity for ${hour}:00 has been saved.`,
      });

    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getTimeStatus = (hour: number) => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour < hour) {
      return { status: 'upcoming', color: 'bg-gray-100 text-gray-800' };
    } else if (currentHour === hour) {
      return { status: 'current', color: 'bg-blue-100 text-blue-800' };
    } else if (currentHour <= hour + 2) {
      return { status: 'editable', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'locked', color: 'bg-red-100 text-red-800' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Daily Timesheet - {new Date(today).toLocaleDateString()}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Fill in your work activity for each hour. Fields become locked 2 hours after the time slot ends.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry) => {
            const timeStatus = getTimeStatus(entry.hour);
            const timeSlot = `${entry.hour}:00 - ${entry.hour + 1}:00`;
            
            return (
              <div key={entry.hour} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{timeSlot}</span>
                    <Badge className={timeStatus.color}>
                      {timeStatus.status === 'upcoming' && 'Upcoming'}
                      {timeStatus.status === 'current' && 'Current Hour'}
                      {timeStatus.status === 'editable' && 'Editable'}
                      {timeStatus.status === 'locked' && 'Locked'}
                    </Badge>
                  </div>
                  {entry.timestamp && (
                    <span className="text-xs text-muted-foreground">
                      Last saved: {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Textarea
                    value={entry.activity}
                    onChange={(e) => updateActivity(entry.hour, e.target.value)}
                    placeholder={
                      entry.isLocked 
                        ? "This entry is locked" 
                        : "Describe what you worked on during this hour..."
                    }
                    disabled={entry.isLocked}
                    className={entry.isLocked ? "bg-gray-50" : ""}
                    rows={2}
                  />
                  
                  <div className="flex justify-between items-center">
                    <div>
                      {entry.isLocked && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Lock className="h-3 w-3" />
                          Entry locked (deadline passed)
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => saveEntry(entry.hour)}
                      disabled={entry.isLocked || !entry.activity.trim() || isSaving}
                      size="sm"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Legend:</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-gray-100 text-gray-800">Upcoming</Badge>
              <span>Future time slots</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">Current</Badge>
              <span>Current hour</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">Editable</Badge>
              <span>Can still be edited (within 2 hours)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-100 text-red-800">Locked</Badge>
              <span>No longer editable (2+ hours passed)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HourlyTimesheetForm;
