import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Page, SectionCard } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { useStaffSession } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/bookings/dispatch")({
  head: () => ({
    meta: [
      { title: "Bus Dispatch | Transline Classic TMS" },
      { name: "description", content: "Confirm departures and release buses from the stage." },
    ],
  }),
  component: BookingsDispatchPage,
});

const STATUS_OPTIONS = ["scheduled", "boarding", "departed", "cancelled"];

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "secondary",
  boarding: "default",
  departed: "outline",
  cancelled: "destructive",
};

type DispatchRow = {
  id: string;
  bus_plate: string | null;
  departure_time: string;
  total_seats: number;
  seats_booked: number;
  status: string;
  destination: string | null;
  origin: string | null;
  branch_name: string | null;
};

function BookingsDispatchPage() {
  const { profile, isAdmin } = useStaffSession();

  const [rows, setRows] = useState<DispatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    let query = supabase
      .from("trips")
      .select("id, bus_plate, departure_time, total_seats, seats_booked, status, routes(destination, branches(name, town))")
      .order("departure_time", { ascending: true });

    if (!isAdmin && profile.branch_id) {
      query = query.eq("branch_id", profile.branch_id);
    }

    const { data, error: err } = await query;
    if (err) {
      setError(err.message);
      setRows([]);
    } else {
      setRows(
        (data ?? []).map((t: any) => ({
          id: t.id,
          bus_plate: t.bus_plate,
          departure_time: t.departure_time,
          total_seats: t.total_seats,
          seats_booked: t.seats_booked,
          status: t.status ?? "scheduled",
          destination: t.routes?.destination ?? null,
          origin: t.routes?.branches?.town ?? t.routes?.branches?.name ?? null,
          branch_name: t.routes?.branches?.name ?? null,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [profile, isAdmin]);

  async function updateStatus(tripId: string, status: string) {
    setUpdatingId(tripId);
    const { error: err } = await supabase.from("trips").update({ status }).eq("id", tripId);
    if (err) {
      toast.error("Could not update status: " + err.message);
    } else {
      toast.success("Trip status updated");
      setRows((prev) => prev.map((r) => (r.id === tripId ? { ...r, status } : r)));
    }
    setUpdatingId(null);
  }

  return (
    <Page title="Bus Dispatch" description="Confirm departures and release buses from the stage.">
      <SectionCard title="Trips">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load: {error}</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No trips found.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Booked</TableHead>
                  {isAdmin && <TableHead>Branch</TableHead>}
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {(row.origin ?? "—") + " → " + (row.destination ?? "—")}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.bus_plate ?? "—"}</TableCell>
                    <TableCell>{new Date(row.departure_time).toLocaleString()}</TableCell>
                    <TableCell>{row.total_seats}</TableCell>
                    <TableCell>{row.seats_booked}</TableCell>
                    {isAdmin && <TableCell>{row.branch_name ?? "—"}</TableCell>}
                    <TableCell>
                      <Select
                        value={row.status}
                        onValueChange={(v) => updateStatus(row.id, v)}
                        disabled={updatingId === row.id}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue>
                            <Badge variant={statusVariant[row.status] ?? "secondary"} className="capitalize">
                              {row.status}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
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
