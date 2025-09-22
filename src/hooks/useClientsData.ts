
import { useMockQuery } from '@/hooks/useMockData';
import { mockSupabase } from '@/services/mockSupabase';
import { useMockAuth } from '@/hooks/useMockAuth';

export const useClientsData = () => {
  const { user } = useMockAuth();

  return useMockQuery(
    ['clients-stats', user?.id],
    async () => {
      if (!user) return null;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        totalClients: 25,
        activeClients: 20,
        totalRevenue: 500000,
        remainingBalance: 150000,
      };
    },
    !!user && (user.role === 'founder' || user.role === 'cofounder')
  );
};

export const useClients = () => {
  const { user } = useAuth();

  return useMockQuery(
    ['clients', user?.id],
    async () => {
      if (!user) return [];

      const { data, error } = await mockSupabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .execute();

      if (error) throw error;

      return data || [];
    },
    !!user && (user.role === 'founder' || user.role === 'cofounder')
  );
};
