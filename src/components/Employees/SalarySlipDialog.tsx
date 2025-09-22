
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Download, Calculator } from 'lucide-react';

interface SalarySlipDialogProps {
  employee: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SalarySlipDialog: React.FC<SalarySlipDialogProps> = ({ 
  employee, 
  open, 
  onOpenChange 
}) => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: salaryRecord, isLoading } = useQuery({
    queryKey: ['salary-record', employee?.id, selectedMonth, selectedYear],
    queryFn: async () => {
      if (!employee) return null;

      const { data, error } = await supabase
        .from('employee_salary_records')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('month', selectedMonth)
        .eq('year', selectedYear)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!employee && open,
  });

  const generateSalarySlip = async () => {
    if (!employee || !salaryRecord) return;

    // Calculate daily salary
    const dailySalary = Number(employee.monthly_salary) / (salaryRecord.working_days || 26);
    const calculatedSalary = dailySalary * salaryRecord.present_days;

    console.log('Generating salary slip for:', employee.name);
    console.log('Salary details:', {
      monthlySalary: employee.monthly_salary,
      workingDays: salaryRecord.working_days,
      presentDays: salaryRecord.present_days,
      calculatedSalary,
      finalSalary: salaryRecord.final_salary,
    });
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Salary Slip - {employee.name}</DialogTitle>
          <DialogDescription>
            View and generate salary slip for the employee
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Month/Year Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Month</label>
              <Select 
                value={selectedMonth.toString()} 
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Year</label>
              <Select 
                value={selectedYear.toString()} 
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 3 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary Details */}
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ) : salaryRecord ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Salary Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Monthly Salary:</span>
                  <span>₹{Number(employee.monthly_salary).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Working Days:</span>
                  <span>{salaryRecord.working_days}</span>
                </div>
                <div className="flex justify-between">
                  <span>Present Days:</span>
                  <span>{salaryRecord.present_days}</span>
                </div>
                <div className="flex justify-between">
                  <span>Calculated Salary:</span>
                  <span>₹{Number(salaryRecord.calculated_salary).toLocaleString()}</span>
                </div>
                {salaryRecord.bonus > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Bonus:</span>
                    <span>+₹{Number(salaryRecord.bonus).toLocaleString()}</span>
                  </div>
                )}
                {salaryRecord.deductions > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Deductions:</span>
                    <span>-₹{Number(salaryRecord.deductions).toLocaleString()}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Final Salary:</span>
                  <span>₹{Number(salaryRecord.final_salary).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No salary record found for this month.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={generateSalarySlip}
              disabled={!salaryRecord}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Slip
            </Button>
            <Button 
              variant="outline"
              disabled={!salaryRecord}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Recalculate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
