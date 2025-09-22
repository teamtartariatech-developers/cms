
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { mockSupabase } from '@/services/mockSupabase';
import { toast } from 'sonner';

interface EditExpenseDialogProps {
  expense: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditExpenseDialog = ({ expense, open, onOpenChange }: EditExpenseDialogProps) => {
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    if (expense) {
      reset({
        title: expense.title,
        amount: expense.amount,
        expense_type: expense.expense_type,
        category: expense.category,
        expense_date: expense.expense_date,
        description: expense.description,
      });
      setValue('expense_type', expense.expense_type);
    }
  }, [expense, reset, setValue]);

  const onSubmit = async (data: any) => {
    if (!expense) return;

    const { error } = await mockSupabase
      .from('company_expenses')
      .update({
        title: data.title,
        description: data.description,
        amount: parseFloat(data.amount),
        expense_type: data.expense_type,
        category: data.category,
        expense_date: data.expense_date,
      })
      .eq('id', expense.id);

    if (error) {
      toast.error('Failed to update expense');
      return;
    }

    toast.success('Expense updated successfully');
    onOpenChange(false);
  };

  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Update the expense details.
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
            <Select onValueChange={(value) => setValue('expense_type', value)} defaultValue={expense.expense_type}>
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
            />
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
            <Button type="submit">Update Expense</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
