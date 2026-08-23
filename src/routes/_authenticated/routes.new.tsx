import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/routes/new")({
  head: () => ({
    meta: [
      { title: "Add Route | Transline Classic TMS" },
      { name: "description", content: "Define origin, destination and base fare." },
      { property: "og:title", content: "Add Route | Transline Classic TMS" },
      { property: "og:description", content: "Define origin, destination and base fare." },
    ],
  }),
  component: RoutesNewPage,
});

function RoutesNewPage() {
  return (
    <Page title="Add Route" description="Define origin, destination and base fare.">
      <DemoNotice />
      <SectionCard title="Route details">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); toast.info("Demo only — saving is enabled in a later phase."); }}>
            <div className="space-y-2"><Label>Origin branch</Label><Input placeholder="Origin branch" /></div>
            <div className="space-y-2"><Label>Destination</Label><Input placeholder="Destination" /></div>
            <div className="space-y-2"><Label>Base fare (KES)</Label><Input placeholder="Base fare (KES)" /></div>
            <div className="space-y-2"><Label>Distance (km)</Label><Input placeholder="Distance (km)" /></div>
            <div className="space-y-2"><Label>Estimated duration</Label><Input placeholder="Estimated duration" /></div>
            <div className="sm:col-span-2">
              <Button type="submit">Add route</Button>
            </div>
          </form>
      </SectionCard>
    </Page>
  );
}
