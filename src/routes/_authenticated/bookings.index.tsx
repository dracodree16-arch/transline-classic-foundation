import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Page, SectionCard } from "@/components/page-shell";
import { QueryState } from "@/components/query-state";
import { KES } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/bookings/")({ head: () => ({ meta: [{ title: "All Bookings | Transline Classic TMS" }] }), component: BookingsIndexPage });
function BookingsIndexPage() {
  const [showDeleted, setShowDeleted] = useState(false); const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["bookings", "all", showDeleted], queryFn: async () => { let q = supabase.from("bookings").select("id, booking_ref, passenger_name, passenger_phone, seat_number, fare_amount, payment_status, payment_method, created_at, deleted_at, branches(name), trips(departure_time, routes(destination))").order("created_at", { ascending: false }).limit(500); q = showDeleted ? q.not("deleted_at", "is", null) : q.is("deleted_at", null); const { data, error } = await q; if (error) throw new Error(error.message); return data ?? []; } });
  const change = useMutation({ mutationFn: async (id: string) => { const { error } = await supabase.rpc(showDeleted ? "restore_booking" : "archive_booking", showDeleted ? { _booking_id: id } : { _booking_id: id, _reason: "Archived by staff" }); if (error) throw new Error(error.message); }, onSuccess: () => { toast.success(showDeleted ? "Booking restored" : "Booking archived"); queryClient.invalidateQueries({ queryKey: ["bookings"] }); }, onError: (e: Error) => toast.error(e.message) });
  const rows = data ?? [];
  return <Page title="All Bookings" description="Issue, archive and restore tickets."><SectionCard title={showDeleted ? "Deleted bookings" : "Active bookings"} action={<Button variant="outline" size="sm" onClick={() => setShowDeleted(!showDeleted)}>{showDeleted ? <RotateCcw className="mr-1 size-4" /> : <Archive className="mr-1 size-4" />}{showDeleted ? "Active bookings" : "Deleted bookings"}</Button>}><QueryState isLoading={isLoading} error={error} isEmpty={!rows.length} emptyMessage={showDeleted ? "No deleted bookings." : "No bookings recorded yet."}><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Ref</TableHead><TableHead>Passenger</TableHead><TableHead>Destination</TableHead><TableHead>Seat</TableHead><TableHead>Fare</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader><TableBody>{rows.map((row: any) => <TableRow key={row.id}><TableCell className="font-mono text-xs">{row.booking_ref ?? "—"}</TableCell><TableCell className="font-medium">{row.passenger_name}<div className="text-xs text-muted-foreground">{row.passenger_phone}</div></TableCell><TableCell>{row.trips?.routes?.destination ?? "—"}</TableCell><TableCell>{row.seat_number ?? "—"}</TableCell><TableCell>{KES(row.fare_amount)}</TableCell><TableCell><Badge variant={row.payment_status === "paid" ? "default" : "secondary"}>{row.payment_status ?? "pending"}</Badge></TableCell><TableCell><Button size="sm" variant="outline" onClick={() => change.mutate(row.id)} disabled={change.isPending}>{showDeleted ? "Restore" : "Archive"}</Button></TableCell></TableRow>)}</TableBody></Table></div></QueryState></SectionCard></Page>;
}
