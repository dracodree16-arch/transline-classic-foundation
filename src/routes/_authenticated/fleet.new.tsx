import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/fleet/new")({
  head: () => ({
    meta: [
      { title: "Add Bus | Transline Classic TMS" },
      { name: "description", content: "Register a new bus into the fleet." },
      { property: "og:title", content: "Add Bus | Transline Classic TMS" },
      { property: "og:description", content: "Register a new bus into the fleet." },
    ],
  }),
  component: FleetNewPage,
});

function FleetNewPage() {
  return (
    <Page title="Add Bus" description="Register a new bus into the fleet.">
      <DemoNotice />
      <SectionCard title="Bus details">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); toast.info("Demo only — saving is enabled in a later phase."); }}>
            <div className="space-y-2"><Label>Plate number</Label><Input placeholder="Plate number" /></div>
            <div className="space-y-2"><Label>Model</Label><Input placeholder="Model" /></div>
            <div className="space-y-2"><Label>Seat capacity</Label><Input placeholder="Seat capacity" /></div>
            <div className="space-y-2"><Label>Home branch</Label><Input placeholder="Home branch" /></div>
            <div className="space-y-2"><Label>Status</Label><Input placeholder="Status" /></div>
            <div className="space-y-2"><Label>Year of manufacture</Label><Input placeholder="Year of manufacture" /></div>
            <div className="sm:col-span-2">
              <Button type="submit">Add bus</Button>
            </div>
          </form>
      </SectionCard>
    </Page>
  );
}
