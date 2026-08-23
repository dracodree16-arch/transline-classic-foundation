import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { KES, revenueSeries } from "@/lib/demo-data";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/reports/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses Report | Transline Classic TMS" },
      { name: "description", content: "Cost breakdown by category and branch." },
      { property: "og:title", content: "Expenses Report | Transline Classic TMS" },
      { property: "og:description", content: "Cost breakdown by category and branch." },
    ],
  }),
  component: ReportsExpensesPage,
});

function ReportsExpensesPage() {
  return (
    <Page title="Expenses Report" description="Cost breakdown by category and branch.">
      <DemoNotice />
      <SectionCard title="Summary">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {[["Total", KES(1530600)], ["Transactions", "1,284"], ["Average", KES(1192)]].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} tickLine={false} axisLine={false} fontSize={12} />
                <Bar dataKey="tickets" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="parcels" fill="var(--color-primary-glow)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </SectionCard>
    </Page>
  );
}
