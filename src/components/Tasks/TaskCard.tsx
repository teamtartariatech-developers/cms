
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

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

interface TaskCardProps {
  task: Task;
  onStatusUpdate: (taskId: string, status: string) => void;
  onStartWork: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusUpdate, onStartWork }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <CardTitle className="text-base sm:text-lg">{task.title}</CardTitle>
          <div className="flex gap-2">
            <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
              {task.priority}
            </Badge>
            <Badge className={`${getStatusColor(task.status)} text-xs`}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
            <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Assigned by: {task.assigned_by.first_name} {task.assigned_by.last_name}
          </div>
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Estimated: {task.estimated_hours}h
          </div>
          {task.due_date && (
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {task.status === 'pending' && (
            <Button 
              size="sm" 
              onClick={() => onStatusUpdate(task.id, 'in_progress')}
              className="w-full sm:w-auto"
            >
              Start Task
            </Button>
          )}
          {task.status === 'in_progress' && (
            <>
              <Button 
                size="sm" 
                onClick={() => onStartWork(task.id)}
                className="w-full sm:w-auto"
              >
                Log Hours
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onStatusUpdate(task.id, 'completed')}
                className="w-full sm:w-auto"
              >
                Mark Complete
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
