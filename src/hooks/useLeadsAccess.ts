import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Provides: 
// - canAccessLeads: whether current user can access Leads section (founder or granted)
// - isFounder: current user is founder
// - list and grant/revoke utilities for founders
export const useLeadsPermission = () => {
  const { user } = useAuth();
  const isFounder = user?.role === "founder";

  const { data: accessRows, isLoading } = useQuery({
    queryKey: ["leads-access", user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as Array<{ id: string; user_id: string }>;
      const { data, error } = await supabase
        .from("leads_access")
        .select("id, user_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data as Array<{ id: string; user_id: string }>;
    },
    enabled: !!user?.id && !isFounder, // founders always have access; others check table
  });

  const canAccessLeads = isFounder || (accessRows?.length ?? 0) > 0;
  return { canAccessLeads, isFounder, isLoading };
};

export const useLeadsAccessAdmin = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isFounder = user?.role === "founder";

  const { data: allAccess = [] } = useQuery({
    queryKey: ["leads-access-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads_access").select("id, user_id");
      if (error) throw error;
      return data as Array<{ id: string; user_id: string }>;
    },
    enabled: isFounder,
  });

  const grant = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("leads_access")
        .insert({ user_id: targetUserId, granted_by: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads-access-all"] });
      queryClient.invalidateQueries({ queryKey: ["leads-access"] });
    },
  });

  const revoke = useMutation({
    mutationFn: async (targetUserId: string) => {
      const { error } = await supabase.from("leads_access").delete().eq("user_id", targetUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads-access-all"] });
      queryClient.invalidateQueries({ queryKey: ["leads-access"] });
    },
  });

  const accessSet = new Set(allAccess.map((r) => r.user_id));

  return { isFounder, grant, revoke, accessSet };
};
