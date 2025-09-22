import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLeadsData } from "@/hooks/useLeadsData";

const LEAD_SOURCES = [
  "Google Search",
  "Google Maps",
  "Facebook",
  "LinkedIn",
  "Referral",
  "Website",
  "Cold Call",
  "Other"
];

const LEAD_STATUSES = [
  { value: "needs_immediate_service", label: "Needs Immediate Service" },
  { value: "interested_scheduled", label: "Interested (Scheduled Later)" },
  { value: "planned_inquiry", label: "Planned Inquiry" },
  { value: "not_interested", label: "Not Interested / Rejected" }
];

const MEETING_TYPES = [
  "Phone Call",
  "Video Call",
  "In-Person Meeting",
  "Demo",
  "Consultation"
];

export function AddLeadDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    contact_person: "",
    phone_number: "",
    email: "",
    address: "",
    source: "",
    status: "planned_inquiry",
    notes: "",
    interest_area: "",
    next_follow_up_date: undefined as Date | undefined,
    scheduled_meeting_date: undefined as Date | undefined,
    meeting_type: ""
  });

  const { addLead } = useLeadsData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const leadData = {
      business_name: formData.business_name,
      contact_person: formData.contact_person,
      phone_number: formData.phone_number || null,
      email: formData.email || null,
      address: formData.address || null,
      source: formData.source,
      status: formData.status,
      notes: formData.notes || null,
      interest_area: formData.interest_area || null,
      next_follow_up_date: formData.next_follow_up_date?.toISOString().split('T')[0] || null,
      scheduled_meeting_date: formData.scheduled_meeting_date?.toISOString() || null,
      meeting_type: formData.meeting_type || null
    };

    await addLead.mutateAsync(leadData);
    setOpen(false);
    setFormData({
      business_name: "",
      contact_person: "",
      phone_number: "",
      email: "",
      address: "",
      source: "",
      status: "planned_inquiry",
      notes: "",
      interest_area: "",
      next_follow_up_date: undefined,
      scheduled_meeting_date: undefined,
      meeting_type: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person *</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source *</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData({ ...formData, source: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                required
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
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest_area">Interest Area</Label>
            <Input
              id="interest_area"
              value={formData.interest_area}
              onChange={(e) => setFormData({ ...formData, interest_area: e.target.value })}
              placeholder="e.g., Web Development, Digital Marketing"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Conversation summary, requirements, etc."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Next Follow-up Date</Label>
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
            </div>
            <div className="space-y-2">
              <Label>Meeting Type</Label>
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
            </div>
          </div>

          <div className="space-y-2">
            <Label>Scheduled Meeting Date</Label>
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
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addLead.isPending}>
              {addLead.isPending ? "Adding..." : "Add Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}