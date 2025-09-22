
import { useMockQuery } from '@/hooks/useMockData';
import { mockSupabase } from '@/services/mockSupabase';
import { useMockAuth } from '@/hooks/useMockAuth';

export const useExpensesData = () => {
  const { user } = useMockAuth();

  return useMockQuery(
    ['expenses-stats', user?.id],
    async () => {
      if (!user) return null;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        totalMonthly: 75000,
        fixedExpenses: 50000,
        variableExpenses: 25000,
        thisMonth: 75000,
      };
    },
    !!user && (user.role === 'founder' || user.role === 'cofounder')
  );
};

export const useExpenses = () => {
  const { user } = useAuth();

  return useMockQuery(
    ['expenses', user?.id],
    async () => {
      if (!user) return [];

      const { data, error } = await mockSupabase
        .from('company_expenses')
        .select('*')
        .order('expense_date', { ascending: false })
        .execute();

      if (error) {
        console.error('Error fetching expenses:', error);
        throw error;
      }

      return data || [];
    },
    !!user && (user.role === 'founder' || user.role === 'cofounder')
  );
};
