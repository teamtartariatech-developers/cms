
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useExpensesData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['expenses-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Get all expenses
      const { data: allExpenses } = await supabase
        .from('company_expenses')
        .select('amount, expense_type, expense_date, payment_status');

      if (!allExpenses) return null;

      // Calculate totals
      const fixedExpenses = allExpenses
        .filter(exp => exp.expense_type === 'fixed')
        .reduce((sum, exp) => sum + Number(exp.amount), 0);

      const variableExpenses = allExpenses
        .filter(exp => exp.expense_type === 'variable')
        .reduce((sum, exp) => sum + Number(exp.amount), 0);

      // Calculate this month's expenses
      const thisMonth = allExpenses
        .filter(exp => {
          const expDate = new Date(exp.expense_date);
          return expDate.getMonth() + 1 === currentMonth && expDate.getFullYear() === currentYear;
        })
        .reduce((sum, exp) => sum + Number(exp.amount), 0);

      return {
        totalMonthly: fixedExpenses + variableExpenses,
        fixedExpenses,
        variableExpenses,
        thisMonth,
      };
    },
    enabled: !!user && (user.role === 'founder' || user.role === 'cofounder'),
  });
};

export const useExpenses = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('company_expenses')
        .select(`
          *,
          profiles!company_expenses_created_by_fkey(
            first_name,
            last_name
          )
        `)
        .order('expense_date', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        throw error;
      }

      return data?.map(expense => ({
        ...expense,
        created_by_name: `${expense.profiles?.first_name} ${expense.profiles?.last_name}`,
      })) || [];
    },
    enabled: !!user && (user.role === 'founder' || user.role === 'cofounder'),
  });
};
