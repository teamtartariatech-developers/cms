
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddEmployeeDialog = ({ open, onOpenChange }: AddEmployeeDialogProps) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'employee' as 'founder' | 'cofounder' | 'manager' | 'employee' | 'hr' | 'intern',
    department: '',
    position: '',
    monthly_salary: '',
    employee_code: '',
    join_date: new Date().toISOString().split('T')[0]
  });
  const queryClient = useQueryClient();

  const createEmployee = useMutation({
    mutationFn: async (data: typeof formData) => {
      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user) throw new Error('User not authenticated');
      
      // Check if email already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', data.email)
        .single();

      if (existingProfile) {
        throw new Error('An employee with this email already exists');
      }

      // Check if employee code already exists
      const { data: existingEmployee } = await supabase
        .from('employees')
        .select('employee_code')
        .eq('employee_code', data.employee_code)
        .single();

      if (existingEmployee) {
        throw new Error('An employee with this employee code already exists');
      }
      
      // Generate a UUID for the profile
      const profileId = crypto.randomUUID();
      
      // Create profile entry (without auth user)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: profileId,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
          department: data.department,
          position: data.position,
          phone: data.phone,
          is_active: true
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        if (profileError.code === '23505') {
          throw new Error('An employee with this email already exists');
        }
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      // Create employee record
      const { error: employeeError } = await supabase
        .from('employees')
        .insert({
          profile_id: profile.id,
          monthly_salary: parseFloat(data.monthly_salary),
          employee_code: data.employee_code,
          join_date: data.join_date,
          created_by: currentUser.data.user.id,
          is_active: true
        });

      if (employeeError) {
        console.error('Employee creation error:', employeeError);
        if (employeeError.code === '23505') {
          throw new Error('An employee with this employee code already exists');
        }
        throw new Error(`Failed to create employee: ${employeeError.message}`);
      }

      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees-stats'] });
      toast.success('Employee added successfully');
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'employee',
        department: '',
        position: '',
        monthly_salary: '',
        employee_code: '',
        join_date: new Date().toISOString().split('T')[0]
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add employee');
      console.error('Error adding employee:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.first_name || !formData.last_name || !formData.monthly_salary || !formData.employee_code) {
      toast.error('Please fill in all required fields');
      return;
    }
    createEmployee.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Add a new employee record with personal and salary details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="join_date">Join Date *</Label>
            <Input
              id="join_date"
              type="date"
              value={formData.join_date}
              onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee_code">Employee Code *</Label>
              <Input
                id="employee_code"
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                placeholder="EMP001"
                required
              />
            </div>
            <div>
              <Label htmlFor="monthly_salary">Monthly Salary *</Label>
              <Input
                id="monthly_salary"
                type="number"
                value={formData.monthly_salary}
                onChange={(e) => setFormData({ ...formData, monthly_salary: e.target.value })}
                placeholder="50000"
                required
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={createEmployee.isPending} className="flex-1">
              {createEmployee.isPending ? 'Adding...' : 'Add Employee'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
