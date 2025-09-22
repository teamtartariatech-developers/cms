
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Upload } from 'lucide-react';

interface AddPaymentDialogProps {
  client: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddPaymentDialog: React.FC<AddPaymentDialogProps> = ({ client, open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [uploading, setUploading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState('');

  const uploadScreenshot = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `payment-screenshots/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setScreenshotUrl(data.publicUrl);
      setValue('payment_screenshot_url', data.publicUrl);
      
      toast({
        title: "Success",
        description: "Screenshot uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      toast({
        title: "Error",
        description: "Error uploading screenshot",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!user || !client) return;

    try {
      const { error } = await supabase
        .from('client_payments')
        .insert({
          client_id: client.id,
          amount: parseFloat(data.amount),
          payment_date: data.payment_date,
          transaction_id: data.transaction_id,
          payment_method: data.payment_method,
          payment_screenshot_url: screenshotUrl,
          notes: data.notes,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients-stats'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      reset();
      setScreenshotUrl('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
          <DialogDescription>
            Record a new payment for {client?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount', { required: true })}
              placeholder="5000"
            />
          </div>

          <div>
            <Label htmlFor="payment_date">Payment Date *</Label>
            <Input
              id="payment_date"
              type="date"
              {...register('payment_date', { required: true })}
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select onValueChange={(value) => setValue('payment_method', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PhonePe">PhonePe</SelectItem>
                <SelectItem value="Google Pay">Google Pay</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="transaction_id">Transaction ID</Label>
            <Input
              id="transaction_id"
              {...register('transaction_id')}
              placeholder="TXN123456789"
            />
          </div>

          <div>
            <Label htmlFor="screenshot">Payment Screenshot</Label>
            <div className="mt-2">
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={uploadScreenshot}
                disabled={uploading}
              />
              {uploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
              {screenshotUrl && (
                <div className="mt-2">
                  <img src={screenshotUrl} alt="Payment screenshot" className="max-w-full max-h-32 object-contain rounded" />
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes about this payment"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Record Payment</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
