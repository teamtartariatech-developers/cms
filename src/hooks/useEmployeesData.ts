
import { useMockQuery } from '@/hooks/useMockData';
import { mockSupabase } from '@/services/mockSupabase';
import { useMockAuth } from '@/hooks/useMockAuth';

export const useEmployeesData = () => {
  const { user } = useMockAuth();

  return useMockQuery(
    ['employees-stats', user?.id],
    async () => {
      if (!user) return null;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        totalEmployees: 15,
        activeEmployees: 14,
        monthlySalary: 1200000,
        presentToday: 12,
      };
    },
    !!user && (user.role === 'founder' || user.role === 'cofounder')
  );
};

export const useEmployees = () => {
  const { user } = useAuth();

  return useMockQuery(
    ['employees', user?.id],
    async () => {
      if (!user) return [];

      const { data, error } = await mockSupabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false })
        .execute();

      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }

      return data || [];
    },
    !!user && (user.role === 'founder' || user.role === 'cofounder')
  );
};

export const useEmployeeAttendanceStats = () => {
  const { user } = useAuth();

  return useMockQuery(
    ['employee-attendance-stats', user?.id],
    async () => {
      if (!user) return [];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return [
        {
          id: '1',
          employeeCode: 'EMP001',
          name: 'John Doe',
          email: 'founder@company.com',
          profileId: '1',
          attendance: { check_in_time: '2025-01-11T09:00:00Z', check_out_time: null },
          isCheckedIn: true,
          isPresent: true,
          hoursWorked: 0,
        },
        {
          id: '2',
          employeeCode: 'EMP002',
          name: 'Jane Smith',
          email: 'jane@company.com',
          profileId: '2',
          attendance: { check_in_time: '2025-01-11T09:15:00Z', check_out_time: null },
          isCheckedIn: true,
          isPresent: true,
          hoursWorked: 0,
        },
      ];
    },
    !!user && (user.role === 'founder' || user.role === 'cofounder')
  );
};
