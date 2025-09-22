
-- Create tasks table for timesheet task management
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_by UUID REFERENCES public.profiles(id) NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id) NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours NUMERIC,
  actual_hours NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create task_timesheet_entries table to link tasks with timesheet entries
CREATE TABLE public.task_timesheet_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) NOT NULL,
  timesheet_id UUID REFERENCES public.timesheets(id) NOT NULL,
  hours_worked NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_preferences table for settings
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  project_updates BOOLEAN DEFAULT true,
  attendance_reminders BOOLEAN DEFAULT true,
  hourly_task_reminders BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create password_reset_tokens table for password changes
CREATE TABLE public.password_reset_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create two_factor_auth table for 2FA
CREATE TABLE public.two_factor_auth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL UNIQUE,
  secret TEXT NOT NULL,
  backup_codes TEXT[],
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks assigned to them or created by them" 
  ON public.tasks 
  FOR SELECT 
  USING (assigned_to = auth.uid() OR assigned_by = auth.uid() OR 
         public.is_manager_or_above(auth.uid()));

CREATE POLICY "Managers can create tasks" 
  ON public.tasks 
  FOR INSERT 
  WITH CHECK (public.is_manager_or_above(auth.uid()));

CREATE POLICY "Users can update their assigned tasks status" 
  ON public.tasks 
  FOR UPDATE 
  USING (assigned_to = auth.uid() OR assigned_by = auth.uid() OR 
         public.is_manager_or_above(auth.uid()));

-- Add RLS policies for task_timesheet_entries
ALTER TABLE public.task_timesheet_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own task timesheet entries" 
  ON public.task_timesheet_entries 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.timesheets t 
    WHERE t.id = task_timesheet_entries.timesheet_id 
    AND t.user_id = auth.uid()
  ));

-- Add RLS policies for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences" 
  ON public.user_preferences 
  FOR ALL 
  USING (user_id = auth.uid());

-- Add RLS policies for password_reset_tokens
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own password reset tokens" 
  ON public.password_reset_tokens 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Add RLS policies for two_factor_auth
ALTER TABLE public.two_factor_auth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own 2FA settings" 
  ON public.two_factor_auth 
  FOR ALL 
  USING (user_id = auth.uid());

-- Add indexes for performance
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_assigned_by ON public.tasks(assigned_by);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_task_timesheet_entries_task_id ON public.task_timesheet_entries(task_id);
CREATE INDEX idx_task_timesheet_entries_timesheet_id ON public.task_timesheet_entries(timesheet_id);

-- Add trigger to update updated_at column
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_two_factor_auth_updated_at
  BEFORE UPDATE ON public.two_factor_auth
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
