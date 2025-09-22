
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface EmployeesHeaderProps {
  canAddEmployee: boolean;
  onAddEmployee: () => void;
}

export const EmployeesHeader: React.FC<EmployeesHeaderProps> = ({
  canAddEmployee,
  onAddEmployee
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Employees</h1>
        <p className="text-muted-foreground">
          Manage your team members and view employee information.
        </p>
      </div>
      {canAddEmployee && (
        <Button onClick={onAddEmployee}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      )}
    </div>
  );
};
