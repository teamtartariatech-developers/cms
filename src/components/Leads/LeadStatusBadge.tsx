import { Badge } from "@/components/ui/badge";

interface LeadStatusBadgeProps {
  status: string;
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "needs_immediate_service":
        return { label: "Needs Immediate Service", variant: "destructive" as const };
      case "interested_scheduled":
        return { label: "Interested (Scheduled)", variant: "default" as const };
      case "planned_inquiry":
        return { label: "Planned Inquiry", variant: "secondary" as const };
      case "not_interested":
        return { label: "Not Interested", variant: "outline" as const };
      default:
        return { label: status, variant: "secondary" as const };
    }
  };

  const { label, variant } = getStatusConfig(status);

  return <Badge variant={variant}>{label}</Badge>;
}