
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useEmployeesData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['employees-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get total employees from employees table
      const { count: totalEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get active employees
      const { count: activeEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get total monthly salary
      const { data: salaryData } = await supabase
        .from('employees')
        .select('monthly_salary')
        .eq('is_active', true);

      const monthlySalary = salaryData?.reduce((sum, emp) => sum + Number(emp.monthly_salary), 0) || 0;

      // Get present today count
      const today = new Date().toISOString().split('T')[0];
      const { count: presentToday } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .not('check_in_time', 'is', null);

      return {
        totalEmployees: totalEmployees || 0,
        activeEmployees: activeEmployees || 0,
        monthlySalary,
        presentToday: presentToday || 0,
      };
    },
    enabled: !!user && (user.role === 'founder' || user.role === 'cofounder'),
  });
};

export const useEmployees = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['employees', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Fetch employees with their profile information
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          profiles!employees_profile_id_fkey(
            first_name,
            last_name,
            email,
            phone,
            avatar_url,
            role,
            department,
            position
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }

      return data?.map(employee => ({
        ...employee,
        name: `${employee.profiles?.first_name} ${employee.profiles?.last_name}`,
        email: employee.profiles?.email,
        phone: employee.profiles?.phone,
        avatar_url: employee.profiles?.avatar_url,
        role: employee.profiles?.role,
        department: employee.profiles?.department,
        position: employee.profiles?.position,
      })) || [];
    },
    enabled: !!user && (user.role === 'founder' || user.role === 'cofounder'),
  });
};

export const useEmployeeAttendanceStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['employee-attendance-stats', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const today = new Date().toISOString().split('T')[0];
      
      // First get all active employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select(`
          id,
          employee_code,
          profiles!employees_profile_id_fkey(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('is_active', true);

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
        throw employeesError;
      }

      // Then get today's attendance for all employees
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', today);

      if (attendanceError) {
        console.error('Error fetching attendance:', attendanceError);
        throw attendanceError;
      }

      // Combine employee data with attendance data
      return employeesData?.map(employee => {
        const todayAttendance = attendanceData?.find(att => att.user_id === employee.profiles?.id);
        
        return {
          id: employee.id,
          employeeCode: employee.employee_code,
          name: `${employee.profiles?.first_name} ${employee.profiles?.last_name}`,
          email: employee.profiles?.email,
          profileId: employee.profiles?.id,
          attendance: todayAttendance || null,
          isCheckedIn: todayAttendance?.check_in_time && !todayAttendance?.check_out_time,
          isPresent: !!todayAttendance?.check_in_time,
          hoursWorked: todayAttendance?.hours_worked || 0,
        };
      }) || [];
    },
    enabled: !!user && (user.role === 'founder' || user.role === 'cofounder'),
  });
};
