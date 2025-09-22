
-- Create hourly_tasks table to store tasks assigned to specific hours
CREATE TABLE public.hourly_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assigned_to UUID REFERENCES auth.users NOT NULL,
  assigned_by UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  hour INTEGER NOT NULL CHECK (hour >= 10 AND hour <= 17),
  task_description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  employee_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assigned_to, date, hour)
);

-- Add Row Level Security
ALTER TABLE public.hourly_tasks ENABLE ROW LEVEL SECURITY;

-- Policy for employees to view their own tasks
CREATE POLICY "Employees can view their own hourly tasks" 
  ON public.hourly_tasks 
  FOR SELECT 
  USING (auth.uid() = assigned_to);

-- Policy for employees to update their own task status and notes
CREATE POLICY "Employees can update their own hourly tasks" 
  ON public.hourly_tasks 
  FOR UPDATE 
  USING (auth.uid() = assigned_to)
  WITH CHECK (auth.uid() = assigned_to);

-- Policy for managers/founders to view all tasks
CREATE POLICY "Managers can view all hourly tasks" 
  ON public.hourly_tasks 
  FOR SELECT 
  USING (is_manager_or_above(auth.uid()));

-- Policy for managers/founders to insert tasks
CREATE POLICY "Managers can create hourly tasks" 
  ON public.hourly_tasks 
  FOR INSERT 
  WITH CHECK (is_manager_or_above(auth.uid()));

-- Policy for managers/founders to update tasks
CREATE POLICY "Managers can update hourly tasks" 
  ON public.hourly_tasks 
  FOR UPDATE 
  USING (is_manager_or_above(auth.uid()));

-- Policy for managers/founders to delete tasks
CREATE POLICY "Managers can delete hourly tasks" 
  ON public.hourly_tasks 
  FOR DELETE 
  USING (is_manager_or_above(auth.uid()));

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_hourly_tasks_updated_at 
  BEFORE UPDATE ON public.hourly_tasks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create notifications when tasks are assigned
CREATE OR REPLACE FUNCTION create_task_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert notification for new task assignment
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type
    ) VALUES (
      NEW.assigned_to,
      'New Hourly Task Assigned',
      'You have been assigned a task for ' || NEW.hour || ':00 - ' || NEW.task_description,
      'task'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to create notifications when tasks are assigned
CREATE TRIGGER hourly_task_notification_trigger
  AFTER INSERT ON public.hourly_tasks
  FOR EACH ROW EXECUTE FUNCTION create_task_notification();
