import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddLeadDialog } from "@/components/Leads/AddLeadDialog";
import { LeadsList } from "@/components/Leads/LeadsList";
import { useLeadsData } from "@/hooks/useLeadsData";
import { Users, UserPlus, Calendar, TrendingUp } from "lucide-react";
import { useLeadsPermission } from "@/hooks/useLeadsAccess";

export default function Leads() {
  const { canAccessLeads, isLoading: accessLoading } = useLeadsPermission();
  
  if (accessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!canAccessLeads) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">You don't have permission to view Leads.</p>
        </div>
      </div>
    );
  }
  
  const { leads, isLoading } = useLeadsData();

  const getLeadStats = () => {
    if (!leads.length) return { total: 0, needsService: 0, scheduled: 0, planned: 0 };
    
    return {
      total: leads.length,
      needsService: leads.filter(lead => lead.status === 'needs_immediate_service').length,
      scheduled: leads.filter(lead => lead.status === 'interested_scheduled').length,
      planned: leads.filter(lead => lead.status === 'planned_inquiry').length,
    };
  };

  const stats = getLeadStats();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Lead Management</h1>
          <p className="text-muted-foreground">
            Capture and manage sales leads from various sources
          </p>
        </div>
        <AddLeadDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All captured leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Service</CardTitle>
            <TrendingUp className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.needsService}</div>
            <p className="text-xs text-muted-foreground">
              Immediate attention required
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.scheduled}</div>
            <p className="text-xs text-muted-foreground">
              Follow-up scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planned Inquiry</CardTitle>
            <UserPlus className="h-4 w-4 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.planned}</div>
            <p className="text-xs text-muted-foreground">
              In planning phase
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leads List */}
      <LeadsList />
    </div>
  );
}