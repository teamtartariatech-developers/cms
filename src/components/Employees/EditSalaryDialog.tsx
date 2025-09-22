
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { mockSupabase } from '@/services/mockSupabase';
import { toast } from 'sonner';

interface EditSalaryDialogProps {
  employee: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditSalaryDialog = ({ employee, open, onOpenChange }: EditSalaryDialogProps) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      monthly_salary: employee?.monthly_salary || 0,
      upi_id: employee?.upi_id || '',
      bank_account_number: employee?.bank_account_number || '',
      bank_ifsc: employee?.bank_ifsc || '',
      bank_name: employee?.bank_name || '',
    }
  });

  React.useEffect(() => {
    if (employee) {
      reset({
        monthly_salary: employee.monthly_salary || 0,
        upi_id: employee.upi_id || '',
        bank_account_number: employee.bank_account_number || '',
        bank_ifsc: employee.bank_ifsc || '',
        bank_name: employee.bank_name || '',
      });
    }
  }, [employee, reset]);

  const onSubmit = async (data: any) => {
    if (!employee) return;

    const { error } = await mockSupabase
      .from('employees')
      .update({
        monthly_salary: parseFloat(data.monthly_salary),
        upi_id: data.upi_id,
        bank_account_number: data.bank_account_number,
        bank_ifsc: data.bank_ifsc,
        bank_name: data.bank_name,
      })
      .eq('id', employee.id);

    if (error) {
      toast.error('Failed to update salary details');
      return;
    }

    toast.success('Salary details updated successfully');
    onOpenChange(false);
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Salary Details</DialogTitle>
          <DialogDescription>
            Update salary and payment information for {employee.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="monthly_salary">Monthly Salary (₹)</Label>
            <Input
              id="monthly_salary"
              type="number"
              step="0.01"
              {...register('monthly_salary', { required: true })}
              placeholder="Enter monthly salary"
            />
          </div>

          <div>
            <Label htmlFor="upi_id">UPI ID</Label>
            <Input
              id="upi_id"
              {...register('upi_id')}
              placeholder="Enter UPI ID"
            />
          </div>

          <div>
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input
              id="bank_name"
              {...register('bank_name')}
              placeholder="Enter bank name"
            />
          </div>

          <div>
            <Label htmlFor="bank_account_number">Account Number</Label>
            <Input
              id="bank_account_number"
              {...register('bank_account_number')}
              placeholder="Enter account number"
            />
          </div>

          <div>
            <Label htmlFor="bank_ifsc">IFSC Code</Label>
            <Input
              id="bank_ifsc"
              {...register('bank_ifsc')}
              placeholder="Enter IFSC code"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Salary</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
