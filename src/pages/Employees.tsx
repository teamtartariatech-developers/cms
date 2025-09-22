
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { useMockAuth } from '@/hooks/useMockAuth';
import { EmployeeList } from '@/components/Employees/EmployeeList';
import AddEmployeeDialog from '@/components/Employees/AddEmployeeDialog';
import { AttendanceTracker } from '@/components/Employees/AttendanceTracker';
import { SalaryReports } from '@/components/Employees/SalaryReports';
import { useEmployeesData } from '@/hooks/useEmployeesData';
import { useEmployeeActions } from '@/hooks/useEmployeeActions';

const Employees = () => {
  const { user } = useMockAuth();
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const { deleteEmployee } = useEmployeeActions();
  const { data: employeesStats, isLoading } = useMockQuery(
    ['employees-stats', user?.id],
    async () => {
      if (!user) return null;
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

  // Check if user has management access
  const canAddEmployee = user?.role === 'manager' || user?.role === 'founder' || user?.role === 'hr';
  const hasManagementAccess = user?.role === 'founder' || user?.role === 'cofounder';
  
  const canDelete = (employee: any) => {
    return user?.role === 'founder' && employee.id !== user.id;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground">
            Manage employees, attendance, and salary tracking
          </p>
        </div>
        {canAddEmployee && (
          <Button onClick={() => setShowAddEmployee(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        )}
      </div>

      {/* Stats Cards - Only for management */}
      {hasManagementAccess && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employeesStats?.totalEmployees || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employeesStats?.activeEmployees || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{employeesStats?.monthlySalary?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employeesStats?.presentToday || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Employee List */}
      <EmployeeList />

      {/* Management Features - Only for founders/cofounders */}
      {hasManagementAccess && (
        <>
          {/* Attendance Tracker */}
          <AttendanceTracker />

          {/* Salary Reports */}
          <SalaryReports />
        </>
      )}

      {/* Add Employee Dialog */}
      <AddEmployeeDialog 
        open={showAddEmployee} 
        onOpenChange={setShowAddEmployee} 
      />
    </div>
  );
};

export default Employees;
