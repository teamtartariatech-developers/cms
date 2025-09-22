
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { mockSupabase } from '@/services/mockSupabase';
import { useMockAuth } from '@/hooks/useMockAuth';
import { toast } from 'sonner';

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddClientDialog: React.FC<AddClientDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useMockAuth();
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const paymentType = watch('payment_type');

  const onSubmit = async (data: any) => {
    if (!user) return;

    try {
      const { error } = await mockSupabase
        .from('clients')
        .insert({
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
          created_by: user.id,
        });

      if (error) throw error;

      toast.success("Client added successfully");

      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error("Failed to add client");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Add a new client to your client management system
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Client Name *</Label>
            <Input
              id="name"
              {...register('name', { required: true })}
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email', { required: true })}
              placeholder="john@example.com"
            />
          </div>

          <div>
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              {...register('phone_number')}
              placeholder="+1234567890"
            />
          </div>

          <div>
            <Label htmlFor="service_type">Service Type *</Label>
            <Select onValueChange={(value) => setValue('service_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
               <SelectContent>
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="Mobile App">Mobile App</SelectItem>
                <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                <SelectItem value="Consulting">Consulting</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
               </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="payment_type">Payment Type *</Label>
            <Select onValueChange={(value) => setValue('payment_type', value)}>
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Client</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
