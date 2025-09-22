
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HourlyUpdatePopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentHour: number;
}

interface HourlyUpdate {
  hour: number;
  description: string;
  timestamp: string;
}

const HourlyUpdatePopup: React.FC<HourlyUpdatePopupProps> = ({
  isOpen,
  onClose,
  userId,
  currentHour
}) => {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for your work.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get existing timesheet
      const { data: existingTimesheet } = await supabase
        .from('timesheets')
        .select('hourly_updates')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      const newUpdate: HourlyUpdate = {
        hour: currentHour,
        description: description.trim(),
        timestamp: new Date().toISOString()
      };

      let updates: HourlyUpdate[] = [];
      
      if (existingTimesheet?.hourly_updates) {
        // Parse existing updates as array with proper type casting
        const existing = Array.isArray(existingTimesheet.hourly_updates) 
          ? (existingTimesheet.hourly_updates as unknown as HourlyUpdate[])
          : [];
        updates = [...existing, newUpdate];
      } else {
        updates = [newUpdate];
      }

      if (existingTimesheet) {
        // Update existing timesheet
        const { error } = await supabase
          .from('timesheets')
          .update({ hourly_updates: updates as any })
          .eq('user_id', userId)
          .eq('date', today);

        if (error) throw error;
      } else {
        // Create new timesheet entry
        const { error } = await supabase
          .from('timesheets')
          .insert({
            user_id: userId,
            date: today,
            hours_worked: 0,
            hourly_updates: updates as any,
            status: 'draft'
          });

        if (error) throw error;
      }

      toast({
        title: "Update Saved",
        description: "Your hourly update has been recorded.",
      });

      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error saving hourly update:', error);
      toast({
        title: "Error",
        description: "Failed to save your update. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hourly Update - {currentHour}:00</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">What have you been working on?</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your work for this hour..."
              className="mt-1"
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Skip
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Update'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HourlyUpdatePopup;
