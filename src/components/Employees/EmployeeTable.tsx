
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Phone, Trash2 } from 'lucide-react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  position?: string;
  is_active: boolean;
  avatar_url?: string;
}

interface EmployeeTableProps {
  employees: Employee[];
  canDelete: (employee: Employee) => boolean;
  onDeleteEmployee: (employeeId: string) => void;
  isDeleting: boolean;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  canDelete,
  onDeleteEmployee,
  isDeleting
}) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'founder':
        return 'bg-purple-100 text-purple-800';
      case 'cofounder':
        return 'bg-indigo-100 text-indigo-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'hr':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Directory</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees?.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={employee.avatar_url || undefined} />
                    <AvatarFallback>
                      {employee.first_name[0]}{employee.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {employee.first_name} {employee.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {employee.position || 'No position set'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(employee.role)}>
                    {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {employee.department || 'No department'}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-sm">
                      <Mail className="h-3 w-3" />
                      <span>{employee.email}</span>
                    </div>
                    {employee.phone && (
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{employee.phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                    {employee.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {canDelete(employee) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteEmployee(employee.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
