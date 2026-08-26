import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Bus,
  Map,
  Building2,
  CalendarClock,
  Wallet,
  ShieldCheck,
  Settings,
  Scale,
  BarChart3,
  Plus,
  UserPlus,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Page, SectionCard } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { KES } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: ({ context }) => {
    if (context.profile.role !== "admin") throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Admin | Transline Classic TMS" },
      { name: "description", content: "System control centre — staff, fleet, routes and configuration." },
      { property: "og:title", content: "Admin | Transline Classic TMS" },
      { property: "og:description", content: "System control centre — staff, fleet, routes and configuration." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const count = (res: { count: number | null }) => res.count ?? 0;
      const nowIso = new Date().toISOString();
      const [staff, buses, routes, branches, upcomingTrips, pendingBookings, pendingPay, audit] =
        await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("buses").select("*", { count: "exact", head: true }),
          supabase.from("routes").select("*", { count: "exact", head: true }),
          supabase.from("branches").select("*", { count: "exact", head: true }),
          supabase.from("trips").select("*", { count: "exact", head: true }).gte("departure_time", nowIso),
          supabase.from("bookings").select("*", { count: "exact", head: true }).eq("payment_status", "pending"),
          supabase.from("payments").select("amount, status").eq("status", "pending"),
          supabase
            .from("audit_logs")
            .select("id, action, entity_type, created_at")
            .order("created_at", { ascending: false })
            .limit(8),
        ]);

      const pendingAmount = (pendingPay.data ?? []).reduce((s, p: any) => s + Number(p.amount || 0), 0);

      return {
        staff: count(staff),
        buses: count(buses),
        routes: count(routes),
        branches: count(branches),
        upcomingTrips: count(upcomingTrips),
        pendingBookings: count(pendingBookings),
        pendingAmount,
        audit: (audit.data ?? []) as { id: string; action: string; entity_type: string | null; created_at: string }[],
      };
    },
  });

  const stats = [
    { label: "Staff accounts", value: data?.staff ?? "—", icon: Users },
    { label: "Buses", value: data?.buses ?? "—", icon: Bus },
    { label: "Routes", value: data?.routes ?? "—", icon: Map },
    { label: "Branches", value: data?.branches ?? "—", icon: Building2 },
    { label: "Upcoming trips", value: data?.upcomingTrips ?? "—", icon: CalendarClock },
    {
      label: "Pending payments",
      value: data ? KES(data.pendingAmount) : "—",
      hint: data ? `${data.pendingBookings} bookings` : undefined,
      icon: Wallet,
    },
  ];

  const actions = [
    { title: "Create trip", to: "/trips/new", icon: Plus },
    { title: "Add bus", to: "/fleet/new", icon: Bus },
    { title: "Add route", to: "/routes/new", icon: Map },
    { title: "Add clerk", to: "/staff/new", icon: UserPlus },
    { title: "Roles & permissions", to: "/staff/roles", icon: ShieldCheck },
    { title: "Reconciliation", to: "/reconciliation", icon: Scale },
    { title: "Analysis", to: "/analysis", icon: BarChart3 },
    { title: "System settings", to: "/settings/system", icon: Settings },
  ] as const;

  return (
    <Page
      title="Admin Control Centre"
      description="Manage staff, fleet, routes, finance controls and system configuration."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} style={{ boxShadow: "var(--shadow-card)" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{s.value}</p>
              {"hint" in s && s.hint && (
                <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <SectionCard title="Quick actions">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="flex items-center gap-3 rounded-xl border border-border p-4 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <a.icon className="size-4" />
              </span>
              {a.title}
            </Link>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Recent activity">
        {!data ? (
          <p className="text-sm text-muted-foreground">Loading activity…</p>
        ) : data.audit.length === 0 ? (
          <p className="text-sm text-muted-foreground">No audit activity recorded yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {data.audit.map((log) => (
              <li key={log.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {log.action}
                  </Badge>
                  <span className="text-muted-foreground">{log.entity_type ?? "system"}</span>
                </div>
                <time className="text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </Page>
  );
}
