
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Edit, DollarSign, Phone, Mail, Calendar } from 'lucide-react';
import { useMockQuery } from '@/hooks/useMockData';
import { mockSupabase } from '@/services/mockSupabase';
import { useMockAuth } from '@/hooks/useMockAuth';
import { EmployeeDetailsDialog } from './EmployeeDetailsDialog';
import { EditSalaryDialog } from './EditSalaryDialog';

export const EmployeeList = () => {
  const { user } = useMockAuth();
  const { data: employees, isLoading } = useMockQuery(
    ['employees'],
    async () => {
      const { data, error } = await mockSupabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false })
        .execute();
      
      if (error) throw error;
      return data || [];
    },
    true
  );
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [editingSalary, setEditingSalary] = useState<any>(null);

  const canEditSalary = user?.role === 'founder' || user?.role === 'cofounder';

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <CardDescription>
            Registered employees with their personal and salary details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees?.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={employee.avatar_url || ''} alt={employee.name} />
                    <AvatarFallback>
                      {employee.name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h4 className="font-medium">{employee.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {employee.email}
                      </div>
                      {employee.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {employee.phone}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{employee.employee_code}</Badge>
                      {employee.role && (
                        <Badge variant="secondary">{employee.role}</Badge>
                      )}
                      {employee.department && (
                        <Badge variant="outline">{employee.department}</Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Joined {new Date(employee.join_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="font-semibold text-green-600">₹{Number(employee.monthly_salary).toLocaleString()}/mo</p>
                    <p className="text-xs text-muted-foreground">
                      {employee.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {canEditSalary && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSalary(employee)}
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {employees?.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No employees found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EmployeeDetailsDialog
        employee={selectedEmployee}
        open={!!selectedEmployee}
        onOpenChange={(open) => !open && setSelectedEmployee(null)}
      />

      <EditSalaryDialog
        employee={editingSalary}
        open={!!editingSalary}
        onOpenChange={(open) => !open && setEditingSalary(null)}
      />
    </>
  );
};
