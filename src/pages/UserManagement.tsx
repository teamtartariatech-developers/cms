
import React, { useState } from 'react';
import { useMockAuth } from '@/hooks/useMockAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCheck, Search, Plus, Mail, Phone, Calendar } from 'lucide-react';
import { useMockQuery, useMockMutation } from '@/hooks/useMockData';
import { mockSupabase } from '@/services/mockSupabase';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useLeadsAccessAdmin } from '@/hooks/useLeadsAccess';

type UserRole = 'founder' | 'cofounder' | 'manager' | 'employee' | 'hr' | 'intern';

const UserManagement = () => {
  const { user } = useMockAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const hasAccess = ['founder', 'cofounder', 'hr'].includes(user?.role || '');

  const { data: users } = useMockQuery(
    ['users', searchTerm, roleFilter],
    async () => {
      let query = mockSupabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const { data, error } = await query.execute();
      if (error) throw error;
      return data;
    },
    hasAccess
  );

  const updateUserRole = useMockMutation(async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { error } = await mockSupabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      
      if (error) throw error;
      toast.success('User role updated successfully');
  });

  const deactivateUser = useMockMutation(async (userId: string) => {
      const { error } = await mockSupabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId);
      
      if (error) throw error;
      toast.success('User deactivated successfully');
  });

  const grant = useMockMutation(async (targetUserId: string) => {
    toast.success('Leads access granted');
  });

  const revoke = useMockMutation(async (targetUserId: string) => {
    toast.success('Leads access revoked');
  });

  const accessSet = new Set(['2', '3']); // Mock some users having access
  const isFounderUser = user?.role === 'founder';

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'founder': return 'default';
      case 'cofounder': return 'default';
      case 'manager': return 'secondary';
      case 'hr': return 'outline';
      case 'employee': return 'secondary';
      default: return 'secondary';
    }
  };

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">You don't have permission to manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage employee accounts and permissions</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role-filter">Filter by Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="founder">Founder</SelectItem>
                  <SelectItem value="cofounder">Co-founder</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users?.map((userProfile) => (
          <Card key={userProfile.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={userProfile.avatar_url || undefined} />
                  <AvatarFallback>
                    {userProfile.first_name?.[0]}{userProfile.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {userProfile.first_name} {userProfile.last_name}
                  </CardTitle>
                  <CardDescription>{userProfile.position || 'No position set'}</CardDescription>
                </div>
                <Badge variant={getRoleBadgeColor(userProfile.role)}>
                  {userProfile.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="truncate">{userProfile.email}</span>
                </div>
                
                {userProfile.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{userProfile.phone}</span>
                  </div>
                )}
                
                {userProfile.department && (
                  <div className="text-sm text-muted-foreground">
                    Department: {userProfile.department}
                  </div>
                )}
                
                {userProfile.hire_date && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Hired: {format(new Date(userProfile.hire_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex space-x-2">
                  <Select
                    value={userProfile.role}
                    onValueChange={(role: UserRole) => updateUserRole.mutate({ userId: userProfile.id, role })}
                    disabled={userProfile.id === user?.id || updateUserRole.isPending || !['founder', 'cofounder'].includes(user?.role || '')}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                      <SelectItem value="cofounder">Co-founder</SelectItem>
                      <SelectItem value="founder">Founder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">Leads Access</p>
                    <p className="text-xs text-muted-foreground">Allow access to Leads section</p>
                  </div>
                  <Switch
                    checked={accessSet.has(userProfile.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        grant.mutate(userProfile.id);
                      } else {
                        revoke.mutate(userProfile.id);
                      }
                    }}
                    disabled={!isFounderUser || grant.isPending || revoke.isPending}
                    aria-label="Toggle leads access"
                  />
                </div>
                
                {userProfile.id !== user?.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => deactivateUser.mutate(userProfile.id)}
                    disabled={deactivateUser.isPending}
                  >
                    Deactivate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {!users?.length && (
          <div className="col-span-full text-center py-8">
            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
