
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useClientsData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['clients-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get total clients
      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // Get active clients
      const { count: activeClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get total revenue from verified payments
      const { data: paymentsData } = await supabase
        .from('client_payments')
        .select('amount')
        .eq('payment_status', 'verified');

      const totalRevenue = paymentsData?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      // Calculate total remaining balance from all clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select(`
          total_amount,
          client_payments(amount, payment_status)
        `);

      const remainingBalance = clientsData?.reduce((total, client) => {
        const totalPaid = client.client_payments
          .filter(p => p.payment_status === 'verified')
          .reduce((sum, p) => sum + Number(p.amount), 0);
        
        return total + (Number(client.total_amount) - totalPaid);
      }, 0) || 0;

      return {
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        totalRevenue,
        remainingBalance,
      };
    },
    enabled: !!user && (user.role === 'founder' || user.role === 'cofounder'),
  });
};

export const useClients = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          client_payments(
            id,
            amount,
            payment_status,
            payment_date
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(client => {
        const totalPaid = client.client_payments
          .filter(p => p.payment_status === 'verified')
          .reduce((sum, p) => sum + Number(p.amount), 0);
        
        const pendingAmount = client.client_payments
          .filter(p => p.payment_status === 'pending')
          .reduce((sum, p) => sum + Number(p.amount), 0);

        return {
          ...client,
          totalPaid,
          pendingAmount,
          remainingBalance: Number(client.total_amount) - totalPaid,
          paymentStatus: totalPaid >= Number(client.total_amount) ? 'Paid' : 
                        totalPaid > 0 ? 'Partially Paid' : 'Pending'
        };
      }) || [];
    },
    enabled: !!user && (user.role === 'founder' || user.role === 'cofounder'),
  });
};
