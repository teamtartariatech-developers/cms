
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { mockSupabase } from '@/services/mockSupabase';
import { toast } from 'sonner';
import { useMockAuth } from '@/hooks/useMockAuth';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddExpenseDialog = ({ open, onOpenChange }: AddExpenseDialogProps) => {
  const { user } = useMockAuth();
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const expenseType = watch('expense_type');

  const onSubmit = async (data: any) => {
    if (!user) return;

    const { error } = await mockSupabase
      .from('company_expenses')
      .insert({
        title: data.title,
        description: data.description,
        amount: parseFloat(data.amount),
        expense_type: data.expense_type,
        category: data.category,
        expense_date: data.expense_date,
        payment_status: data.payment_status || 'unpaid',
        created_by: user.id,
      });

    if (error) {
      toast.error('Failed to add expense');
      return;
    }

    toast.success('Expense added successfully');
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Add a new fixed or variable expense to track company costs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title', { required: true })}
              placeholder="Enter expense title"
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount', { required: true })}
              placeholder="Enter amount"
            />
          </div>

          <div>
            <Label htmlFor="expense_type">Expense Type</Label>
            <Select onValueChange={(value) => setValue('expense_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select expense type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Expense</SelectItem>
                <SelectItem value="variable">Variable Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              {...register('category')}
              placeholder="e.g., Office Rent, Utilities, Marketing"
            />
          </div>

          <div>
            <Label htmlFor="expense_date">Date</Label>
            <Input
              id="expense_date"
              type="date"
              {...register('expense_date', { required: true })}
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label htmlFor="payment_status">Payment Status</Label>
            <Select onValueChange={(value) => setValue('payment_status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Company Paid</SelectItem>
                <SelectItem value="unpaid">Company Not Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter expense details (optional)"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Expense</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
