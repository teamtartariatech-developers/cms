
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Calculator } from 'lucide-react';

export const SalaryReports = () => {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const { data: salaryData, isLoading } = useQuery({
    queryKey: ['salary-reports', user?.id, selectedYear],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('employee_salary_records')
        .select(`
          *,
          employees!inner(
            monthly_salary,
            profiles!inner(first_name, last_name)
          )
        `)
        .eq('year', parseInt(selectedYear))
        .order('month', { ascending: true });

      if (error) throw error;

      // Group by month and calculate totals
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(0, i).toLocaleString('default', { month: 'short' }),
        totalSalary: 0,
        employeeCount: 0,
      }));

      data?.forEach(record => {
        const monthIndex = record.month - 1;
        monthlyData[monthIndex].totalSalary += Number(record.final_salary);
        monthlyData[monthIndex].employeeCount += 1;
      });

      return monthlyData;
    },
    enabled: !!user && (user.role === 'founder' || user.role === 'cofounder'),
  });

  const generateSalarySlips = async () => {
    // This would typically generate PDF salary slips
    console.log('Generating salary slips for', selectedYear);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Salary Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Reports</CardTitle>
        <CardDescription>Monthly and annual salary expense overview</CardDescription>
        <div className="flex gap-4 items-center">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={generateSalarySlips}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salaryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Total Salary']}
              />
              <Bar dataKey="totalSalary" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold">Total Annual Expense</h3>
            <p className="text-2xl font-bold text-blue-600">
              ₹{salaryData?.reduce((sum, month) => sum + month.totalSalary, 0).toLocaleString() || 0}
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold">Average Monthly</h3>
            <p className="text-2xl font-bold text-green-600">
              ₹{Math.round((salaryData?.reduce((sum, month) => sum + month.totalSalary, 0) || 0) / 12).toLocaleString()}
            </p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <h3 className="text-lg font-semibold">Active Employees</h3>
            <p className="text-2xl font-bold text-orange-600">
              {Math.max(...(salaryData?.map(month => month.employeeCount) || [0]))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
