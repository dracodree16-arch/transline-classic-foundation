import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Page, SectionCard } from "@/components/page-shell";
import { QueryState } from "@/components/query-state";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/fleet/")({
  head: () => ({
    meta: [
      { title: "Fleet — All Buses | Transline Classic TMS" },
      { name: "description", content: "Every bus in the Transline Classic fleet." },
      { property: "og:title", content: "Fleet — All Buses | Transline Classic TMS" },
      { property: "og:description", content: "Every bus in the Transline Classic fleet." },
    ],
  }),
  component: FleetIndexPage,
});

function FleetIndexPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["buses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("buses")
        .select("id, plate_number, model, capacity, status, branches(name)")
        .order("plate_number");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const rows = data ?? [];

  return (
    <Page title="Fleet — All Buses" description="Every bus in the Transline Classic fleet.">
      <SectionCard
        title="Fleet"
        action={
          <Button asChild size="sm">
            <Link to="/fleet/new"><Plus className="mr-1 size-4" /> Add Bus</Link>
          </Button>
        }
      >
        <QueryState isLoading={isLoading} error={error} isEmpty={rows.length === 0} emptyMessage="No buses registered yet.">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate</TableHead><TableHead>Model</TableHead><TableHead>Capacity</TableHead>
                  <TableHead>Branch</TableHead><TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.plate_number}</TableCell>
                    <TableCell className="font-medium">{row.model ?? "—"}</TableCell>
                    <TableCell>{row.capacity}</TableCell>
                    <TableCell>{row.branches?.name ?? "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{row.status}</Badge></TableCell>
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
