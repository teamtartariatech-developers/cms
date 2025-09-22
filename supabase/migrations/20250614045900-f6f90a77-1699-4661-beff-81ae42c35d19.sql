
-- Enable RLS if not already enabled
ALTER TABLE public.hourly_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to recreate them properly
DROP POLICY IF EXISTS "Employees can view their own hourly tasks" ON public.hourly_tasks;
DROP POLICY IF EXISTS "Employees can update their own hourly tasks" ON public.hourly_tasks;
DROP POLICY IF EXISTS "Managers can view all hourly tasks" ON public.hourly_tasks;
DROP POLICY IF EXISTS "Managers can create hourly tasks" ON public.hourly_tasks;
DROP POLICY IF EXISTS "Managers can update hourly tasks" ON public.hourly_tasks;
DROP POLICY IF EXISTS "Managers can delete hourly tasks" ON public.hourly_tasks;

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

-- Enable realtime for hourly_tasks table to support notifications
ALTER TABLE public.hourly_tasks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hourly_tasks;

-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
