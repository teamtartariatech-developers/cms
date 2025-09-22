
-- Create enum types for better data integrity
CREATE TYPE public.user_role AS ENUM ('founder', 'cofounder', 'manager', 'employee', 'hr');
CREATE TYPE public.attendance_status AS ENUM ('present', 'late', 'absent', 'sick_leave', 'vacation');
CREATE TYPE public.timesheet_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');
CREATE TYPE public.project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE public.announcement_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'employee',
  department TEXT,
  position TEXT,
  phone TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  hire_date DATE DEFAULT CURRENT_DATE,
  manager_id UUID REFERENCES public.profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  status public.attendance_status DEFAULT 'present',
  hours_worked DECIMAL(4,2),
  notes TEXT,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status public.project_status DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  manager_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project assignments table
CREATE TABLE public.project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Timesheets table
CREATE TABLE public.timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours_worked DECIMAL(4,2) NOT NULL,
  description TEXT,
  status public.timesheet_status DEFAULT 'draft',
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar events table
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT false,
  location TEXT,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar event attendees table
CREATE TABLE public.calendar_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.calendar_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  UNIQUE(event_id, user_id)
);

-- Announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority public.announcement_priority DEFAULT 'medium',
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  department TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS public.user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_uuid;
$$;

-- Create function to check if user is manager or above
CREATE OR REPLACE FUNCTION public.is_manager_or_above(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role IN ('founder', 'cofounder', 'manager', 'hr') 
  FROM public.profiles 
  WHERE id = user_uuid;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Managers can update profiles" ON public.profiles FOR UPDATE USING (public.is_manager_or_above(auth.uid()));
CREATE POLICY "Managers can insert profiles" ON public.profiles FOR INSERT WITH CHECK (public.is_manager_or_above(auth.uid()));

-- RLS Policies for attendance
CREATE POLICY "Users can view own attendance" ON public.attendance FOR SELECT USING (auth.uid() = user_id OR public.is_manager_or_above(auth.uid()));
CREATE POLICY "Users can insert own attendance" ON public.attendance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own attendance" ON public.attendance FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Managers can update all attendance" ON public.attendance FOR UPDATE USING (public.is_manager_or_above(auth.uid()));

-- RLS Policies for projects
CREATE POLICY "Users can view assigned projects" ON public.projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.project_assignments WHERE project_id = id AND user_id = auth.uid())
  OR public.is_manager_or_above(auth.uid())
);
CREATE POLICY "Managers can manage projects" ON public.projects FOR ALL USING (public.is_manager_or_above(auth.uid()));

-- RLS Policies for project assignments
CREATE POLICY "Users can view project assignments" ON public.project_assignments FOR SELECT USING (
  user_id = auth.uid() OR public.is_manager_or_above(auth.uid())
);
CREATE POLICY "Managers can manage assignments" ON public.project_assignments FOR ALL USING (public.is_manager_or_above(auth.uid()));

-- RLS Policies for timesheets
CREATE POLICY "Users can view own timesheets" ON public.timesheets FOR SELECT USING (
  auth.uid() = user_id OR public.is_manager_or_above(auth.uid())
);
CREATE POLICY "Users can manage own timesheets" ON public.timesheets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Managers can approve timesheets" ON public.timesheets FOR UPDATE USING (public.is_manager_or_above(auth.uid()));

-- RLS Policies for calendar events
CREATE POLICY "Users can view calendar events" ON public.calendar_events FOR SELECT USING (true);
CREATE POLICY "Users can create calendar events" ON public.calendar_events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own events" ON public.calendar_events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Managers can manage all events" ON public.calendar_events FOR ALL USING (public.is_manager_or_above(auth.uid()));

-- RLS Policies for calendar attendees
CREATE POLICY "Users can view calendar attendees" ON public.calendar_attendees FOR SELECT USING (true);
CREATE POLICY "Event creators can manage attendees" ON public.calendar_attendees FOR ALL USING (
  EXISTS (SELECT 1 FROM public.calendar_events WHERE id = event_id AND created_by = auth.uid())
  OR public.is_manager_or_above(auth.uid())
);

-- RLS Policies for announcements
CREATE POLICY "Users can view active announcements" ON public.announcements FOR SELECT USING (
  is_active = true AND (expires_at IS NULL OR expires_at > NOW())
);
CREATE POLICY "Managers can manage announcements" ON public.announcements FOR ALL USING (public.is_manager_or_above(auth.uid()));

-- RLS Policies for settings
CREATE POLICY "Users can manage own settings" ON public.settings FOR ALL USING (auth.uid() = user_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_timesheets_updated_at BEFORE UPDATE ON public.timesheets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')::public.user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
