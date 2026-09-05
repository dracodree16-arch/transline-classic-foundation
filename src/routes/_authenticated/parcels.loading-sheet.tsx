import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Page, SectionCard } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";

const statuses = ["received", "loaded", "in_transit", "ready_for_collection", "delivered"];
export const Route = createFileRoute("/_authenticated/parcels/loading-sheet")({
  head: () => ({
    meta: [
      { title: "Loading Sheet | Transline Classic TMS" },
      { name: "description", content: "Parcels loaded per departing bus." },
    ],
  }),
  component: ParcelsLoadingSheetPage,
});

function ParcelsLoadingSheetPage() {
  const queryClient = useQueryClient();
  const parcels = useQuery({
    queryKey: ["loading-sheet-parcels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parcels")
        .select(
          "id, tracking_code, sender_name, receiver_name, weight_kg, fare_amount, status, origin:origin_branch_id(name), destination:destination_branch_id(name)",
        )
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("parcels").update({ status }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["loading-sheet-parcels"] }),
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Page title="Loading Sheet" description="Parcels loaded per departing bus.">
      <SectionCard title="Parcels">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Charge</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(parcels.data ?? []).map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.tracking_code}</TableCell>
                  <TableCell className="font-medium">{row.sender_name}</TableCell>
                  <TableCell>{row.receiver_name}</TableCell>
                  <TableCell>{row.origin?.name ?? "—"}</TableCell>
                  <TableCell>{row.destination?.name ?? "—"}</TableCell>
                  <TableCell>
                    {row.weight_kg ?? "—"} {row.weight_kg != null && "kg"}
                  </TableCell>
                  <TableCell>KES {Number(row.fare_amount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Select
                      value={row.status}
                      onValueChange={(status) => update.mutate({ id: row.id, status })}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replaceAll("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {parcels.isLoading && (
            <p className="p-4 text-sm text-muted-foreground">Loading parcels…</p>
          )}
          {!parcels.isLoading && parcels.data?.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No parcels found.</p>
          )}
        </div>
      </SectionCard>
    </Page>
  );
}
