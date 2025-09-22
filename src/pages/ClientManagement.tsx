
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, DollarSign, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ClientList } from '@/components/Clients/ClientList';
import { AddClientDialog } from '@/components/Clients/AddClientDialog';
import { PaymentsList } from '@/components/Clients/PaymentsList';
import { useClientsData } from '@/hooks/useClientsData';

const ClientManagement = () => {
  const { user } = useAuth();
  const [showAddClient, setShowAddClient] = useState(false);
  const { data: clientsStats, isLoading } = useClientsData();

  // Check if user has access (founder or cofounder only)
  if (!user || (user.role !== 'founder' && user.role !== 'cofounder')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Only founders and cofounders can access client management.</p>
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
          <h1 className="text-3xl font-bold">Client Management</h1>
          <p className="text-muted-foreground">
            Manage clients, payments, and project tracking
          </p>
        </div>
        <Button onClick={() => setShowAddClient(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsStats?.totalClients || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsStats?.activeClients || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{clientsStats?.totalRevenue?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{clientsStats?.remainingBalance?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      <ClientList />

      {/* Payments List */}
      <PaymentsList />

      {/* Add Client Dialog */}
      <AddClientDialog 
        open={showAddClient} 
        onOpenChange={setShowAddClient} 
      />
    </div>
  );
};

export default ClientManagement;
