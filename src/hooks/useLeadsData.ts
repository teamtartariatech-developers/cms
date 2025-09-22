import { useMockQuery, useMockMutation } from "@/hooks/useMockData";
import { mockSupabase } from "@/services/mockSupabase";
import { useToast } from "@/hooks/use-toast";
import { Lead } from "@/data/mockData";

type LeadInsert = Omit<Lead, "id" | "created_by" | "created_at" | "updated_at">;
type LeadUpdate = Partial<Omit<Lead, "id" | "created_by" | "created_at">>;

export const useLeadsData = () => {
  const { toast } = useToast();

  const { data: leads = [], isLoading } = useMockQuery(
    ["leads"],
    async () => {
      const { data, error } = await mockSupabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .execute();
      
      if (error) throw error;
      return data;
    },
    true
  );

  const addLead = useMockMutation(async (leadData: LeadInsert) => {
    const { data: { user } } = await mockSupabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await mockSupabase
      .from("leads")
      .insert({ ...leadData, created_by: user.id });
      
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Lead added successfully",
    });
    
    return data;
  });

  const updateLead = useMockMutation(async ({ id, data }: { id: string; data: LeadUpdate }) => {
    const { error } = await mockSupabase
      .from("leads")
      .update(data)
      .eq("id", id);
      
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Lead updated successfully",
    });
  });

  const deleteLead = useMockMutation(async (id: string) => {
    const { error } = await mockSupabase
      .from("leads")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Lead deleted successfully",
    });
  });

  return {
    leads,
    isLoading,
    addLead,
    updateLead,
    deleteLead,
  };
};