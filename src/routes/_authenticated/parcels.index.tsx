import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Page, SectionCard } from "@/components/page-shell";
import { QueryState } from "@/components/query-state";
import { KES } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/parcels/")({
  head: () => ({
    meta: [
      { title: "All Parcels | Transline Classic TMS" },
      { name: "description", content: "Parcels booked, in transit and delivered." },
      { property: "og:title", content: "All Parcels | Transline Classic TMS" },
      { property: "og:description", content: "Parcels booked, in transit and delivered." },
    ],
  }),
  component: ParcelsIndexPage,
});

function ParcelsIndexPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["parcels", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parcels")
        .select(
          "id, tracking_code, sender_name, receiver_name, weight_kg, fare_amount, status, payment_status, created_at, origin:origin_branch_id(name), destination:destination_branch_id(name)",
        )
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const rows = data ?? [];

  return (
    <Page title="All Parcels" description="Parcels booked, in transit and delivered.">
      <SectionCard title="Parcels">
        <QueryState isLoading={isLoading} error={error} isEmpty={rows.length === 0} emptyMessage="No parcels booked yet.">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead><TableHead>Sender</TableHead><TableHead>Receiver</TableHead>
                  <TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Weight</TableHead>
                  <TableHead>Charge</TableHead><TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.tracking_code}</TableCell>
                    <TableCell className="font-medium">{row.sender_name}</TableCell>
                    <TableCell>{row.receiver_name}</TableCell>
                    <TableCell>{row.origin?.name ?? "—"}</TableCell>
                    <TableCell>{row.destination?.name ?? "—"}</TableCell>
                    <TableCell>{row.weight_kg != null ? `${row.weight_kg} kg` : "—"}</TableCell>
                    <TableCell>{KES(row.fare_amount)}</TableCell>
                    <TableCell><Badge variant="secondary">{row.status ?? "booked"}</Badge></TableCell>
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
