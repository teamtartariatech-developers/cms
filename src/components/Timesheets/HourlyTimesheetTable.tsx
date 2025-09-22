import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HourlyTask {
  id: string;
  hour: number;
  task_description: string;
  status: 'pending' | 'in_progress' | 'completed';
  employee_notes: string | null;
  assigned_by: string;
  assigned_to: string;
  assigned_by_profile?: {
    first_name: string;
    last_name: string;
  } | null;
}

const HourlyTimesheetTable = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hourlyTasks, setHourlyTasks] = useState<HourlyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});

  const workHours = Array.from({ length: 8 }, (_, i) => i + 10); // 10:00 to 17:00
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      fetchHourlyTasks();
    }
  }, [user]);

  const fetchHourlyTasks = async () => {
    if (!user) return;

    try {
      console.log('Fetching hourly tasks for user:', user.id, 'date:', today);
      
      // First get the tasks assigned to the current user
      const { data: tasksData, error: tasksError } = await supabase
        .from('hourly_tasks')
        .select('*')
        .eq('assigned_to', user.id)
        .eq('date', today);

      if (tasksError) {
        console.error('Error fetching hourly tasks:', tasksError);
        throw tasksError;
      }

      console.log('Tasks fetched:', tasksData);

      // Then get profiles for assigned_by users
      if (tasksData && tasksData.length > 0) {
        const assignedByIds = [...new Set(tasksData.map(task => task.assigned_by))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', assignedByIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        // Combine the data
        const tasksWithProfiles: HourlyTask[] = tasksData.map(task => ({
          ...task,
          status: task.status as 'pending' | 'in_progress' | 'completed',
          assigned_by_profile: profilesData?.find(profile => profile.id === task.assigned_by) || null
        }));

        setHourlyTasks(tasksWithProfiles);
      } else {
        setHourlyTasks([]);
      }
    } catch (error) {
      console.error('Error fetching hourly tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch hourly tasks.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    if (!user) return;
    
    try {
      console.log('Updating task status:', taskId, 'to:', status, 'for user:', user.id);
      
      const { error } = await supabase
        .from('hourly_tasks')
        .update({ status })
        .eq('id', taskId)
        .eq('assigned_to', user.id); // Ensure user can only update their own tasks

      if (error) {
        console.error('Error updating task status:', error);
        throw error;
      }

      await fetchHourlyTasks();
      toast({
        title: "Success",
        description: `Task status updated to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
    }
  };

  const updateEmployeeNotes = async (taskId: string, notes: string) => {
    if (!user) return;
    
    try {
      console.log('Updating employee notes for task:', taskId, 'user:', user.id);
      
      const { error } = await supabase
        .from('hourly_tasks')
        .update({ employee_notes: notes })
        .eq('id', taskId)
        .eq('assigned_to', user.id); // Ensure user can only update their own tasks

      if (error) {
        console.error('Error updating notes:', error);
        throw error;
      }

      await fetchHourlyTasks();
      setEditingNotes(prev => ({ ...prev, [taskId]: '' }));
      toast({
        title: "Success",
        description: "Notes updated successfully.",
      });
    } catch (error) {
      console.error('Error updating notes:', error);
      toast({
        title: "Error",
        description: "Failed to update notes.",
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
        <CardTitle>Today's Hourly Schedule - {today}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Time</TableHead>
                <TableHead>Assigned Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Your Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workHours.map((hour) => {
                const task = getTaskForHour(hour);
                const timeSlot = `${hour}:00 - ${hour + 1}:00`;
                
                return (
                  <TableRow key={hour}>
                    <TableCell className="font-medium">{timeSlot}</TableCell>
                    <TableCell>
                      {task ? (
                        <div>
                          <div className="font-medium">{task.task_description}</div>
                          {task.assigned_by_profile && (
                            <div className="text-xs text-muted-foreground">
                              Assigned by: {task.assigned_by_profile.first_name} {task.assigned_by_profile.last_name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No task assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {task && (
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {task && (
                        <div className="space-y-2">
                          {editingNotes[task.id] !== undefined ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingNotes[task.id]}
                                onChange={(e) => setEditingNotes(prev => ({ 
                                  ...prev, 
                                  [task.id]: e.target.value 
                                }))}
                                placeholder="Add your notes..."
                                className="min-h-[60px]"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => updateEmployeeNotes(task.id, editingNotes[task.id])}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingNotes(prev => {
                                    const newState = { ...prev };
                                    delete newState[task.id];
                                    return newState;
                                  })}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-sm mb-1">
                                {task.employee_notes || 'No notes added'}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingNotes(prev => ({ 
                                  ...prev, 
                                  [task.id]: task.employee_notes || '' 
                                }))}
                              >
                                Edit Notes
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {task && (
                        <div className="flex gap-2">
                          {task.status !== 'in_progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTaskStatus(task.id, 'in_progress')}
                            >
                              Start
                            </Button>
                          )}
                          {task.status !== 'completed' && (
                            <Button
                              size="sm"
                              onClick={() => updateTaskStatus(task.id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default HourlyTimesheetTable;
