import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Banknote,
  Bus,
  CalendarClock,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  Landmark,
  Package,
  PackagePlus,
  Receipt,
  Send,
  Smartphone,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { Page, SectionCard, DemoNotice } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { alerts, bookings, dashboardStats, KES, parcels, revenueSeries, trips } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard | Transline Classic TMS" },
      {
        name: "description",
        content:
          "Daily bookings, revenue, fleet availability, active trips and parcel activity for Transline Classic branches across Kenya.",
      },
      { property: "og:title", content: "Operations Dashboard | Transline Classic TMS" },
      {
        property: "og:description",
        content: "Daily bookings, revenue, fleet, trips and parcel activity across Transline Classic branches.",
      },
    ],
  }),
  component: Dashboard,
});

const statIcons = [Ticket, Banknote, Bus, CalendarClock, Package, CreditCard];

const actionGroups = [
  {
    title: "Ticket Management",
    icon: Ticket,
    actions: [
      { label: "New Booking", to: "/bookings/new", icon: Ticket },
      { label: "Manifest", to: "/bookings/manifest", icon: ClipboardList },
      { label: "All Bookings", to: "/bookings", icon: FileText },
      { label: "Bus Dispatch", to: "/bookings/dispatch", icon: Send },
    ],
  },
  {
    title: "Parcel Management",
    icon: Package,
    actions: [
      { label: "Book Parcel", to: "/parcels/new", icon: PackagePlus },
      { label: "Loading Sheet", to: "/parcels/loading-sheet", icon: ClipboardList },
      { label: "All Parcels", to: "/parcels", icon: Package },
    ],
  },
  {
    title: "Finance",
    icon: Wallet,
    actions: [
      { label: "Overview", to: "/finance", icon: TrendingUp },
      { label: "Cash Forward", to: "/finance/cash-forward", icon: Send },
      { label: "Expenses", to: "/finance/expenses", icon: Receipt },
      { label: "Banking", to: "/finance/banking", icon: Landmark },
      { label: "Cash Received", to: "/finance/cash-received", icon: Banknote },
      { label: "Statements", to: "/finance/statements", icon: FileText },
      { label: "Mobile Money", to: "/finance/mobile-money", icon: Smartphone },
    ],
  },
] as const;

const statusVariant = (status: string) =>
  status === "Paid" || status === "Delivered"
    ? "default"
    : status === "Cancelled"
      ? "destructive"
      : "secondary";

function Dashboard() {
  return (
    <Page
      title="Operations Dashboard"
      description="Live snapshot of Transline Classic operations across all branches."
      actions={
        <>
          <Button asChild variant="outline">
            <Link to="/parcels/new">
              <PackagePlus className="mr-2 size-4" /> Book parcel
            </Link>
          </Button>
          <Button asChild>
            <Link to="/bookings/new">
              <Ticket className="mr-2 size-4" /> New booking
            </Link>
          </Button>
        </>
      }
    >
      <DemoNotice />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardStats.map((stat, i) => {
          const Icon = statIcons[i] ?? Ticket;
          return (
            <Card key={stat.key} style={{ boxShadow: "var(--shadow-card)" }}>
              <CardContent className="flex items-start justify-between gap-4 pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.delta}</p>
                </div>
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {actionGroups.map((group) => (
          <SectionCard key={group.title} title={group.title}>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {group.actions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent"
                >
                  <action.icon className="size-4 text-primary" />
                  <span className="truncate">{action.label}</span>
                </Link>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Revenue — last 7 days (KES)"
          className="lg:col-span-2"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/reports/revenue">
                Reports <ArrowUpRight className="ml-1 size-4" />
              </Link>
            </Button>
          }
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ left: -12, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="tickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="parcelsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary-glow)" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="var(--color-primary-glow)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} tickLine={false} axisLine={false} fontSize={12} />
                <RechartsTooltip
                  formatter={(value: number) => KES(value)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tickets"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#tickets)"
                  name="Tickets"
                />
                <Area
                  type="monotone"
                  dataKey="parcels"
                  stroke="var(--color-primary-glow)"
                  strokeWidth={2}
                  fill="url(#parcelsFill)"
                  name="Parcels"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Notifications & alerts">
          <ul className="space-y-3">
            {alerts.map((a) => (
              <li key={a.id} className="rounded-xl border border-border p-3">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.message}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="size-3" /> {a.time}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Recent bookings"
          className="lg:col-span-2"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/bookings">View all</Link>
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead className="text-right">Fare</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.slice(0, 5).map((b) => (
                  <TableRow key={b.ref}>
                    <TableCell className="font-mono text-xs">{b.ref}</TableCell>
                    <TableCell className="font-medium">{b.passenger}</TableCell>
                    <TableCell className="whitespace-nowrap">{b.route}</TableCell>
                    <TableCell>{b.seat}</TableCell>
                    <TableCell className="text-right">{KES(b.fare)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>

        <SectionCard title="Calendar">
          <Calendar mode="single" selected={new Date()} className="rounded-xl border border-border" />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Upcoming trips"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/trips">View all</Link>
            </Button>
          }
        >
          <ul className="space-y-3">
            {trips.slice(0, 4).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.route}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.bus} · departs {t.departure}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">{t.status}</Badge>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.booked}/{t.seats} seats
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Recent parcel activity"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/parcels">View all</Link>
            </Button>
          }
        >
          <ul className="space-y-3">
            {parcels.map((p) => (
              <li key={p.code} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs">{p.code}</p>
                  <p className="truncate text-sm">
                    {p.from} → {p.to}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.sender} · {p.weight} kg
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                  <p className="mt-1 text-xs text-muted-foreground">{KES(p.fare)}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        title="Team on duty"
        action={
          <Button asChild variant="ghost" size="sm">
            <Link to="/staff">
              <Users className="mr-1 size-4" /> Staff
            </Link>
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          8 staff roles configured — Super Admin, Administrator, Manager, Booking Agent, Dispatcher, Parcel
          Staff, Finance Staff and Branch Staff.
        </p>
      </SectionCard>
    </Page>
  );
}
