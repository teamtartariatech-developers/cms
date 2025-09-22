
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useMockQuery } from '@/hooks/useMockData';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

export const AttendanceTracker = () => {
  const { data: attendanceData, isLoading } = useMockQuery(
    ['employee-attendance-stats'],
    async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          id: '1',
          employeeCode: 'EMP001',
          name: 'John Doe',
          email: 'founder@company.com',
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
          attendance: { check_in_time: '2025-01-11T09:15:00Z', check_out_time: null },
          isCheckedIn: true,
          isPresent: true,
          hoursWorked: 0,
        },
      ];
    },
    true
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Attendance</CardTitle>
        <CardDescription>Track employee check-in and check-out times</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Employee Code</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Hours Worked</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceData?.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-muted-foreground">{employee.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{employee.employeeCode}</Badge>
                </TableCell>
                <TableCell>
                  {employee.attendance?.check_in_time ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {format(new Date(employee.attendance.check_in_time), 'HH:mm')}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Not checked in
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {employee.attendance?.check_out_time ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {format(new Date(employee.attendance.check_out_time), 'HH:mm')}
                    </div>
                  ) : employee.attendance?.check_in_time ? (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      Still working
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Not checked out
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {employee.hoursWorked ? `${employee.hoursWorked}h` : 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge variant={
                    employee.isPresent ? 'default' : 'destructive'
                  }>
                    {employee.isPresent ? (employee.isCheckedIn ? 'Working' : 'Completed') : 'Absent'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
