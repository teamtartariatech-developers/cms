
import React, { useState, useEffect } from 'react';
import { useMockAuth } from '@/hooks/useMockAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
}

interface HourlyTask {
  id: string;
  hour: number;
  task_description: string;
  status: string;
  employee_notes: string | null;
  assigned_to: string;
}

const TaskAssignmentTable = () => {
  const { user } = useMockAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hourlyTasks, setHourlyTasks] = useState<HourlyTask[]>([]);
  const [newTasks, setNewTasks] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  const workHours = Array.from({ length: 8 }, (_, i) => i + 10); // 10:00 to 17:00

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee && selectedDate) {
      fetchHourlyTasks();
    }
  }, [selectedEmployee, selectedDate]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('is_active', true)
        .neq('role', 'founder')
        .order('first_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHourlyTasks = async () => {
    if (!selectedEmployee || !selectedDate) return;

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('hourly_tasks')
        .select('*')
        .eq('assigned_to', selectedEmployee)
        .eq('date', dateStr);

      if (error) throw error;
      setHourlyTasks(data || []);
    } catch (error) {
      console.error('Error fetching hourly tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch hourly tasks.",
        variant: "destructive",
      });
    }
  };

  const assignTask = async (hour: number, taskDescription: string) => {
    if (!selectedEmployee || !selectedDate || !taskDescription.trim()) return;

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { error } = await supabase
        .from('hourly_tasks')
        .upsert({
          assigned_to: selectedEmployee,
          assigned_by: user?.id,
          date: dateStr,
          hour,
          task_description: taskDescription.trim(),
          status: 'pending'
        });

      if (error) throw error;

      setNewTasks(prev => ({ ...prev, [hour]: '' }));
      await fetchHourlyTasks();
      
      toast({
        title: "Success",
        description: `Task assigned for ${hour}:00 successfully.`,
      });
    } catch (error) {
      console.error('Error assigning task:', error);
      toast({
        title: "Error",
        description: "Failed to assign task.",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('hourly_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      await fetchHourlyTasks();
      toast({
        title: "Success",
        description: "Task deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    }
  };

  const getTaskForHour = (hour: number) => {
    return hourlyTasks.find(task => task.hour === hour);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Hourly Tasks</CardTitle>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium">Select Employee</label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Select Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {selectedEmployee && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Time</TableHead>
                  <TableHead>Current Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Employee Notes</TableHead>
                  <TableHead>New Task / Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workHours.map((hour) => {
                  const existingTask = getTaskForHour(hour);
                  const timeSlot = `${hour}:00 - ${hour + 1}:00`;
                  
                  return (
                    <TableRow key={hour}>
                      <TableCell className="font-medium">{timeSlot}</TableCell>
                      <TableCell>
                        {existingTask ? (
                          <div className="font-medium">{existingTask.task_description}</div>
                        ) : (
                          <span className="text-muted-foreground">No task assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {existingTask && (
                          <Badge className={getStatusColor(existingTask.status)}>
                            {existingTask.status.replace('_', ' ')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {existingTask?.employee_notes && (
                          <div className="text-sm">{existingTask.employee_notes}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="Enter task description..."
                            value={newTasks[hour] || ''}
                            onChange={(e) => setNewTasks(prev => ({ 
                              ...prev, 
                              [hour]: e.target.value 
                            }))}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => assignTask(hour, newTasks[hour] || '')}
                            disabled={!newTasks[hour]?.trim()}
                          >
                            {existingTask ? 'Update' : 'Assign'}
                          </Button>
                          {existingTask && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteTask(existingTask.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskAssignmentTable;
