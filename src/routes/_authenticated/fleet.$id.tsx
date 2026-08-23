import { createFileRoute } from "@tanstack/react-router";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/fleet/$id")({
  head: () => ({
    meta: [
      { title: "Bus Details | Transline Classic TMS" },
      { name: "description", content: "Bus profile, assignment and service history." },
      { property: "og:title", content: "Bus Details | Transline Classic TMS" },
      { property: "og:description", content: "Bus profile, assignment and service history." },
    ],
  }),
  component: FleetIdPage,
});

function FleetIdPage() {
  const { id } = Route.useParams();
  return (
    <Page title="Bus Details" description="Bus profile, assignment and service history.">
      <DemoNotice />
      <SectionCard title="Record">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Reference</p><p className="mt-1 font-mono text-sm font-medium">{id}</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Plate</p><p className="mt-1 font-medium">KDU 995Y</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Model</p><p className="mt-1 font-medium">Isuzu Master</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Capacity</p><p className="mt-1 font-medium">49 seats</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Home branch</p><p className="mt-1 font-medium">Nairobi CBD</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Status</p><p className="mt-1 font-medium">Active</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Last service</p><p className="mt-1 font-medium">3 weeks ago</p></div>
          </div>
      </SectionCard>
    </Page>
  );
}
