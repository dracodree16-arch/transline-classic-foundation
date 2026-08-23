import { createFileRoute } from "@tanstack/react-router";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/reconciliation/$id")({
  head: () => ({
    meta: [
      { title: "Reconciliation Details | Transline Classic TMS" },
      { name: "description", content: "Line-by-line reconciliation for a branch day." },
      { property: "og:title", content: "Reconciliation Details | Transline Classic TMS" },
      { property: "og:description", content: "Line-by-line reconciliation for a branch day." },
    ],
  }),
  component: ReconciliationIdPage,
});

function ReconciliationIdPage() {
  const { id } = Route.useParams();
  return (
    <Page title="Reconciliation Details" description="Line-by-line reconciliation for a branch day.">
      <DemoNotice />
      <SectionCard title="Record">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Reference</p><p className="mt-1 font-mono text-sm font-medium">{id}</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Branch</p><p className="mt-1 font-medium">Nairobi CBD</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Sales</p><p className="mt-1 font-medium">KES 264,100</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Cash</p><p className="mt-1 font-medium">KES 118,400</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">M-Pesa</p><p className="mt-1 font-medium">KES 145,700</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Variance</p><p className="mt-1 font-medium">KES 0</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Reconciled by</p><p className="mt-1 font-medium">Martin Njoroge</p></div>
          </div>
      </SectionCard>
    </Page>
  );
}
