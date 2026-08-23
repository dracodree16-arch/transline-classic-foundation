import { createFileRoute } from "@tanstack/react-router";
import { KES } from "@/lib/demo-data";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/finance")({
  head: () => ({
    meta: [
      { title: "Financial Overview | Transline Classic TMS" },
      { name: "description", content: "Revenue, expenses and cash position in KES." },
      { property: "og:title", content: "Financial Overview | Transline Classic TMS" },
      { property: "og:description", content: "Revenue, expenses and cash position in KES." },
    ],
  }),
  component: FinanceIndexPage,
});

function FinanceIndexPage() {
  return (
    <Page title="Financial Overview" description="Revenue, expenses and cash position in KES.">
      <DemoNotice />
      <SectionCard title="Position today">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[["Ticket revenue", KES(264100)], ["Parcel revenue", KES(52400)], ["Expenses", KES(28200)], ["Net cash", KES(288300)]].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </Page>
  );
}
