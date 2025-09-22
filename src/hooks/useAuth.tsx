
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'founder' | 'cofounder' | 'manager' | 'employee' | 'hr' | 'intern';
  department: string | null;
  position: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
}

interface User extends Profile {
  name: string;
  isCheckedIn: boolean;
  lastCheckIn?: string;
  lastCheckOut?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        // Use setTimeout to defer async operations and prevent blocking
        setTimeout(() => {
          fetchUserProfile(session.user);
        }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Then check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session?.user?.email);
        
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setIsLoading(false);
      }
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Fetching profile for user:', supabaseUser.id);
      
      // Single query to get both profile and today's attendance
      const today = new Date().toISOString().split('T')[0];
      
      const [profileResult, attendanceResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .maybeSingle(),
        supabase
          .from('attendance')
          .select('check_in_time, check_out_time')
          .eq('user_id', supabaseUser.id)
          .eq('date', today)
          .maybeSingle()
      ]);

      let profile = profileResult.data;

      // If profile doesn't exist, create one
      if (!profile && profileResult.error?.code === 'PGRST116') {
        console.log('Profile not found, creating new profile...');
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            first_name: supabaseUser.user_metadata?.first_name || '',
            last_name: supabaseUser.user_metadata?.last_name || '',
            role: (supabaseUser.user_metadata?.role as any) || 'employee'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          setIsLoading(false);
          return;
        }
        
        profile = newProfile;
      } else if (profileResult.error && profileResult.error.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileResult.error);
        setIsLoading(false);
        return;
      }

      if (profile) {
        console.log('Profile found:', profile);
        
        const attendance = attendanceResult.data;
        const userWithAttendance: User = {
          ...profile,
          name: `${profile.first_name} ${profile.last_name}`,
          isCheckedIn: Boolean(attendance?.check_in_time && !attendance?.check_out_time),
          lastCheckIn: attendance?.check_in_time || undefined,
          lastCheckOut: attendance?.check_out_time || undefined,
        };

        console.log('Setting user:', userWithAttendance);
        setUser(userWithAttendance);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error('Login error:', error);
        
        // Better error handling
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please check your credentials.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
        }
        
        return false;
      }

      console.log('Login successful for:', data.user?.email);
      return Boolean(data.user);
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkIn = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('attendance')
        .upsert({
          user_id: user.id,
          date: today,
          check_in_time: now,
          status: 'present'
        });

      if (error) {
        toast({
          title: "Check-in Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setUser({
        ...user,
        isCheckedIn: true,
        lastCheckIn: now,
      });

      toast({
        title: "Checked In",
        description: "You have successfully checked in for today.",
      });
    } catch (error) {
      console.error('Check-in error:', error);
      toast({
        title: "Check-in Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const checkOut = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      // Calculate hours worked
      const checkInTime = user.lastCheckIn ? new Date(user.lastCheckIn) : new Date();
      const checkOutTime = new Date(now);
      const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase
        .from('attendance')
        .update({
          check_out_time: now,
          hours_worked: Math.round(hoursWorked * 100) / 100
        })
        .eq('user_id', user.id)
        .eq('date', today);

      if (error) {
        toast({
          title: "Check-out Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setUser({
        ...user,
        isCheckedIn: false,
        lastCheckOut: now,
      });

      toast({
        title: "Checked Out",
        description: `You have successfully checked out. Hours worked: ${Math.round(hoursWorked * 100) / 100}`,
      });
    } catch (error) {
      console.error('Check-out error:', error);
      toast({
        title: "Check-out Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    login,
    logout,
    checkIn,
    checkOut,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
