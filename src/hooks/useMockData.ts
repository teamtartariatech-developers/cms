import { useState, useEffect } from 'react';
import { mockSupabase } from '@/services/mockSupabase';
import { currentUser } from '@/data/mockData';

// Mock hook for dashboard stats
export const useMockDashboardStats = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setData({
        totalEmployees: 15,
        presentToday: 12,
        activeProjects: 3,
        pendingTimesheets: 5,
      });
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  return { data, isLoading };
};

// Mock hook for clients data
export const useMockClientsData = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setData({
        totalClients: 25,
        activeClients: 20,
        totalRevenue: 500000,
        remainingBalance: 150000,
      });
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  return { data, isLoading };
};

// Mock hook for employees data
export const useMockEmployeesData = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setData({
        totalEmployees: 15,
        activeEmployees: 14,
        monthlySalary: 1200000,
        presentToday: 12,
      });
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  return { data, isLoading };
};

// Mock hook for expenses data
export const useMockExpensesData = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setData({
        totalMonthly: 75000,
        fixedExpenses: 50000,
        variableExpenses: 25000,
        thisMonth: 75000,
      });
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  return { data, isLoading };
};

// Generic mock query hook
export const useMockQuery = (queryKey: string[], queryFn: () => Promise<any>, enabled = true) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await queryFn();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [enabled, ...queryKey]);

  const refetch = async () => {
    if (!enabled) return;
    
    try {
      setIsLoading(true);
      const result = await queryFn();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refetch };
};

// Mock mutation hook
export const useMockMutation = (mutationFn: (variables: any) => Promise<any>) => {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (variables: any) => {
    try {
      setIsPending(true);
      await mutationFn(variables);
    } catch (error) {
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  const mutateAsync = async (variables: any) => {
    setIsPending(true);
    try {
      const result = await mutationFn(variables);
      return result;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, mutateAsync, isPending };
};