
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useEmployeeActions = () => {
  const queryClient = useQueryClient();

  const deleteEmployee = useMutation({
    mutationFn: async (employeeId: string) => {
      // First deactivate the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', employeeId);

      if (profileError) throw profileError;

      // Optionally delete the user from auth (requires admin privileges)
      // This is commented out as it requires service role key
      // const { error: authError } = await supabase.auth.admin.deleteUser(employeeId);
      // if (authError) throw authError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete employee');
      console.error('Error deleting employee:', error);
    }
  });

  return { deleteEmployee };
};
