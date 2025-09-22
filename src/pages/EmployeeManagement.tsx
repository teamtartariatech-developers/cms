
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { EmployeeList } from '@/components/Employees/EmployeeList';
import AddEmployeeDialog from '@/components/Employees/AddEmployeeDialog';
import { AttendanceTracker } from '@/components/Employees/AttendanceTracker';
import { SalaryReports } from '@/components/Employees/SalaryReports';
import { useEmployeesData } from '@/hooks/useEmployeesData';

const EmployeeManagement = () => {
  const { user } = useAuth();
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const { data: employeesStats, isLoading } = useEmployeesData();

  // Check if user has access (founder or cofounder only)
  if (!user || (user.role !== 'founder' && user.role !== 'cofounder')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Only founders and cofounders can access employee management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <Button onClick={() => setShowAddEmployee(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Stats Cards */}
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

      {/* Employee List */}
      <EmployeeList />

      {/* Attendance Tracker */}
      <AttendanceTracker />

      {/* Salary Reports */}
      <SalaryReports />

      {/* Add Employee Dialog */}
      <AddEmployeeDialog 
        open={showAddEmployee} 
        onOpenChange={setShowAddEmployee} 
      />
    </div>
  );
};

export default EmployeeManagement;
