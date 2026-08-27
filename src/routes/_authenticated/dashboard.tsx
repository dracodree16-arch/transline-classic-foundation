import { useEffect, useState } from "react";
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

import { Page, SectionCard } from "@/components/page-shell";
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
import { supabase } from "@/integrations/supabase/client";
import { useStaffSession } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard | Transline Classic TMS" },
      {
        name: "description",
        content:
          "Daily bookings, revenue, fleet availability, active trips and parcel activity for Transline Classic branches across Kenya.",
      },
    ],
  }),
  component: Dashboard,
});

function KES(n: number) {
  return `KES ${Number(n ?? 0).toLocaleString()}`;
}

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
    title: "Trip Management",
    icon: CalendarClock,
    actions: [
      { label: "Add Trip", to: "/trips/new", icon: CalendarClock },
      { label: "All Trips", to: "/trips", icon: CalendarClock },
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
  status === "paid" || status === "collected" || status === "arrived"
    ? "default"
    : status === "cancelled"
      ? "destructive"
      : "secondary";

type RecentBooking = {
  id: string;
  booking_ref: string | null;
  passenger_name: string;
  seat_number: string;
  fare_amount: number;
  payment_status: string;
  destination: string | null;
};

type UpcomingTrip = {
  id: string;
  bus_plate: string | null;
  departure_time: string;
  total_seats: number;
  seats_booked: number;
  status: string;
  destination: string | null;
};

type RecentParcel = {
  id: string;
  tracking_code: string;
  sender_name: string;
  destination_name: string | null;
  fare_amount: number;
  status: string;
};

function Dashboard() {
  const { profile, isAdmin } = useStaffSession();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    bookingsToday: 0,
    revenueToday: 0,
    availableBuses: 0,
    activeTrips: 0,
    parcelsToday: 0,
    pendingPayments: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<UpcomingTrip[]>([]);
  const [recentParcels, setRecentParcels] = useState<RecentParcel[]>([]);
  const [revenueSeries, setRevenueSeries] = useState<{ day: string; tickets: number; parcels: number }[]>([]);
  const [staffCount, setStaffCount] = useState(0);

  useEffect(() => {
    if (!profile) return;
    let active = true;

    (async () => {
      setLoading(true);
      const branchFilter = !isAdmin && profile.branch_id ? profile.branch_id : null;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Bookings today + revenue today + pending payments
      let bookingsQuery = supabase.from("bookings").select("id, fare_amount, payment_status, created_at, branch_id");
      if (branchFilter) bookingsQuery = bookingsQuery.eq("branch_id", branchFilter);
      const { data: allBookings } = await bookingsQuery;

      const bookingsTodayList = (allBookings ?? []).filter((b: any) => new Date(b.created_at) >= todayStart);
      const revenueToday = bookingsTodayList
        .filter((b: any) => b.payment_status === "paid")
        .reduce((sum: number, b: any) => sum + Number(b.fare_amount ?? 0), 0);
      const pendingPayments = (allBookings ?? []).filter((b: any) => b.payment_status === "pending").length;

      // Trips (active + available buses)
      let tripsQuery = supabase
        .from("trips")
        .select("id, bus_plate, departure_time, total_seats, seats_booked, status, branch_id, routes(destination)")
        .order("departure_time", { ascending: true });
      if (branchFilter) tripsQuery = tripsQuery.eq("branch_id", branchFilter);
      const { data: allTrips } = await tripsQuery;

      const activeTrips = (allTrips ?? []).filter((t: any) => t.status === "scheduled" || t.status === "boarding").length;
      const upcoming = (allTrips ?? [])
        .filter((t: any) => new Date(t.departure_time) >= new Date())
        .slice(0, 4)
        .map((t: any) => ({
          id: t.id,
          bus_plate: t.bus_plate,
          departure_time: t.departure_time,
          total_seats: t.total_seats,
          seats_booked: t.seats_booked,
          status: t.status ?? "scheduled",
          destination: t.routes?.destination ?? null,
        }));

      // Parcels today
      let parcelsQuery = supabase.from("parcels").select("id, tracking_code, sender_name, fare_amount, status, created_at, origin_branch_id, destination_branch_id, branches:destination_branch_id(name)");
      if (branchFilter) parcelsQuery = parcelsQuery.eq("origin_branch_id", branchFilter);
      const { data: allParcels } = await parcelsQuery;
      const parcelsToday = (allParcels ?? []).filter((p: any) => new Date(p.created_at) >= todayStart).length;
      const recentParcelsList = (allParcels ?? [])
        .slice()
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4)
        .map((p: any) => ({
          id: p.id,
          tracking_code: p.tracking_code,
          sender_name: p.sender_name,
          destination_name: p.branches?.name ?? null,
          fare_amount: p.fare_amount,
          status: p.status,
        }));

      // Recent bookings for table
      let recentBookingsQuery = supabase
        .from("bookings")
        .select("id, booking_ref, passenger_name, seat_number, fare_amount, payment_status, created_at, trips(routes(destination))")
        .order("created_at", { ascending: false })
        .limit(5);
      if (branchFilter) recentBookingsQuery = recentBookingsQuery.eq("branch_id", branchFilter);
      const { data: recentBookingsData } = await recentBookingsQuery;

      // 7-day revenue trend
      const days: { day: string; tickets: number; parcels: number }[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const label = d.toLocaleDateString(undefined, { weekday: "short" });
        const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);

        const ticketRev = (allBookings ?? [])
          .filter((b: any) => b.payment_status === "paid" && new Date(b.created_at) >= dayStart && new Date(b.created_at) <= dayEnd)
          .reduce((sum: number, b: any) => sum + Number(b.fare_amount ?? 0), 0);
        const parcelRev = (allParcels ?? [])
          .filter((p: any) => new Date(p.created_at) >= dayStart && new Date(p.created_at) <= dayEnd)
          .reduce((sum: number, p: any) => sum + Number(p.fare_amount ?? 0), 0);

        days.push({ day: label, tickets: ticketRev, parcels: parcelRev });
      }

      // Staff count (admin only, informational)
      let staffTotal = 0;
      if (isAdmin) {
        const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true });
        staffTotal = count ?? 0;
      }

      if (!active) return;
      setStats({
        bookingsToday: bookingsTodayList.length,
        revenueToday,
        availableBuses: (allTrips ?? []).filter((t: any) => t.status === "scheduled").length,
        activeTrips,
        parcelsToday,
        pendingPayments,
      });
      setUpcomingTrips(upcoming);
      setRecentParcels(recentParcelsList);
      setRevenueSeries(days);
      setStaffCount(staffTotal);
      setRecentBookings(
        (recentBookingsData ?? []).map((b: any) => ({
          id: b.id,
          booking_ref: b.booking_ref,
          passenger_name: b.passenger_name,
          seat_number: b.seat_number,
          fare_amount: b.fare_amount,
          payment_status: b.payment_status,
          destination: b.trips?.routes?.destination ?? null,
        }))
      );
      setLoading(false);
    })();

    return () => { active = false; };
  }, [profile, isAdmin]);

  const statCards = [
    { label: "Bookings Today", value: stats.bookingsToday, icon: Ticket },
    { label: "Revenue Today", value: KES(stats.revenueToday), icon: Banknote },
    { label: "Available Buses", value: stats.availableBuses, icon: Bus },
    { label: "Active Trips", value: stats.activeTrips, icon: CalendarClock },
    { label: "Parcels Today", value: stats.parcelsToday, icon: Package },
    { label: "Pending Payments", value: stats.pendingPayments, icon: CreditCard },
  ];

  // Low-seat alert: trips departing soon with fewer than 15% seats left
  const lowSeatAlerts = upcomingTrips.filter(
    (t) => t.total_seats > 0 && (t.total_seats - t.seats_booked) / t.total_seats < 0.15
  );

  return (
    <Page
      title="Operations Dashboard"
      description={isAdmin ? "Live snapshot across all Transline Classic branches." : "Live snapshot for your branch."}
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label} style={{ boxShadow: "var(--shadow-card)" }}>
            <CardContent className="flex items-start justify-between gap-4 pt-6">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {loading ? "…" : stat.value}
                </p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <stat.icon className="size-5" />
              </span>
            </CardContent>
          </Card>
        ))}
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
                <Area type="monotone" dataKey="tickets" stroke="var(--color-primary)" strokeWidth={2} fill="url(#tickets)" name="Tickets" />
                <Area type="monotone" dataKey="parcels" stroke="var(--color-primary-glow)" strokeWidth={2} fill="url(#parcelsFill)" name="Parcels" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Notifications & alerts">
          {lowSeatAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No alerts right now.</p>
          ) : (
            <ul className="space-y-3">
              {lowSeatAlerts.map((t) => (
                <li key={t.id} className="rounded-xl border border-border p-3">
                  <p className="text-sm font-medium">Low seat availability</p>
                  <p className="text-xs text-muted-foreground">
                    {t.destination ?? "Trip"} — only {t.total_seats - t.seats_booked} seats left
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="size-3" /> {new Date(t.departure_time).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
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
                  <TableHead>Destination</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead className="text-right">Fare</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.booking_ref ?? "—"}</TableCell>
                    <TableCell className="font-medium">{b.passenger_name}</TableCell>
                    <TableCell className="whitespace-nowrap">{b.destination ?? "—"}</TableCell>
                    <TableCell>{b.seat_number}</TableCell>
                    <TableCell className="text-right">{KES(b.fare_amount)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(b.payment_status)} className="capitalize">{b.payment_status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {recentBookings.length === 0 && !loading && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No bookings yet.</TableCell></TableRow>
                )}
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
            {upcomingTrips.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.destination ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.bus_plate ?? "no bus"} · departs {new Date(t.departure_time).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="capitalize">{t.status}</Badge>
                  <p className="mt-1 text-xs text-muted-foreground">{t.seats_booked}/{t.total_seats} seats</p>
                </div>
              </li>
            ))}
            {upcomingTrips.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground">No upcoming trips.</p>
            )}
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
            {recentParcels.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs">{p.tracking_code}</p>
                  <p className="truncate text-sm">→ {p.destination_name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{p.sender_name}</p>
                </div>
                <div className="text-right">
                  <Badge variant={statusVariant(p.status)} className="capitalize">{p.status}</Badge>
                  <p className="mt-1 text-xs text-muted-foreground">{KES(p.fare_amount)}</p>
                </div>
              </li>
            ))}
            {recentParcels.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground">No parcels yet.</p>
            )}
          </ul>
        </SectionCard>
      </div>

      {isAdmin && (
        <SectionCard
          title="Team on duty"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/staff">
                <Users className="mr-1 size-4" /> Staff
              </Link>
            </Button>
          }
        >
          <p className="text-sm text-muted-foreground">
            {staffCount} staff account{staffCount === 1 ? "" : "s"} configured across all branches.
          </p>
        </SectionCard>
      )}
    </Page>
  );
}              
                
