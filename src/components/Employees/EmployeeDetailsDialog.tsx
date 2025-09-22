
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface EmployeeDetailsDialogProps {
  employee: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmployeeDetailsDialog: React.FC<EmployeeDetailsDialogProps> = ({ 
  employee, 
  open, 
  onOpenChange 
}) => {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{employee.name} - Employee Details</DialogTitle>
          <DialogDescription>
            Personal information and salary details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Full Name</p>
                <p className="text-sm text-muted-foreground">{employee.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Employee Code</p>
                <p className="text-sm text-muted-foreground">{employee.employee_code}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{employee.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{employee.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Department</p>
                <p className="text-sm text-muted-foreground">{employee.department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Position</p>
                <p className="text-sm text-muted-foreground">{employee.position || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Role</p>
                <Badge variant="outline">{employee.role}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                  {employee.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Join Date</p>
                <p className="text-sm text-muted-foreground">
                  {employee.join_date ? format(new Date(employee.join_date), 'PPP') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Monthly Salary</p>
                <p className="text-sm text-muted-foreground font-semibold">
                  ₹{Number(employee.monthly_salary || 0).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {(employee.upi_id || employee.bank_account_number) && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {employee.upi_id && (
                  <div>
                    <p className="text-sm font-medium">UPI ID</p>
                    <p className="text-sm text-muted-foreground">{employee.upi_id}</p>
                  </div>
                )}
                {employee.bank_account_number && (
                  <div>
                    <p className="text-sm font-medium">Bank Account</p>
                    <p className="text-sm text-muted-foreground">{employee.bank_account_number}</p>
                  </div>
                )}
                {employee.bank_ifsc && (
                  <div>
                    <p className="text-sm font-medium">IFSC Code</p>
                    <p className="text-sm text-muted-foreground">{employee.bank_ifsc}</p>
                  </div>
                )}
                {employee.bank_name && (
                  <div>
                    <p className="text-sm font-medium">Bank Name</p>
                    <p className="text-sm text-muted-foreground">{employee.bank_name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
