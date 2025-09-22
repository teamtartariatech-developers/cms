
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AttendanceData {
  date: string;
  present: number;
  absent: number;
  late: number;
}

interface DepartmentData {
  department: string;
  hours: number;
  employees: number;
}

const Reports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [avgHoursPerDay, setAvgHoursPerDay] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);

  useEffect(() => {
    if (user && (user.role === 'founder' || user.role === 'manager' || user.role === 'hr')) {
      fetchReportsData();
    } else {
      setIsLoading(false);
    }
  }, [user, selectedPeriod]);

  const fetchReportsData = async () => {
    try {
      // Fetch attendance data
      const daysBack = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const { data: attendance } = await supabase
        .from('attendance')
        .select(`
          date,
          status,
          user_id,
          profiles:user_id!inner (
            department
          )
        `)
        .gte('date', startDate.toISOString().split('T')[0]);

      // Process attendance data
      const attendanceByDate: { [key: string]: { present: number; absent: number; late: number } } = {};
      const departmentHours: { [key: string]: { hours: number; employees: Set<string> } } = {};

      if (attendance) {
        attendance.forEach((record: any) => {
          const date = record.date;
          if (!attendanceByDate[date]) {
            attendanceByDate[date] = { present: 0, absent: 0, late: 0 };
          }
          
          if (record.status === 'present') {
            attendanceByDate[date].present++;
          } else if (record.status === 'absent') {
            attendanceByDate[date].absent++;
          } else if (record.status === 'late') {
            attendanceByDate[date].late++;
          }

          // Department data
          if (record.profiles?.department) {
            const dept = record.profiles.department;
            if (!departmentHours[dept]) {
              departmentHours[dept] = { hours: 0, employees: new Set() };
            }
            departmentHours[dept].employees.add(record.user_id);
          }
        });
      }

      // Convert to chart data
      const chartData = Object.entries(attendanceByDate).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString(),
        ...data
      }));

      setAttendanceData(chartData);

      // Process department data
      const deptData = Object.entries(departmentHours).map(([department, data]) => ({
        department,
        hours: Math.round(Math.random() * 40 + 30), // Placeholder calculation
        employees: data.employees.size
      }));

      setDepartmentData(deptData);

      // Calculate summary stats
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_active', true);

      setTotalEmployees(profiles?.length || 0);

      // Calculate attendance rate
      const totalPresent = chartData.reduce((sum, day) => sum + day.present, 0);
      const totalPossible = chartData.length * (profiles?.length || 1);
      setAttendanceRate(totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0);

      // Calculate average hours
      setAvgHoursPerDay(7.5); // Placeholder

    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    // Create CSV content
    const csvContent = [
      ['Date', 'Present', 'Absent', 'Late'],
      ...attendanceData.map(row => [row.date, row.present, row.absent, row.late])
    ].map(row => row.join(',')).join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${selectedPeriod}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Report has been downloaded successfully.",
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (!user || (user.role !== 'founder' && user.role !== 'manager' && user.role !== 'hr')) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Only managers and above can view reports.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">This {selectedPeriod}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours/Day</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHoursPerDay}</div>
            <p className="text-xs text-muted-foreground">Per employee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceData.length}</div>
            <p className="text-xs text-muted-foreground">Reporting period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" fill="#0088FE" name="Present" />
                <Bar dataKey="late" fill="#FFBB28" name="Late" />
                <Bar dataKey="absent" fill="#FF8042" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ department, employees }) => `${department} (${employees})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="employees"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
