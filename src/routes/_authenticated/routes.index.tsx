import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Page, SectionCard } from "@/components/page-shell";
import { QueryState } from "@/components/query-state";
import { KES } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/routes/")({
  head: () => ({
    meta: [
      { title: "All Routes | Transline Classic TMS" },
      { name: "description", content: "Routes served across the western Kenya network." },
      { property: "og:title", content: "All Routes | Transline Classic TMS" },
      { property: "og:description", content: "Routes served across the western Kenya network." },
    ],
  }),
  component: RoutesIndexPage,
});

function RoutesIndexPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routes")
        .select("id, destination, base_fare, created_at, branches(name, town)")
        .order("destination");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const rows = data ?? [];

  return (
    <Page title="All Routes" description="Routes served across the western Kenya network.">
      <SectionCard
        title="Routes"
        action={
          <Button asChild size="sm">
            <Link to="/routes/new"><Plus className="mr-1 size-4" /> Add Route</Link>
          </Button>
        }
      >
        <QueryState isLoading={isLoading} error={error} isEmpty={rows.length === 0} emptyMessage="No routes configured yet.">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origin branch</TableHead><TableHead>Destination</TableHead><TableHead>Base fare</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.branches?.name ?? "—"}</TableCell>
                    <TableCell>{row.destination}</TableCell>
                    <TableCell>{KES(row.base_fare)}</TableCell>
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
