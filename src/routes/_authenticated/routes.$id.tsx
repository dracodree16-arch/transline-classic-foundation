import { createFileRoute } from "@tanstack/react-router";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/routes/$id")({
  head: () => ({
    meta: [
      { title: "Route Details | Transline Classic TMS" },
      { name: "description", content: "Route profile, fares and assigned trips." },
      { property: "og:title", content: "Route Details | Transline Classic TMS" },
      { property: "og:description", content: "Route profile, fares and assigned trips." },
    ],
  }),
  component: RoutesIdPage,
});

function RoutesIdPage() {
  const { id } = Route.useParams();
  return (
    <Page title="Route Details" description="Route profile, fares and assigned trips.">
      <DemoNotice />
      <SectionCard title="Record">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Reference</p><p className="mt-1 font-mono text-sm font-medium">{id}</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Origin</p><p className="mt-1 font-medium">Nairobi</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Destination</p><p className="mt-1 font-medium">Kisii</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Base fare</p><p className="mt-1 font-medium">KES 1,500</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Distance</p><p className="mt-1 font-medium">305 km</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Duration</p><p className="mt-1 font-medium">6h 30m</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Daily trips</p><p className="mt-1 font-medium">4</p></div>
          </div>
      </SectionCard>
    </Page>
  );
}
