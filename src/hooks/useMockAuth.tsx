import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockSupabase } from '@/services/mockSupabase';
import { currentUser, setCurrentUser, User } from '@/data/mockData';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(currentUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { unsubscribe } = mockSupabase.auth.onAuthStateChange((authUser) => {
      setUser(authUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await mockSupabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      return Boolean(data.user);
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await mockSupabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkIn = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      await mockSupabase
        .from('attendance')
        .upsert({
          user_id: user.id,
          date: today,
          check_in_time: now,
          status: 'present'
        });

      // Update current user state
      const updatedUser = { ...user, isCheckedIn: true, lastCheckIn: now };
      setCurrentUser(updatedUser);
      setUser(updatedUser);

    } catch (error) {
      console.error('Check-in error:', error);
      throw error;
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

      await mockSupabase
        .from('attendance')
        .update({
          check_out_time: now,
          hours_worked: Math.round(hoursWorked * 100) / 100
        })
        .eq('user_id', user.id)
        .eq('date', today);

      // Update current user state
      const updatedUser = { ...user, isCheckedIn: false, lastCheckOut: now };
      setCurrentUser(updatedUser);
      setUser(updatedUser);

    } catch (error) {
      console.error('Check-out error:', error);
      throw error;
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

export const useMockAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};