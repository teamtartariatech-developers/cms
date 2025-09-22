
-- Create company expenses table
CREATE TABLE public.company_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  expense_type TEXT NOT NULL CHECK (expense_type IN ('fixed', 'variable')),
  category TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_expenses ENABLE ROW LEVEL SECURITY;

-- Create policy for founders/cofounders to manage expenses
CREATE POLICY "Founders can manage company expenses" 
  ON public.company_expenses 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('founder', 'cofounder')
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_company_expenses_updated_at
  BEFORE UPDATE ON public.company_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update projects table to allow easy status updates
ALTER TABLE public.projects 
ALTER COLUMN status SET DEFAULT 'planning';

-- Update employees table to allow salary updates
-- (Table already exists, just ensuring it's properly set up for salary updates)
