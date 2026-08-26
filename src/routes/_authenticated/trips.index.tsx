import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Page, SectionCard } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { useStaffSession } from "@/lib/session";

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

function statusVariant(status: string | null): "default" | "secondary" | "outline" {
  if (status === "boarding") return "default";
  if (status === "completed" || status === "cancelled") return "outline";
  return "secondary";
}

function TripsIndexPage() {
  const { isAdmin } = useStaffSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select(
          "id, departure_time, bus_plate, total_seats, seats_booked, status, driver_name, routes(destination, branches(name))",
        )
        .order("departure_time", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []).map((t: any) => ({
        id: t.id,
        route:
          (t.routes?.branches?.name ?? "—") + " → " + (t.routes?.destination ?? "—"),
        bus: t.bus_plate ?? "—",
        departure: t.departure_time ? new Date(t.departure_time).toLocaleString() : "—",
        seats: t.total_seats,
        booked: t.seats_booked,
        status: (t.status ?? "scheduled") as string,
      }));
    },
  });

  return (
    <Page
      title="All Trips"
      description="Scheduled, boarding and completed trips."
      actions={
        isAdmin ? (
          <Button asChild size="sm">
            <Link to="/trips/new">
              <Plus className="mr-1 size-4" /> Create Trip
            </Link>
          </Button>
        ) : undefined
      }
    >
      <SectionCard title="Trips">
        {isLoading && <p className="text-sm text-muted-foreground">Loading trips…</p>}
        {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}
        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No trips scheduled yet. {isAdmin ? "Use “Create Trip” to add one." : ""}
          </p>
        )}
        {data && data.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Booked</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      <Link
                        to="/trips/$id"
                        params={{ id: row.id }}
                        className="hover:underline"
                      >
                        {row.route}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.bus}</TableCell>
                    <TableCell>{row.departure}</TableCell>
                    <TableCell>{row.seats}</TableCell>
                    <TableCell>{row.booked}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(row.status)} className="capitalize">
                        {row.status}
                      </Badge>
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
