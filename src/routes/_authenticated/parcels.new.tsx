import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/parcels/new")({
  head: () => ({
    meta: [
      { title: "Book Parcel | Transline Classic TMS" },
      { name: "description", content: "Register a parcel for transport between branches." },
      { property: "og:title", content: "Book Parcel | Transline Classic TMS" },
      { property: "og:description", content: "Register a parcel for transport between branches." },
    ],
  }),
  component: ParcelsNewPage,
});

function ParcelsNewPage() {
  return (
    <Page title="Book Parcel" description="Register a parcel for transport between branches.">
      <DemoNotice />
      <SectionCard title="Parcel details">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); toast.info("Demo only — saving is enabled in a later phase."); }}>
            <div className="space-y-2"><Label>Sender name</Label><Input placeholder="Sender name" /></div>
            <div className="space-y-2"><Label>Sender phone</Label><Input placeholder="Sender phone" /></div>
            <div className="space-y-2"><Label>Receiver name</Label><Input placeholder="Receiver name" /></div>
            <div className="space-y-2"><Label>Receiver phone</Label><Input placeholder="Receiver phone" /></div>
            <div className="space-y-2"><Label>Origin branch</Label><Input placeholder="Origin branch" /></div>
            <div className="space-y-2"><Label>Destination branch</Label><Input placeholder="Destination branch" /></div>
            <div className="space-y-2"><Label>Description</Label><Input placeholder="Description" /></div>
            <div className="space-y-2"><Label>Weight (kg)</Label><Input placeholder="Weight (kg)" /></div>
            <div className="space-y-2"><Label>Charge (KES)</Label><Input placeholder="Charge (KES)" /></div>
            <div className="sm:col-span-2">
              <Button type="submit">Book parcel</Button>
            </div>
          </form>
      </SectionCard>
    </Page>
  );
}
