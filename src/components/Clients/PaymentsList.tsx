
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMockQuery } from '@/hooks/useMockData';
import { mockSupabase } from '@/services/mockSupabase';
import { useMockAuth } from '@/hooks/useMockAuth';
import { format } from 'date-fns';
import { Check, X, Eye } from 'lucide-react';
import { toast } from 'sonner';

export const PaymentsList = () => {
  const { user } = useMockAuth();

  const { data: payments, isLoading } = useMockQuery(
    ['payments', user?.id],
    async () => {
      if (!user) return [];

      const { data, error } = await mockSupabase
        .from('client_payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
        .execute();

      if (error) throw error;
      
      // Add mock client data
      return (data || []).map(payment => ({
        ...payment,
        clients: { name: 'Mock Client', email: 'client@example.com' }
      }));
    },
    !!user && (user.role === 'founder' || user.role === 'cofounder')
  );

  const verifyPayment = async (paymentId: string) => {
    try {
      const { error } = await mockSupabase
        .from('client_payments')
        .update({
          payment_status: 'verified',
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast.success("Payment verified successfully");

    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error("Failed to verify payment");
    }
  };

  const rejectPayment = async (paymentId: string) => {
    try {
      const { error } = await mockSupabase
        .from('client_payments')
        .update({
          payment_status: 'rejected',
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast.success("Payment rejected");

    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error("Failed to reject payment");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
        <CardDescription>Latest payment submissions requiring verification</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments?.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{payment.clients.name}</div>
                    <div className="text-sm text-muted-foreground">{payment.clients.email}</div>
                  </div>
                </TableCell>
                <TableCell>₹{Number(payment.amount).toLocaleString()}</TableCell>
                <TableCell>{format(new Date(payment.payment_date), 'PPP')}</TableCell>
                <TableCell>{payment.payment_method || 'N/A'}</TableCell>
                <TableCell>{payment.transaction_id || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={
                    payment.payment_status === 'verified' ? 'default' : 
                    payment.payment_status === 'rejected' ? 'destructive' : 'secondary'
                  }>
                    {payment.payment_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {payment.payment_status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifyPayment(payment.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectPayment(payment.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    {payment.payment_screenshot_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(payment.payment_screenshot_url, '_blank')}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
