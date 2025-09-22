// Mock Supabase client for frontend-only operation
import { mockSupabase } from '@/services/mockSupabase';

// Export the mock client as supabase for compatibility
export const supabase = mockSupabase;