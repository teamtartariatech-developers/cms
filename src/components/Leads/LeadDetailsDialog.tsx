import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Building2, User, Phone, Mail, MapPin, Edit, Save, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLeadsData } from "@/hooks/useLeadsData";
import { LeadStatusBadge } from "./LeadStatusBadge";

const LEAD_SOURCES = [
  "Google Search", "Google Maps", "Facebook", "LinkedIn", "Referral", "Website", "Cold Call", "Other"
];

const LEAD_STATUSES = [
  { value: "needs_immediate_service", label: "Needs Immediate Service" },
  { value: "interested_scheduled", label: "Interested (Scheduled Later)" },
  { value: "planned_inquiry", label: "Planned Inquiry" },
  { value: "not_interested", label: "Not Interested / Rejected" }
];

const MEETING_TYPES = [
  "Phone Call", "Video Call", "In-Person Meeting", "Demo", "Consultation"
];

interface LeadDetailsDialogProps {
  lead: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailsDialog({ lead, open, onOpenChange }: LeadDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    business_name: lead.business_name,
    contact_person: lead.contact_person,
    phone_number: lead.phone_number || "",
    email: lead.email || "",
    address: lead.address || "",
    source: lead.source,
    status: lead.status,
    notes: lead.notes || "",
    interest_area: lead.interest_area || "",
    next_follow_up_date: lead.next_follow_up_date ? new Date(lead.next_follow_up_date) : undefined,
    scheduled_meeting_date: lead.scheduled_meeting_date ? new Date(lead.scheduled_meeting_date) : undefined,
    meeting_type: lead.meeting_type || ""
  });

  const { updateLead } = useLeadsData();

  const handleSave = async () => {
    const updateData = {
      ...formData,
      next_follow_up_date: formData.next_follow_up_date?.toISOString().split('T')[0] || null,
      scheduled_meeting_date: formData.scheduled_meeting_date?.toISOString() || null,
      meeting_type: formData.meeting_type || null
    };

    await updateLead.mutateAsync({ id: lead.id, data: updateData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      business_name: lead.business_name,
      contact_person: lead.contact_person,
      phone_number: lead.phone_number || "",
      email: lead.email || "",
      address: lead.address || "",
      source: lead.source,
      status: lead.status,
      notes: lead.notes || "",
      interest_area: lead.interest_area || "",
      next_follow_up_date: lead.next_follow_up_date ? new Date(lead.next_follow_up_date) : undefined,
      scheduled_meeting_date: lead.scheduled_meeting_date ? new Date(lead.scheduled_meeting_date) : undefined,
      meeting_type: lead.meeting_type || ""
    });
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Lead Details</DialogTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSave} disabled={updateLead.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Business Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                {isEditing ? (
                  <Input
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.business_name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Contact Person</Label>
                {isEditing ? (
                  <Input
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.contact_person}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                {isEditing ? (
                  <Input
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.phone_number || "Not provided"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                {isEditing ? (
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.email || "Not provided"}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              {isEditing ? (
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.address || "Not provided"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Lead Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Lead Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source</Label>
                {isEditing ? (
                  <Select
                    value={formData.source}
                    onValueChange={(value) => setFormData({ ...formData, source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_SOURCES.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 bg-muted/50 rounded">
                    <span>{lead.source}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                {isEditing ? (
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2">
                    <LeadStatusBadge status={lead.status} />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Interest Area</Label>
              {isEditing ? (
                <Input
                  value={formData.interest_area}
                  onChange={(e) => setFormData({ ...formData, interest_area: e.target.value })}
                />
              ) : (
                <div className="p-2 bg-muted/50 rounded">
                  <span>{lead.interest_area || "Not specified"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Schedule & Follow-up */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Schedule & Follow-up</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Next Follow-up Date</Label>
                {isEditing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.next_follow_up_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.next_follow_up_date ? (
                          format(formData.next_follow_up_date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.next_follow_up_date}
                        onSelect={(date) => setFormData({ ...formData, next_follow_up_date: date })}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="p-2 bg-muted/50 rounded">
                    <span>
                      {lead.next_follow_up_date 
                        ? format(new Date(lead.next_follow_up_date), "PPP")
                        : "Not scheduled"
                      }
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Meeting Type</Label>
                {isEditing ? (
                  <Select
                    value={formData.meeting_type}
                    onValueChange={(value) => setFormData({ ...formData, meeting_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select meeting type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEETING_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 bg-muted/50 rounded">
                    <span>{lead.meeting_type || "Not specified"}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Scheduled Meeting</Label>
              {isEditing ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.scheduled_meeting_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduled_meeting_date ? (
                        format(formData.scheduled_meeting_date, "PPP p")
                      ) : (
                        <span>Pick date and time</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.scheduled_meeting_date}
                      onSelect={(date) => setFormData({ ...formData, scheduled_meeting_date: date })}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="p-2 bg-muted/50 rounded">
                  <span>
                    {lead.scheduled_meeting_date 
                      ? format(new Date(lead.scheduled_meeting_date), "PPP p")
                      : "Not scheduled"
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notes</h3>
            {isEditing ? (
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add notes about this lead..."
                rows={4}
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded min-h-[100px]">
                <span className="text-sm">
                  {lead.notes || "No notes added"}
                </span>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-2 text-sm text-muted-foreground border-t pt-4">
            <p>Created: {format(new Date(lead.created_at), "PPP p")}</p>
            {lead.updated_at && lead.updated_at !== lead.created_at && (
              <p>Updated: {format(new Date(lead.updated_at), "PPP p")}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}