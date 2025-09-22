
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FolderOpen, Users, Calendar, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectStatusBadge } from '@/components/Projects/ProjectStatusBadge';
import AddProjectDialog from '@/components/Projects/AddProjectDialog';

const Projects = () => {
  const { user } = useAuth();
  const [showAddProject, setShowAddProject] = useState(false);
  
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          manager:profiles!projects_manager_id_fkey(first_name, last_name),
          creator:profiles!projects_created_by_fkey(first_name, last_name),
          assignments:project_assignments(
            id,
            user_id,
            role,
            profiles!project_assignments_user_id_fkey(first_name, last_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const canManageProjects = user?.role === 'founder' || user?.role === 'cofounder' || user?.role === 'manager';
  const canViewProjects = user?.role === 'founder';

  // Check if user has access (founder only)
  if (!user || user.role !== 'founder') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">Only founders can access the projects section.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track your projects with easy status updates
          </p>
        </div>
        {canManageProjects && (
          <Button onClick={() => setShowAddProject(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </div>
                <ProjectStatusBadge project={project} canEdit={canManageProjects} />
              </div>
              <CardDescription className="line-clamp-2">
                {project.description || 'No description provided'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Project Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Manager:</span>
                  <span>{project.manager ? `${project.manager.first_name} ${project.manager.last_name}` : 'Unassigned'}</span>
                </div>
                
                {project.start_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span>{new Date(project.start_date).toLocaleDateString()}</span>
                  </div>
                )}
                
                {project.end_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">End Date:</span>
                    <span>{new Date(project.end_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Team Members */}
              {project.assignments && project.assignments.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Team ({project.assignments.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {project.assignments.slice(0, 3).map((assignment: any) => (
                      <Badge key={assignment.id} variant="secondary" className="text-xs">
                        {assignment.profiles ? `${assignment.profiles.first_name} ${assignment.profiles.last_name}` : 'Unknown'}
                      </Badge>
                    ))}
                    {project.assignments.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.assignments.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </span>
                {canManageProjects && (
                  <Button size="sm" variant="outline">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects?.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first project.
            </p>
            {canManageProjects && (
              <Button onClick={() => setShowAddProject(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Project Dialog */}
      <AddProjectDialog 
        open={showAddProject} 
        onOpenChange={setShowAddProject} 
      />
    </div>
  );
};

export default Projects;
