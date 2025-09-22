
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockSupabase } from '@/services/mockSupabase';
import { toast } from 'sonner';
import { useMockMutation } from '@/hooks/useMockData';

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

  const createEmployee = useMockMutation(async (data: typeof formData) => {
      // Simulate employee creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { error } = await mockSupabase
        .from('employees')
        .insert({
          profile_id: crypto.randomUUID(),
          monthly_salary: parseFloat(data.monthly_salary),
          employee_code: data.employee_code,
          join_date: data.join_date,
          created_by: '1',
          is_active: true,
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          phone: data.phone,
          role: data.role,
          department: data.department,
          position: data.position,
        });

      if (error) throw error;
      
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
