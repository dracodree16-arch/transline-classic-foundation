import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Page, SectionCard } from "@/components/page-shell";
import { QueryState } from "@/components/query-state";
import { dateTime } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/trips/")({
  head: () => ({
    meta: [
      { title: "All Trips | Transline Classic TMS" },
      { name: "description", content: "Scheduled, boarding and completed trips." },
      { property: "og:title", content: "All Trips | Transline Classic TMS" },
      { property: "og:description", content: "Scheduled, boarding and completed trips." },
    ],
  }),
  component: TripsIndexPage,
});

function TripsIndexPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["trips", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select(
          "id, departure_time, bus_plate, total_seats, seats_booked, status, dispatch_status, driver_name, branches(name), routes(destination)",
        )
        .order("departure_time", { ascending: false })
        .limit(300);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const rows = data ?? [];

  return (
    <Page title="All Trips" description="Scheduled, boarding and completed trips.">
      <SectionCard title="Trips">
        <QueryState isLoading={isLoading} error={error} isEmpty={rows.length === 0} emptyMessage="No trips scheduled yet.">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead><TableHead>Bus</TableHead><TableHead>Driver</TableHead>
                  <TableHead>Departure</TableHead><TableHead>Seats</TableHead><TableHead>Booked</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {(row.branches?.name ?? "—") + " → " + (row.routes?.destination ?? "—")}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.bus_plate ?? "—"}</TableCell>
                    <TableCell>{row.driver_name ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">{dateTime(row.departure_time)}</TableCell>
                    <TableCell>{row.total_seats}</TableCell>
                    <TableCell>{row.seats_booked}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.dispatch_status ?? row.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </QueryState>
      </SectionCard>
    </Page>
  );
}
