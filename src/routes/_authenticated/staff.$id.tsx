import { createFileRoute } from "@tanstack/react-router";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/staff/$id")({
  head: () => ({
    meta: [
      { title: "Staff Details | Transline Classic TMS" },
      { name: "description", content: "Staff profile, branch and activity." },
      { property: "og:title", content: "Staff Details | Transline Classic TMS" },
      { property: "og:description", content: "Staff profile, branch and activity." },
    ],
  }),
  component: StaffIdPage,
});

function StaffIdPage() {
  const { id } = Route.useParams();
  return (
    <Page title="Staff Details" description="Staff profile, branch and activity.">
      <DemoNotice />
      <SectionCard title="Record">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Reference</p><p className="mt-1 font-mono text-sm font-medium">{id}</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Name</p><p className="mt-1 font-medium">Everlyne Kwamboka</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Role</p><p className="mt-1 font-medium">Booking Agent</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Branch</p><p className="mt-1 font-medium">Oyugis</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Phone</p><p className="mt-1 font-medium">+254 711 000 004</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Status</p><p className="mt-1 font-medium">Active</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Joined</p><p className="mt-1 font-medium">Jan 2024</p></div>
          </div>
      </SectionCard>
    </Page>
  );
}
