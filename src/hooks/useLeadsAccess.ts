import { useMockAuth } from "@/hooks/useMockAuth";
import { useMockQuery, useMockMutation } from "@/hooks/useMockData";
import { mockSupabase } from "@/services/mockSupabase";

// Provides: 
// - canAccessLeads: whether current user can access Leads section (founder or granted)
// - isFounder: current user is founder
// - list and grant/revoke utilities for founders
export const useLeadsPermission = () => {
  const { user } = useMockAuth();
  const isFounder = user?.role === "founder";

  const { data: accessRows, isLoading } = useMockQuery(
    ["leads-access", user?.id],
    async () => {
      if (!user?.id) return [] as Array<{ id: string; user_id: string }>;
      const { data, error } = await mockSupabase
        .from("leads_access")
        .select("id, user_id")
        .eq("user_id", user.id)
        .execute();
      if (error) throw error;
      return data as Array<{ id: string; user_id: string }>;
    },
    !!user?.id && !isFounder // founders always have access; others check table
  );

  const canAccessLeads = isFounder || (accessRows?.length ?? 0) > 0;
  return { canAccessLeads, isFounder, isLoading };
};

export const useLeadsAccessAdmin = () => {
  const { user } = useAuth();
  const isFounder = user?.role === "founder";

  const { data: allAccess = [] } = useMockQuery(
    ["leads-access-all"],
    async () => {
      const { data, error } = await mockSupabase.from("leads_access").select("id, user_id").execute();
      if (error) throw error;
      return data as Array<{ id: string; user_id: string }>;
    },
    isFounder
  );

  const grant = useMockMutation(async (targetUserId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await mockSupabase
        .from("leads_access")
        .insert({ user_id: targetUserId, granted_by: user.id });
      if (error) throw error;
  });

  const revoke = useMockMutation(async (targetUserId: string) => {
      const { error } = await mockSupabase.from("leads_access").delete().eq("user_id", targetUserId);
      if (error) throw error;
  });

  const accessSet = new Set(allAccess.map((r) => r.user_id));

  return { isFounder, grant, revoke, accessSet };
};
