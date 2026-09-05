import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Page, SectionCard } from "@/components/page-shell";
import { QueryState } from "@/components/query-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { createStation, listStations, setStationActive } from "@/lib/stations.functions";

export const Route = createFileRoute("/_authenticated/admin/stations/")({
  head: () => ({
    meta: [
      { title: "Stations | Transline Classic TMS" },
      { name: "description", content: "Add and manage Transline Classic booking stations." },
      { property: "og:title", content: "Stations | Transline Classic TMS" },
      { property: "og:description", content: "Add and manage Transline Classic booking stations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StationsPage,
});

function StationsPage() {
  const queryClient = useQueryClient();
  const fetchStations = useServerFn(listStations);
  const addStation = useServerFn(createStation);
  const toggleStation = useServerFn(setStationActive);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [town, setTown] = useState("");
  const [branchId, setBranchId] = useState("");

  const stations = useQuery({ queryKey: ["stations"], queryFn: () => fetchStations() });
  const branches = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("branches").select("id, name, town").order("name");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: () =>
      addStation({
        data: {
          name: name.trim(),
          code: code.trim(),
          town: town.trim() || undefined,
          branch_id: branchId || null,
        },
      }),
    onSuccess: async () => {
      toast.success("Station added");
      setName("");
      setCode("");
      setTown("");
      setBranchId("");
      await queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: (v: { id: string; is_active: boolean }) => toggleStation({ data: v }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = stations.data ?? [];

  return (
    <Page title="Stations" description="Booking stations across the network. Clerks can be assigned to a station.">
      <SectionCard title="Add a station">
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim().length < 2 || code.trim().length < 2) {
              toast.error("Enter a station name and a short code.");
              return;
            }
            create.mutate();
          }}
        >
          <div className="space-y-2">
            <Label>Station name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kisii Main Station" />
          </div>
          <div className="space-y-2">
            <Label>Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="KSI-01" />
          </div>
          <div className="space-y-2">
            <Label>Town</Label>
            <Input value={town} onChange={(e) => setTown(e.target.value)} placeholder="Kisii" />
          </div>
          <div className="space-y-2">
            <Label>Branch</Label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {(branches.data ?? []).map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Saving…" : "Add station"}
            </Button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="All stations">
        <QueryState
          isLoading={stations.isLoading}
          error={stations.error}
          isEmpty={rows.length === 0}
          emptyMessage="No stations yet."
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Town</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="font-mono text-xs">{s.code}</TableCell>
                    <TableCell>{s.town ?? "—"}</TableCell>
                    <TableCell>{s.branch_name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={s.is_active ? "default" : "secondary"}>
                        {s.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={toggle.isPending}
                        onClick={() => toggle.mutate({ id: s.id, is_active: !s.is_active })}
                      >
                        {s.is_active ? "Deactivate" : "Activate"}
                      </Button>
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
