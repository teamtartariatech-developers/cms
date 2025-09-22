
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Plus, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Announcements = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium',
    department: '',
    expires_at: ''
  });

  const canManageAnnouncements = user?.role === 'founder';

  const { data: announcements } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          profiles!announcements_created_by_fkey(first_name, last_name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('announcements')
        .insert({
          ...data,
          created_by: user?.id,
          expires_at: data.expires_at || null
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement created successfully');
      setShowNewAnnouncement(false);
      setFormData({
        title: '',
        content: '',
        priority: 'medium',
        department: '',
        expires_at: ''
      });
    },
    onError: (error) => {
      toast.error('Failed to create announcement');
      console.error('Error creating announcement:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }
    createAnnouncement.mutate(formData);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground">Company news and important updates</p>
        </div>
        {canManageAnnouncements && (
          <Button onClick={() => setShowNewAnnouncement(!showNewAnnouncement)}>
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        )}
      </div>

      {/* New Announcement Form */}
      {showNewAnnouncement && canManageAnnouncements && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Announcement</CardTitle>
            <CardDescription>Share important information with your team</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter announcement title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your announcement content..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Engineering"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="expires_at">Expires (Optional)</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={createAnnouncement.isPending}>
                  {createAnnouncement.isPending ? 'Publishing...' : 'Publish Announcement'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowNewAnnouncement(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements?.map((announcement) => (
          <Card key={announcement.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getPriorityIcon(announcement.priority)}
                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getPriorityColor(announcement.priority)}>
                    {announcement.priority}
                  </Badge>
                  {announcement.department && (
                    <Badge variant="outline">{announcement.department}</Badge>
                  )}
                </div>
              </div>
              <CardDescription>
                By {announcement.profiles?.first_name} {announcement.profiles?.last_name} • 
                {format(new Date(announcement.created_at), 'MMM d, yyyy h:mm a')}
                {announcement.expires_at && (
                  <span className="ml-2">• Expires {format(new Date(announcement.expires_at), 'MMM d, yyyy')}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-muted-foreground">
                {announcement.content}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {!announcements?.length && (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No announcements yet</p>
            {canManageAnnouncements && (
              <Button className="mt-2" onClick={() => setShowNewAnnouncement(true)}>
                Create your first announcement
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
