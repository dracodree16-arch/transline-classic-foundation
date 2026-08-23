import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/trips/new")({
  head: () => ({
    meta: [
      { title: "Create Trip | Transline Classic TMS" },
      { name: "description", content: "Schedule a bus against a route and departure time." },
      { property: "og:title", content: "Create Trip | Transline Classic TMS" },
      { property: "og:description", content: "Schedule a bus against a route and departure time." },
    ],
  }),
  component: TripsNewPage,
});

function TripsNewPage() {
  return (
    <Page title="Create Trip" description="Schedule a bus against a route and departure time.">
      <DemoNotice />
      <SectionCard title="Trip schedule">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); toast.info("Demo only — saving is enabled in a later phase."); }}>
            <div className="space-y-2"><Label>Route</Label><Input placeholder="Route" /></div>
            <div className="space-y-2"><Label>Bus plate</Label><Input placeholder="Bus plate" /></div>
            <div className="space-y-2"><Label>Departure date</Label><Input placeholder="Departure date" /></div>
            <div className="space-y-2"><Label>Departure time</Label><Input placeholder="Departure time" /></div>
            <div className="space-y-2"><Label>Total seats</Label><Input placeholder="Total seats" /></div>
            <div className="space-y-2"><Label>Driver</Label><Input placeholder="Driver" /></div>
            <div className="sm:col-span-2">
              <Button type="submit">Schedule trip</Button>
            </div>
          </form>
      </SectionCard>
    </Page>
  );
}
