
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ExpensesList } from '@/components/Expenses/ExpensesList';
import { AddExpenseDialog } from '@/components/Expenses/AddExpenseDialog';
import { useExpensesData } from '@/hooks/useExpensesData';

const CompanyExpenses = () => {
  const { user } = useAuth();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const { data: expensesStats, isLoading } = useExpensesData();

  // Check if user has access (founder or cofounder only)
  if (!user || (user.role !== 'founder' && user.role !== 'cofounder')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Only founders and cofounders can access company expenses.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Company Expenses</h1>
          <p className="text-muted-foreground">
            Manage fixed and variable company expenses
          </p>
        </div>
        <Button onClick={() => setShowAddExpense(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{expensesStats?.totalMonthly?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fixed Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{expensesStats?.fixedExpenses?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variable Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{expensesStats?.variableExpenses?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{expensesStats?.thisMonth?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <ExpensesList />

      {/* Add Expense Dialog */}
      <AddExpenseDialog 
        open={showAddExpense} 
        onOpenChange={setShowAddExpense} 
      />
    </div>
  );
};

export default CompanyExpenses;
