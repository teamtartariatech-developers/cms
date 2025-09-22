-- Create leads table for CRM functionality
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  address TEXT,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned_inquiry',
  notes TEXT,
  interest_area TEXT,
  next_follow_up_date DATE,
  scheduled_meeting_date TIMESTAMP WITH TIME ZONE,
  meeting_type TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies for leads access
CREATE POLICY "Users can view all leads" 
ON public.leads 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update leads" 
ON public.leads 
FOR UPDATE 
USING (auth.uid() = created_by OR is_manager_or_above(auth.uid()));

CREATE POLICY "Managers can delete leads" 
ON public.leads 
FOR DELETE 
USING (is_manager_or_above(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();