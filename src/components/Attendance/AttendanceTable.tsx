
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AttendanceTable = () => {
  const { user } = useAuth();
  const isFounder = user?.role === 'founder';

  const { data: attendanceData, refetch } = useQuery({
    queryKey: ['all-attendance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            avatar_url,
            department,
            position
          )
        `)
        .order('date', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    enabled: isFounder,
  });

  const deleteAttendance = async (id: string) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Attendance record deleted');
      refetch();
    } catch (error) {
      toast.error('Failed to delete attendance record');
      console.error('Error deleting attendance:', error);
    }
  };

  if (!isFounder) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Employee Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceData?.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={record.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {record.profiles?.first_name?.[0]}{record.profiles?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {record.profiles?.first_name} {record.profiles?.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {record.profiles?.department} - {record.profiles?.position}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{format(new Date(record.date), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  {record.check_in_time ? format(new Date(record.check_in_time), 'h:mm a') : '-'}
                </TableCell>
                <TableCell>
                  {record.check_out_time ? format(new Date(record.check_out_time), 'h:mm a') : 'In Progress'}
                </TableCell>
                <TableCell>{record.hours_worked || '-'}</TableCell>
                <TableCell>
                  <Badge variant={record.status === 'present' ? 'default' : 'secondary'}>
                    {record.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAttendance(record.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AttendanceTable;
