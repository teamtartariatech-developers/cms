
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

interface ProjectStatusBadgeProps {
  project: any;
  canEdit?: boolean;
}

export const ProjectStatusBadge = ({ project, canEdit = false }: ProjectStatusBadgeProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const statusColors = {
    planning: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    on_hold: 'bg-orange-100 text-orange-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const handleStatusChange = async (newStatus: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled') => {
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', project.id);

    if (error) {
      toast.error('Failed to update project status');
      return;
    }

    toast.success('Project status updated successfully');
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const canEditStatus = canEdit && user && (user.role === 'founder' || user.role === 'cofounder' || user.role === 'manager');

  if (canEditStatus) {
    return (
      <Select onValueChange={handleStatusChange} defaultValue={project.status}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="planning">Planning</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="on_hold">On Hold</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Badge className={statusColors[project.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
      {project.status?.replace('_', ' ').toUpperCase()}
    </Badge>
  );
};
