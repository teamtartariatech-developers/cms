
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TaskCard from './TaskCard';
import { Card, CardContent } from '@/components/ui/card';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string;
  estimated_hours: number;
  assigned_by: {
    first_name: string;
    last_name: string;
  };
}

interface TaskListProps {
  onStartWorkOnTask: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ onStartWorkOnTask }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_by:profiles!tasks_assigned_by_fkey (
            first_name,
            last_name
          )
        `)
        .eq('assigned_to', user.id)
        .in('status', ['pending', 'in_progress'])
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true });

      if (error) throw error;

      // Type cast the data to ensure proper TypeScript types
      const typedTasks: Task[] = (data || []).map(task => ({
        ...task,
        priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled'
      }));

      setTasks(typedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId: string, status: string) => {
    try {
      const updateData: any = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      await fetchTasks();
      toast({
        title: "Success",
        description: `Task ${status === 'completed' ? 'completed' : 'updated'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground text-sm">
            No active tasks assigned to you.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onStatusUpdate={handleStatusUpdate}
          onStartWork={onStartWorkOnTask}
        />
      ))}
    </div>
  );
};

export default TaskList;
