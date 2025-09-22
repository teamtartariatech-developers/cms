
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  project_updates: boolean;
  attendance_reminders: boolean;
  hourly_task_reminders: boolean;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  language: string;
}

const defaultPreferences: UserPreferences = {
  email_notifications: true,
  push_notifications: true,
  project_updates: true,
  attendance_reminders: true,
  hourly_task_reminders: true,
  theme: 'system',
  timezone: 'UTC',
  language: 'en'
};

export const useUserPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        // Type cast the data to ensure proper TypeScript types
        const typedPreferences: UserPreferences = {
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
          project_updates: data.project_updates,
          attendance_reminders: data.attendance_reminders,
          hourly_task_reminders: data.hourly_task_reminders,
          theme: data.theme as 'light' | 'dark' | 'system',
          timezone: data.timezone,
          language: data.language
        };
        setPreferences(typedPreferences);
      } else {
        // Create default preferences if none exist
        await createDefaultPreferences();
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert({ user_id: user.id, ...defaultPreferences })
        .select()
        .single();

      if (error) throw error;
      
      // Type cast the response data
      const typedPreferences: UserPreferences = {
        email_notifications: data.email_notifications,
        push_notifications: data.push_notifications,
        project_updates: data.project_updates,
        attendance_reminders: data.attendance_reminders,
        hourly_task_reminders: data.hourly_task_reminders,
        theme: data.theme as 'light' | 'dark' | 'system',
        timezone: data.timezone,
        language: data.language
      };
      setPreferences(typedPreferences);
    } catch (error) {
      console.error('Error creating default preferences:', error);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Type cast the response data
      const typedPreferences: UserPreferences = {
        email_notifications: data.email_notifications,
        push_notifications: data.push_notifications,
        project_updates: data.project_updates,
        attendance_reminders: data.attendance_reminders,
        hourly_task_reminders: data.hourly_task_reminders,
        theme: data.theme as 'light' | 'dark' | 'system',
        timezone: data.timezone,
        language: data.language
      };
      setPreferences(typedPreferences);
      
      toast({
        title: "Success",
        description: "Preferences updated successfully.",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences.",
        variant: "destructive",
      });
    }
  };

  return {
    preferences,
    updatePreferences,
    isLoading
  };
};
