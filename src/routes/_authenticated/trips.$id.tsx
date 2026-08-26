import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Page, SectionCard } from "@/components/page-shell";
import { SeatMap } from "@/components/seat-map";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/trips/$id")({
  head: () => ({
    meta: [
      { title: "Trip Details | Transline Classic TMS" },
      { name: "description", content: "Seat occupancy, manifest and dispatch status." },
      { property: "og:title", content: "Trip Details | Transline Classic TMS" },
      { property: "og:description", content: "Seat occupancy, manifest and dispatch status." },
    ],
  }),
  component: TripsIdPage,
});

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function TripsIdPage() {
  const { id } = Route.useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["trip", id],
    queryFn: async () => {
      const { data: trip, error: tripErr } = await supabase
        .from("trips")
        .select(
          "id, departure_time, bus_plate, total_seats, seats_booked, status, dispatch_status, driver_name, driver_phone, routes(destination, base_fare, branches(name))",
        )
        .eq("id", id)
        .maybeSingle();
      if (tripErr) throw new Error(tripErr.message);
      if (!trip) throw new Error("Trip not found.");

      const { data: seats, error: seatErr } = await supabase.rpc("get_taken_seats", {
        _trip_id: id,
      });
      if (seatErr) throw new Error(seatErr.message);

      return {
        trip: trip as any,
        taken: new Set((seats ?? []).map((s: { seat_number: string }) => s.seat_number)),
      };
    },
  });

  return (
    <Page
      title="Trip Details"
      description="Seat occupancy, manifest and dispatch status."
      actions={
        <Button asChild size="sm" variant="outline">
          <Link to="/bookings/new">New booking</Link>
        </Button>
      }
    >
      {isLoading && <p className="text-sm text-muted-foreground">Loading trip…</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      {data && (
        <>
          <SectionCard title="Record">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Reference" value={<span className="font-mono text-sm">{data.trip.id.slice(0, 8)}</span>} />
              <Field
                label="Route"
                value={(data.trip.routes?.branches?.name ?? "—") + " → " + (data.trip.routes?.destination ?? "—")}
              />
              <Field label="Bus" value={data.trip.bus_plate ?? "—"} />
              <Field
                label="Departure"
                value={data.trip.departure_time ? new Date(data.trip.departure_time).toLocaleString() : "—"}
              />
              <Field label="Fare" value={`KES ${data.trip.routes?.base_fare ?? "—"}`} />
              <Field
                label="Seats"
                value={`${data.taken.size} / ${data.trip.total_seats} booked`}
              />
              <Field label="Driver" value={data.trip.driver_name ?? "—"} />
              <Field label="Driver phone" value={data.trip.driver_phone ?? "—"} />
              <Field
                label="Status"
                value={
                  <Badge variant="secondary" className="capitalize">
                    {data.trip.status ?? "scheduled"}
                  </Badge>
                }
              />
            </div>
          </SectionCard>

          <SectionCard title="Seat occupancy">
            <SeatMap
              capacity={data.trip.total_seats}
              taken={data.taken as Set<string>}
              plate={data.trip.bus_plate}
            />
          </SectionCard>
        </>
      )}
    </Page>
  );
}
