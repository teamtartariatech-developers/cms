import { useState, useEffect } from 'react';
import { useMockAuth } from '@/hooks/useMockAuth';
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
  const { user } = useMockAuth();
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
      // Simulate API call with mock data
      const storedPreferences = localStorage.getItem(`preferences_${user.id}`);
      
      if (storedPreferences) {
        const parsedPreferences = JSON.parse(storedPreferences);
        setPreferences(parsedPreferences);
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
      // Simulate creating default preferences
      localStorage.setItem(`preferences_${user.id}`, JSON.stringify(defaultPreferences));
      setPreferences(defaultPreferences);
    } catch (error) {
      console.error('Error creating default preferences:', error);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      const updatedPreferences = { ...preferences, ...updates };
      
      // Simulate API call with localStorage
      localStorage.setItem(`preferences_${user.id}`, JSON.stringify(updatedPreferences));
      setPreferences(updatedPreferences);
      
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