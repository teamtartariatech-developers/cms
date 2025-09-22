
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Check, X, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ClientDetailsDialogProps {
  client: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClientDetailsDialog: React.FC<ClientDetailsDialogProps> = ({ client, open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const verifyPayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('client_payments')
        .update({
          payment_status: 'verified',
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment verified successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Error",
        description: "Failed to verify payment",
        variant: "destructive",
      });
    }
  };

  const rejectPayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('client_payments')
        .update({
          payment_status: 'rejected',
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment rejected",
      });

      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: "Error",
        description: "Failed to reject payment",
        variant: "destructive",
      });
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client.name} - Details</DialogTitle>
          <DialogDescription>
            Complete client information and payment history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{client.phone_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Service Type</p>
                <p className="text-sm text-muted-foreground">{client.service_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                  {client.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Project Start</p>
                <p className="text-sm text-muted-foreground">
                  {client.project_start_date ? format(new Date(client.project_start_date), 'PPP') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Project End</p>
                <p className="text-sm text-muted-foreground">
                  {client.project_end_date ? format(new Date(client.project_end_date), 'PPP') : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium">Total Amount</p>
                  <p className="text-2xl font-bold">₹{Number(client.total_amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Amount Paid</p>
                  <p className="text-2xl font-bold text-green-600">₹{client.totalPaid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Remaining Balance</p>
                  <p className="text-2xl font-bold text-red-600">₹{client.remainingBalance.toLocaleString()}</p>
                </div>
                {client.monthly_amount && client.payment_type === 'monthly' && (
                  <div>
                    <p className="text-sm font-medium">Monthly Amount</p>
                    <p className="text-2xl font-bold text-blue-600">₹{Number(client.monthly_amount).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {client.pendingAmount > 0 ? `₹${client.pendingAmount.toLocaleString()} pending` : 'Current'}
                    </p>
                  </div>
                )}
              </div>
              {client.monthly_amount && client.payment_type === 'monthly' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800">Monthly Payment Status</p>
                  <p className="text-sm text-blue-700">
                    This client pays ₹{Number(client.monthly_amount).toLocaleString()} monthly for {client.service_type} services.
                    {client.pendingAmount === 0 ? (
                      <span className="text-green-700 font-medium"> Payment is up to date.</span>
                    ) : (
                      <span className="text-red-700 font-medium"> ₹{client.pendingAmount.toLocaleString()} payment is overdue.</span>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.client_payments?.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.payment_date), 'PPP')}
                      </TableCell>
                      <TableCell>₹{Number(payment.amount).toLocaleString()}</TableCell>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
