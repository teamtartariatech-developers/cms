-- Add missing fields to clients table
ALTER TABLE public.clients 
ADD COLUMN payment_type text,
ADD COLUMN monthly_amount numeric;

-- Add payment_status to company_expenses table
ALTER TABLE public.company_expenses 
ADD COLUMN payment_status text DEFAULT 'unpaid';

-- Add index for better performance
CREATE INDEX idx_company_expenses_payment_status ON public.company_expenses(payment_status);
CREATE INDEX idx_clients_payment_type ON public.clients(payment_type);