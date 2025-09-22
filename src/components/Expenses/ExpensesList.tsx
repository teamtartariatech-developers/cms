
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, DollarSign } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpensesData';
import { EditExpenseDialog } from './EditExpenseDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export const ExpensesList = () => {
  const { data: expenses, isLoading } = useExpenses();
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    const { error } = await supabase
      .from('company_expenses')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete expense');
      return;
    }

    toast.success('Expense deleted successfully');
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['expenses-stats'] });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
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
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>
            Manage your company's fixed and variable expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses?.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{expense.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {expense.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={expense.expense_type === 'fixed' ? 'default' : 'secondary'}>
                        {expense.expense_type}
                      </Badge>
                      {expense.category && (
                        <Badge variant="outline">{expense.category}</Badge>
                      )}
                      <Badge variant={expense.payment_status === 'paid' ? 'default' : 'destructive'}>
                        {expense.payment_status === 'paid' ? 'Company Paid' : 'Company Not Paid'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(expense.expense_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="font-semibold">₹{Number(expense.amount).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      Added by {expense.created_by_name}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingExpense(expense)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(expense.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {expenses?.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No expenses found. Add your first expense!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditExpenseDialog
        expense={editingExpense}
        open={!!editingExpense}
        onOpenChange={(open) => !open && setEditingExpense(null)}
      />
    </>
  );
};
