import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Page, SectionCard } from "@/components/page-shell";
import { QueryState } from "@/components/query-state";
import { dateTime } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/trips/")({
  head: () => ({ meta: [{ title: "All Trips | Transline Classic TMS" }] }),
  component: TripsIndexPage,
});

function TripsIndexPage() {
  const [showDeleted, setShowDeleted] = useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["trips", "all", showDeleted],
    queryFn: async () => {
      let query = supabase.from("trips").select("id, departure_time, bus_plate, total_seats, seats_booked, status, dispatch_status, driver_name, deleted_at, branches(name), routes(destination)").order("departure_time", { ascending: false }).limit(300);
      query = showDeleted ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
  const archive = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.rpc(showDeleted ? "restore_trip" : "archive_trip", { _trip_id: id }); if (error) throw new Error(error.message); },
    onSuccess: () => { toast.success(showDeleted ? "Trip restored" : "Trip archived"); queryClient.invalidateQueries({ queryKey: ["trips"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const rows = data ?? [];
  return <Page title="All Trips" description="Schedule, archive and restore branch trips.">
    <SectionCard title={showDeleted ? "Deleted trips" : "Active trips"} action={<div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setShowDeleted(!showDeleted)}>{showDeleted ? <RotateCcw className="mr-1 size-4" /> : <Archive className="mr-1 size-4" />}{showDeleted ? "Active trips" : "Deleted trips"}</Button>{!showDeleted && <Button asChild size="sm"><Link to="/trips/new"><Plus className="mr-1 size-4" /> Add trip</Link></Button>}</div>}>
      <QueryState isLoading={isLoading} error={error} isEmpty={!rows.length} emptyMessage={showDeleted ? "No deleted trips." : "No trips scheduled yet."}>
        <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Route</TableHead><TableHead>Bus</TableHead><TableHead>Driver</TableHead><TableHead>Departure</TableHead><TableHead>Seats</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{rows.map((row: any) => <TableRow key={row.id}><TableCell className="font-medium">{(row.branches?.name ?? "—") + " → " + (row.routes?.destination ?? "—")}</TableCell><TableCell className="font-mono text-xs">{row.bus_plate ?? "—"}</TableCell><TableCell>{row.driver_name ?? "—"}</TableCell><TableCell className="whitespace-nowrap">{dateTime(row.departure_time)}</TableCell><TableCell>{row.seats_booked}/{row.total_seats}</TableCell><TableCell><Badge variant="secondary">{row.dispatch_status ?? row.status}</Badge></TableCell><TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => archive.mutate(row.id)} disabled={archive.isPending}>{showDeleted ? "Restore" : "Archive"}</Button></TableCell></TableRow>)}</TableBody></Table></div>
      </QueryState>
    </SectionCard>
  </Page>;
}
