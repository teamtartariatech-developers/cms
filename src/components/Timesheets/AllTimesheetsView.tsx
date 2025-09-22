import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface HourlyUpdate {
  hour: number;
  description: string;
  timestamp: string;
}

interface TimesheetWithProfile {
  id: string;
  date: string;
  hours_worked: number;
  status: string;
  hourly_updates: HourlyUpdate[];
  user_id: string;
  profiles?: {
    first_name: string;
    last_name: string;
    department?: string;
    position?: string;
  } | null;
}

const AllTimesheetsView = () => {
  const { user } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const isFounder = user?.role === 'founder' || user?.role === 'cofounder';

  const { data: timesheets, isLoading } = useQuery({
    queryKey: ['all-timesheets', selectedEmployee, selectedStatus, dateFilter],
    queryFn: async () => {
      if (!isFounder) return [];

      let query = supabase
        .from('timesheets')
        .select(`
          *,
          profiles!user_id (
            first_name,
            last_name,
            department,
            position
          )
        `)
        .order('date', { ascending: false });

      if (selectedEmployee !== 'all') {
        query = query.eq('user_id', selectedEmployee);
      }

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus as 'draft' | 'submitted' | 'approved');
      }

      if (dateFilter) {
        query = query.eq('date', dateFilter);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      return (data || []).map(timesheet => ({
        ...timesheet,
        hourly_updates: Array.isArray(timesheet.hourly_updates) 
          ? (timesheet.hourly_updates as unknown as HourlyUpdate[])
          : [],
        profiles: timesheet.profiles || null
      })) as TimesheetWithProfile[];
    },
    enabled: isFounder,
  });

  const { data: employees } = useQuery({
    queryKey: ['employees-for-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      return data;
    },
    enabled: isFounder,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalHoursForEmployee = (employeeId: string) => {
    if (!timesheets) return 0;
    return timesheets
      .filter(t => t.user_id === employeeId)
      .reduce((total, timesheet) => total + (timesheet.hours_worked || 0), 0);
  };

  if (!isFounder) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Only founders can view all employee timesheets.
          </p>
        </CardContent>
      </Card>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            All Employee Timesheets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="min-w-[200px]">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees?.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[150px]">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filter by date"
              />
            </div>

            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedEmployee('all');
                setSelectedStatus('all');
                setDateFilter('');
              }}
            >
              Clear Filters
            </Button>
          </div>

          {/* Timesheets Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Hours Worked</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Activities Count</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timesheets?.map((timesheet) => (
                  <TableRow key={timesheet.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {timesheet.profiles ? 
                              `${timesheet.profiles.first_name} ${timesheet.profiles.last_name}` 
                              : 'Unknown Employee'
                            }
                          </div>
                          {timesheet.profiles?.department && (
                            <div className="text-sm text-muted-foreground">
                              {timesheet.profiles.department} - {timesheet.profiles.position}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(timesheet.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {timesheet.hours_worked} hours
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(timesheet.status)}>
                        {timesheet.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {timesheet.hourly_updates.length} activities
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {(!timesheets || timesheets.length === 0) && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No timesheets found for the selected filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllTimesheetsView;