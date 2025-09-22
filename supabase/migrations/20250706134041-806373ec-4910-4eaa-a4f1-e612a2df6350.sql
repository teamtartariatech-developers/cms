
-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  service_type TEXT NOT NULL,
  project_start_date DATE,
  project_end_date DATE,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_payments table
CREATE TABLE public.client_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  transaction_id TEXT,
  payment_method TEXT CHECK (payment_method IN ('PhonePe', 'Google Pay', 'UPI', 'Bank Transfer', 'Cash', 'Cheque')),
  payment_screenshot_url TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employees table (separate from profiles for salary tracking)
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  employee_code TEXT UNIQUE NOT NULL,
  join_date DATE NOT NULL,
  monthly_salary DECIMAL(10,2) NOT NULL,
  upi_id TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  bank_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_salary_records table
CREATE TABLE public.employee_salary_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  working_days INTEGER NOT NULL DEFAULT 26,
  present_days INTEGER NOT NULL DEFAULT 0,
  calculated_salary DECIMAL(10,2) NOT NULL,
  final_salary DECIMAL(10,2) NOT NULL,
  bonus DECIMAL(10,2) DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  payment_date DATE,
  paid_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, month, year)
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_salary_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients (only founder and cofounder can access)
CREATE POLICY "Founders can manage clients" 
  ON public.clients 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('founder', 'cofounder')
  ));

-- RLS Policies for client_payments (only founder and cofounder can access)
CREATE POLICY "Founders can manage client payments" 
  ON public.client_payments 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('founder', 'cofounder')
  ));

-- RLS Policies for employees (only founder and cofounder can access)
CREATE POLICY "Founders can manage employees" 
  ON public.employees 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('founder', 'cofounder')
  ));

-- RLS Policies for employee_salary_records (only founder and cofounder can access)
CREATE POLICY "Founders can manage salary records" 
  ON public.employee_salary_records 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('founder', 'cofounder')
  ));

-- Create indexes for better performance
CREATE INDEX idx_clients_created_by ON public.clients(created_by);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_client_payments_client_id ON public.client_payments(client_id);
CREATE INDEX idx_client_payments_payment_date ON public.client_payments(payment_date);
CREATE INDEX idx_employees_profile_id ON public.employees(profile_id);
CREATE INDEX idx_employee_salary_month_year ON public.employee_salary_records(month, year);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_payments_updated_at BEFORE UPDATE ON public.client_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_salary_records_updated_at BEFORE UPDATE ON public.employee_salary_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
