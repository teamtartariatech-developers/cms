
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, DollarSign, Phone, Mail, Pencil } from 'lucide-react';
import { useClients } from '@/hooks/useClientsData';
import { ClientDetailsDialog } from './ClientDetailsDialog';
import { AddPaymentDialog } from './AddPaymentDialog';
import { EditClientDialog } from './EditClientDialog';

export const ClientList = () => {
  const { data: clients, isLoading } = useClients();
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setShowDetails(true);
  };

  const handleAddPayment = (client) => {
    setSelectedClient(client);
    setShowAddPayment(true);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setShowEditClient(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
          <CardDescription>Manage your clients and their project details</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Monthly Amount</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients?.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {client.email}
                        {client.phone_number && (
                          <>
                            <Phone className="h-3 w-3 ml-2" />
                            {client.phone_number}
                          </>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {client.service_type}
                      {client.payment_type && (
                        <div className="text-xs text-muted-foreground">
                          {client.payment_type}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.monthly_amount ? (
                      <div>
                        <div className="font-medium">₹{Number(client.monthly_amount).toLocaleString()}/month</div>
                        <div className="text-xs text-muted-foreground">
                          {client.payment_type === 'monthly' ? 'Monthly Payment' : 'Regular Payment'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>₹{Number(client.total_amount).toLocaleString()}</TableCell>
                  <TableCell>₹{client.totalPaid.toLocaleString()}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">₹{client.remainingBalance.toLocaleString()}</div>
                      {client.monthly_amount && client.payment_type === 'monthly' && (
                        <div className="text-xs text-muted-foreground">
                          {client.pendingAmount > 0 ? `₹${client.pendingAmount.toLocaleString()} pending` : 'Up to date'}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={
                        client.paymentStatus === 'Paid' ? 'default' : 
                        client.paymentStatus === 'Partially Paid' ? 'secondary' : 'destructive'
                      }>
                        {client.paymentStatus}
                      </Badge>
                      {client.monthly_amount && client.payment_type === 'monthly' && (
                        <Badge variant={client.pendingAmount === 0 ? 'default' : 'destructive'} className="text-xs">
                          {client.pendingAmount === 0 ? 'Monthly: Current' : 'Monthly: Overdue'}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(client)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClient(client)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddPayment(client)}
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Payment
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ClientDetailsDialog
        client={selectedClient}
        open={showDetails}
        onOpenChange={setShowDetails}
      />

      <AddPaymentDialog
        client={selectedClient}
        open={showAddPayment}
        onOpenChange={setShowAddPayment}
      />

      <EditClientDialog
        client={selectedClient}
        open={showEditClient}
        onOpenChange={setShowEditClient}
      />
    </>
  );
};
