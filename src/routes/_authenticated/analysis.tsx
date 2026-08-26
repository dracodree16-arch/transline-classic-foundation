import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, TrendingDown, Ticket, Package, Wallet, Percent } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Page, SectionCard } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { KES } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/analysis")({
  beforeLoad: ({ context }) => {
    if (context.profile.role !== "admin") throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Analysis | Transline Classic TMS" },
      { name: "description", content: "Business overview — revenue, expenses, occupancy and branch performance." },
      { property: "og:title", content: "Analysis | Transline Classic TMS" },
      { property: "og:description", content: "Business overview — revenue, expenses, occupancy and branch performance." },
    ],
  }),
  component: AnalysisPage,
});

const dayKey = (iso: string) => new Date(iso).toISOString().slice(0, 10);
const dayLabel = (key: string) =>
  new Date(key + "T00:00:00").toLocaleDateString("en-KE", { month: "short", day: "numeric" });

function AnalysisPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analysis"],
    queryFn: async () => {
      const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const [bookingsRes, parcelsRes, expensesRes, tripsRes, branchesRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("fare_amount, payment_status, created_at, branch_id")
          .gte("created_at", since),
        supabase
          .from("parcels")
          .select("fare_amount, payment_status, created_at, origin_branch_id")
          .gte("created_at", since),
        supabase.from("expenses").select("amount, category, created_at, branch_id").gte("created_at", since),
        supabase.from("trips").select("total_seats, seats_booked"),
        supabase.from("branches").select("id, name"),
      ]);
      const err =
        bookingsRes.error || parcelsRes.error || expensesRes.error || tripsRes.error || branchesRes.error;
      if (err) throw new Error(err.message);

      const bookings = (bookingsRes.data ?? []) as any[];
      const parcels = (parcelsRes.data ?? []) as any[];
      const expenses = (expensesRes.data ?? []) as any[];
      const trips = (tripsRes.data ?? []) as any[];
      const branchName = new Map<string, string>(
        (branchesRes.data ?? []).map((b: any) => [b.id, b.name]),
      );

      const isPaid = (s: string | null) => s === "paid" || s === "success";
      const ticketRevenue = bookings.filter((b) => isPaid(b.payment_status)).reduce((s, b) => s + Number(b.fare_amount || 0), 0);
      const parcelRevenue = parcels.filter((p) => isPaid(p.payment_status)).reduce((s, p) => s + Number(p.fare_amount || 0), 0);
      const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

      // Revenue trend for the last 14 days.
      const days: string[] = Array.from({ length: 14 }, (_, i) =>
        new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
      );
      const trendMap = new Map(days.map((d) => [d, { day: dayLabel(d), tickets: 0, parcels: 0 }]));
      bookings.filter((b) => isPaid(b.payment_status)).forEach((b) => {
        const row = trendMap.get(dayKey(b.created_at));
        if (row) row.tickets += Number(b.fare_amount || 0);
      });
      parcels.filter((p) => isPaid(p.payment_status)).forEach((p) => {
        const row = trendMap.get(dayKey(p.created_at));
        if (row) row.parcels += Number(p.fare_amount || 0);
      });

      // Revenue by branch (tickets, paid).
      const branchMap = new Map<string, number>();
      bookings.filter((b) => isPaid(b.payment_status)).forEach((b) => {
        const name = branchName.get(b.branch_id) ?? "Unknown";
        branchMap.set(name, (branchMap.get(name) ?? 0) + Number(b.fare_amount || 0));
      });

      // Payment status split for bookings.
      const statusMap = new Map<string, number>();
      bookings.forEach((b) => {
        const s = isPaid(b.payment_status) ? "paid" : (b.payment_status ?? "pending");
        statusMap.set(s, (statusMap.get(s) ?? 0) + 1);
      });

      // Expenses by category.
      const catMap = new Map<string, number>();
      expenses.forEach((e) => catMap.set(e.category, (catMap.get(e.category) ?? 0) + Number(e.amount || 0)));

      const seatsTotal = trips.reduce((s, t) => s + Number(t.total_seats || 0), 0);
      const seatsBooked = trips.reduce((s, t) => s + Number(t.seats_booked || 0), 0);

      return {
        ticketRevenue,
        parcelRevenue,
        totalExpenses,
        net: ticketRevenue + parcelRevenue - totalExpenses,
        bookingCount: bookings.length,
        occupancy: seatsTotal > 0 ? Math.round((seatsBooked / seatsTotal) * 100) : 0,
        trend: days.map((d) => trendMap.get(d)!),
        byBranch: [...branchMap.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
        byStatus: [...statusMap.entries()].map(([name, value]) => ({ name, value })),
        byCategory: [...catMap.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      };
    },
  });

  const revenueConfig = {
    tickets: { label: "Tickets", color: "var(--chart-1)" },
    parcels: { label: "Parcels", color: "var(--chart-2)" },
  } satisfies ChartConfig;
  const branchConfig = { value: { label: "Revenue", color: "var(--chart-1)" } } satisfies ChartConfig;
  const catConfig = { value: { label: "Spent", color: "var(--chart-4)" } } satisfies ChartConfig;
  const statusColors: Record<string, string> = {
    paid: "var(--chart-2)",
    pending: "var(--chart-3)",
    failed: "var(--destructive)",
    cancelled: "var(--muted-foreground)",
  };

  return (
    <Page
      title="Analysis"
      description="Business overview — revenue, expenses, occupancy and branch performance (last 14 days)."
    >
      {isLoading && <p className="text-sm text-muted-foreground">Crunching the numbers…</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Kpi label="Ticket revenue" value={KES(data.ticketRevenue)} icon={<Ticket className="size-4" />} />
            <Kpi label="Parcel revenue" value={KES(data.parcelRevenue)} icon={<Package className="size-4" />} />
            <Kpi label="Expenses" value={KES(data.totalExpenses)} icon={<Wallet className="size-4" />} />
            <Kpi
              label="Net position"
              value={KES(data.net)}
              icon={data.net >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
              tone={data.net >= 0 ? "positive" : "negative"}
            />
            <Kpi label="Bookings" value={String(data.bookingCount)} icon={<Ticket className="size-4" />} />
            <Kpi label="Fleet occupancy" value={`${data.occupancy}%`} icon={<Percent className="size-4" />} />
          </div>

          <SectionCard title="Revenue trend">
            <ChartContainer config={revenueConfig} className="h-[280px] w-full">
              <AreaChart data={data.trend} margin={{ left: 4, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} width={44} fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area dataKey="tickets" type="monotone" fill="var(--color-tickets)" fillOpacity={0.2} stroke="var(--color-tickets)" stackId="a" />
                <Area dataKey="parcels" type="monotone" fill="var(--color-parcels)" fillOpacity={0.2} stroke="var(--color-parcels)" stackId="a" />
              </AreaChart>
            </ChartContainer>
          </SectionCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Revenue by branch">
              {data.byBranch.length === 0 ? (
                <Empty />
              ) : (
                <ChartContainer config={branchConfig} className="h-[280px] w-full">
                  <BarChart data={data.byBranch} layout="vertical" margin={{ left: 8, right: 12 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={90} fontSize={11} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                  </BarChart>
                </ChartContainer>
              )}
            </SectionCard>

            <SectionCard title="Booking payment status">
              {data.byStatus.length === 0 ? (
                <Empty />
              ) : (
                <ChartContainer
                  config={{ value: { label: "Bookings" } }}
                  className="mx-auto h-[280px] w-full"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie data={data.byStatus} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={2}>
                      {data.byStatus.map((s) => (
                        <Cell key={s.name} fill={statusColors[s.name] ?? "var(--chart-5)"} />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                  </PieChart>
                </ChartContainer>
              )}
            </SectionCard>
          </div>

          <SectionCard title="Expenses by category">
            {data.byCategory.length === 0 ? (
              <Empty />
            ) : (
              <ChartContainer config={catConfig} className="h-[260px] w-full">
                <BarChart data={data.byCategory} margin={{ left: 4, right: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} width={44} fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                </BarChart>
              </ChartContainer>
            )}
          </SectionCard>
        </>
      )}
    </Page>
  );
}

function Kpi({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "positive" | "negative";
}) {
  return (
    <Card style={{ boxShadow: "var(--shadow-card)" }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <p
          className={
            "text-xl font-semibold " +
            (tone === "positive" ? "text-primary" : tone === "negative" ? "text-destructive" : "")
          }
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function Empty() {
  return <p className="py-10 text-center text-sm text-muted-foreground">No data in this period yet.</p>;
}
