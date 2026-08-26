import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer } from "lucide-react";
import { Page, SectionCard } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { useStaffSession } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/bookings/manifest")({
  head: () => ({
    meta: [
      { title: "Passenger Manifest | Transline Classic TMS" },
      { name: "description", content: "Printable boarding manifest per trip." },
    ],
  }),
  component: BookingsManifestPage,
});

function KES(n: number) {
  return `KES ${Number(n ?? 0).toLocaleString()}`;
}

type TripOption = {
  id: string;
  departure_time: string;
  bus_plate: string | null;
  destination: string | null;
  origin: string | null;
};

type ManifestRow = {
  id: string;
  booking_ref: string | null;
  passenger_name: string;
  passenger_phone: string;
  seat_number: string;
  fare_amount: number;
  payment_status: string;
  branch_name: string | null;
};

function BookingsManifestPage() {
  const { profile, isAdmin } = useStaffSession();

  const [trips, setTrips] = useState<TripOption[]>([]);
  const [tripId, setTripId] = useState<string>("");
  const [rows, setRows] = useState<ManifestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    (async () => {
      let query = supabase
        .from("trips")
        .select("id, departure_time, bus_plate, routes(destination, branches(name, town))")
        .order("departure_time", { ascending: false })
        .limit(100);
      if (!isAdmin && profile.branch_id) {
        query = query.eq("branch_id", profile.branch_id);
      }
      const { data, error: err } = await query;
      if (!active) return;
      if (err) {
        setError(err.message);
      } else {
        setTrips(
          (data ?? []).map((t: any) => ({
            id: t.id,
            departure_time: t.departure_time,
            bus_plate: t.bus_plate,
            destination: t.routes?.destination ?? null,
            origin: t.routes?.branches?.town ?? t.routes?.branches?.name ?? null,
          }))
        );
      }
    })();
    return () => { active = false; };
  }, [profile, isAdmin]);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      let query = supabase
        .from("bookings")
        .select("id, booking_ref, passenger_name, passenger_phone, seat_number, fare_amount, payment_status, branches(name)")
        .order("created_at", { ascending: false })
        .limit(200);

      if (!isAdmin && profile.branch_id) {
        query = query.eq("branch_id", profile.branch_id);
      }
      if (tripId) {
        query = query.eq("trip_id", tripId);
      }

      const { data, error: err } = await query;
      if (!active) return;
      if (err) {
        setError(err.message);
        setRows([]);
      } else {
        setRows(
          (data ?? []).map((r: any) => ({
            id: r.id,
            booking_ref: r.booking_ref,
            passenger_name: r.passenger_name,
            passenger_phone: r.passenger_phone,
            seat_number: r.seat_number,
            fare_amount: r.fare_amount,
            payment_status: r.payment_status,
            branch_name: r.branches?.name ?? null,
          }))
        );
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [profile, isAdmin, tripId]);

  return (
    <Page title="Passenger Manifest" description="Printable boarding manifest per trip.">
      <SectionCard title="Filter">
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <Select value={tripId} onValueChange={setTripId}>
            <SelectTrigger className="w-full sm:w-96">
              <SelectValue placeholder="All trips" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All trips</SelectItem>
              {trips.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {(t.origin ?? "—") + " → " + (t.destination ?? "—")} · {new Date(t.departure_time).toLocaleString()} · {t.bus_plate ?? "no bus"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 size-4" /> Print manifest
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Bookings">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load: {error}</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead>Branch</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.booking_ref ?? "—"}</TableCell>
                    <TableCell className="font-medium">{row.passenger_name}</TableCell>
                    <TableCell>{row.passenger_phone}</TableCell>
                    <TableCell>{row.seat_number}</TableCell>
                    <TableCell>{KES(row.fare_amount)}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{row.payment_status}</Badge></TableCell>
                    {isAdmin && <TableCell>{row.branch_name ?? "—"}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
    </Page>
  );
}
