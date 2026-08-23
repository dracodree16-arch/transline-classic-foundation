import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/reports/")({
  head: () => ({
    meta: [
      { title: "Reports | Transline Classic TMS" },
      { name: "description", content: "Operational and financial reporting hub." },
      { property: "og:title", content: "Reports | Transline Classic TMS" },
      { property: "og:description", content: "Operational and financial reporting hub." },
    ],
  }),
  component: ReportsIndexPage,
});

function ReportsIndexPage() {
  return (
    <Page title="Reports" description="Operational and financial reporting hub.">
      <DemoNotice />
      <SectionCard title="Available reports">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link to="/reports/ticket-sales" className="rounded-xl border border-border p-4 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent">Ticket Sales</Link>
            <Link to="/reports/parcel-sales" className="rounded-xl border border-border p-4 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent">Parcel Sales</Link>
            <Link to="/reports/revenue" className="rounded-xl border border-border p-4 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent">Revenue</Link>
            <Link to="/reports/expenses" className="rounded-xl border border-border p-4 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent">Expenses</Link>
            <Link to="/reports/branches" className="rounded-xl border border-border p-4 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent">Branch Reports</Link>
          </div>
      </SectionCard>
    </Page>
  );
}
