import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Page, SectionCard } from "@/components/page-shell";
import { QueryState } from "@/components/query-state";
import { KES } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/bookings/")({
  head: () => ({
    meta: [
      { title: "All Bookings | Transline Classic TMS" },
      { name: "description", content: "Every ticket sold across Transline Classic branches." },
      { property: "og:title", content: "All Bookings | Transline Classic TMS" },
      { property: "og:description", content: "Every ticket sold across Transline Classic branches." },
    ],
  }),
  component: BookingsIndexPage,
});

function BookingsIndexPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["bookings", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "id, booking_ref, passenger_name, passenger_phone, seat_number, fare_amount, payment_status, payment_method, created_at, branches(name), trips(departure_time, routes(destination))",
        )
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const rows = data ?? [];

  return (
    <Page title="All Bookings" description="Every ticket sold across Transline Classic branches.">
      <SectionCard title="Bookings">
        <QueryState isLoading={isLoading} error={error} isEmpty={rows.length === 0} emptyMessage="No bookings recorded yet.">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead><TableHead>Passenger</TableHead><TableHead>Phone</TableHead>
                  <TableHead>Destination</TableHead><TableHead>Seat</TableHead><TableHead>Fare</TableHead>
                  <TableHead>Method</TableHead><TableHead>Status</TableHead><TableHead>Branch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.booking_ref ?? "—"}</TableCell>
                    <TableCell className="font-medium">{row.passenger_name}</TableCell>
                    <TableCell>{row.passenger_phone}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.trips?.routes?.destination ?? "—"}</TableCell>
                    <TableCell>{row.seat_number ?? "—"}</TableCell>
                    <TableCell>{KES(row.fare_amount)}</TableCell>
                    <TableCell className="capitalize">{row.payment_method ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={row.payment_status === "paid" ? "default" : "secondary"}>
                        {row.payment_status ?? "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.branches?.name ?? "—"}</TableCell>
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
