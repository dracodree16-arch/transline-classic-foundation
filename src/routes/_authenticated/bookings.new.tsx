import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/bookings/new")({
  head: () => ({
    meta: [
      { title: "New Booking | Transline Classic TMS" },
      { name: "description", content: "Capture passenger details and issue a ticket." },
      { property: "og:title", content: "New Booking | Transline Classic TMS" },
      { property: "og:description", content: "Capture passenger details and issue a ticket." },
    ],
  }),
  component: BookingsNewPage,
});

function BookingsNewPage() {
  return (
    <Page title="New Booking" description="Capture passenger details and issue a ticket.">
      <DemoNotice />
      <SectionCard title="Passenger & trip">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); toast.info("Demo only — saving is enabled in a later phase."); }}>
            <div className="space-y-2"><Label>Passenger name</Label><Input placeholder="Passenger name" /></div>
            <div className="space-y-2"><Label>Phone number</Label><Input placeholder="Phone number" /></div>
            <div className="space-y-2"><Label>ID number</Label><Input placeholder="ID number" /></div>
            <div className="space-y-2"><Label>Trip / route</Label><Input placeholder="Trip / route" /></div>
            <div className="space-y-2"><Label>Seat number</Label><Input placeholder="Seat number" /></div>
            <div className="space-y-2"><Label>Fare (KES)</Label><Input placeholder="Fare (KES)" /></div>
            <div className="sm:col-span-2">
              <Button type="submit">Create booking</Button>
            </div>
          </form>
      </SectionCard>
    </Page>
  );
}
