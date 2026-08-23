import { createFileRoute } from "@tanstack/react-router";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/trips/$id")({
  head: () => ({
    meta: [
      { title: "Trip Details | Transline Classic TMS" },
      { name: "description", content: "Seat occupancy, manifest and dispatch status." },
      { property: "og:title", content: "Trip Details | Transline Classic TMS" },
      { property: "og:description", content: "Seat occupancy, manifest and dispatch status." },
    ],
  }),
  component: TripsIdPage,
});

function TripsIdPage() {
  const { id } = Route.useParams();
  return (
    <Page title="Trip Details" description="Seat occupancy, manifest and dispatch status.">
      <DemoNotice />
      <SectionCard title="Record">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Reference</p><p className="mt-1 font-mono text-sm font-medium">{id}</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Route</p><p className="mt-1 font-medium">Nairobi → Kisii</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Bus</p><p className="mt-1 font-medium">KDU 995Y</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Departure</p><p className="mt-1 font-medium">08:30</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Seats</p><p className="mt-1 font-medium">32 / 49 booked</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Status</p><p className="mt-1 font-medium">Scheduled</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Dispatcher</p><p className="mt-1 font-medium">Dennis Kiprop</p></div>
          </div>
      </SectionCard>
    </Page>
  );
}
