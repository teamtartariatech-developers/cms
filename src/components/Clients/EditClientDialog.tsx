import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface EditClientDialogProps {
  client: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditClientDialog = ({ client, open, onOpenChange }: EditClientDialogProps) => {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: client ? {
      name: client.name,
      email: client.email,
      phone_number: client.phone_number,
      service_type: client.service_type,
      payment_type: client.payment_type,
      total_amount: client.total_amount,
      monthly_amount: client.monthly_amount,
      project_start_date: client.project_start_date,
      project_end_date: client.project_end_date,
      status: client.status
    } : {}
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const paymentType = watch('payment_type');

  React.useEffect(() => {
    if (client) {
      setValue('name', client.name);
      setValue('email', client.email);
      setValue('phone_number', client.phone_number);
      setValue('service_type', client.service_type);
      setValue('payment_type', client.payment_type);
      setValue('total_amount', client.total_amount);
      setValue('monthly_amount', client.monthly_amount);
      setValue('project_start_date', client.project_start_date);
      setValue('project_end_date', client.project_end_date);
      setValue('status', client.status);
    }
  }, [client, setValue]);

  const onSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: data.name,
          email: data.email,
          phone_number: data.phone_number,
          service_type: data.service_type,
          total_amount: data.payment_type === 'one-time' 
            ? parseFloat(data.total_amount) 
            : parseFloat(data.monthly_amount),
          payment_type: data.payment_type,
          monthly_amount: data.payment_type === 'monthly' ? parseFloat(data.monthly_amount) : null,
          project_start_date: data.project_start_date,
          project_end_date: data.project_end_date,
          status: data.status,
        })
        .eq('id', client.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients-stats'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      });
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                {...register('name', { required: true })}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { required: true })}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                {...register('phone_number')}
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <Label htmlFor="service_type">Service Type *</Label>
              <Input
                id="service_type"
                {...register('service_type', { required: true })}
                placeholder="Website Development"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="payment_type">Payment Type *</Label>
            <Select onValueChange={(value) => setValue('payment_type', value)} defaultValue={client.payment_type}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">One-time Payment</SelectItem>
                <SelectItem value="monthly">Monthly Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentType === 'one-time' && (
            <div>
              <Label htmlFor="total_amount">Total Project Amount (₹) *</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                {...register('total_amount', { required: paymentType === 'one-time' })}
                placeholder="50000"
              />
            </div>
          )}

          {paymentType === 'monthly' && (
            <div>
              <Label htmlFor="monthly_amount">Monthly Amount (₹) *</Label>
              <Input
                id="monthly_amount"
                type="number"
                step="0.01"
                {...register('monthly_amount', { required: paymentType === 'monthly' })}
                placeholder="5000"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="project_start_date">Project Start Date</Label>
              <Input
                id="project_start_date"
                type="date"
                {...register('project_start_date')}
              />
            </div>

            <div>
              <Label htmlFor="project_end_date">Project End Date</Label>
              <Input
                id="project_end_date"
                type="date"
                {...register('project_end_date')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => setValue('status', value)} defaultValue={client.status}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Client
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};