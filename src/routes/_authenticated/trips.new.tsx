import { useEffect, useMemo, useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Page, SectionCard } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { useStaffSession } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/trips/new")({
  beforeLoad: ({ context }) => {
    if (context.profile.role !== "admin") throw redirect({ to: "/trips" });
  },
  head: () => ({
    meta: [
      { title: "Create Trip | Transline Classic TMS" },
      { name: "description", content: "Schedule a bus against a route and departure time." },
      { property: "og:title", content: "Create Trip | Transline Classic TMS" },
      { property: "og:description", content: "Schedule a bus against a route and departure time." },
    ],
  }),
  component: TripsNewPage,
});

type RouteOption = {
  id: string;
  destination: string;
  base_fare: number;
  origin_branch_id: string | null;
  origin_name: string | null;
};
type BusOption = { id: string; plate_number: string; capacity: number; branch_id: string | null };
type BranchOption = { id: string; name: string };

function TripsNewPage() {
  const navigate = useNavigate();
  const { branchId } = useStaffSession();

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [buses, setBuses] = useState<BusOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [routeId, setRouteId] = useState("");
  const [busId, setBusId] = useState("");
  const [branchIdField, setBranchIdField] = useState("");
  const [departure, setDeparture] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const [routesRes, busesRes, branchesRes] = await Promise.all([
        supabase
          .from("routes")
          .select("id, destination, base_fare, origin_branch_id, branches(name)")
          .order("created_at", { ascending: true }),
        supabase
          .from("buses")
          .select("id, plate_number, capacity, branch_id, status")
          .order("plate_number", { ascending: true }),
        supabase.from("branches").select("id, name").order("name", { ascending: true }),
      ]);
      if (!active) return;
      if (routesRes.error) toast.error("Failed to load routes: " + routesRes.error.message);
      if (busesRes.error) toast.error("Failed to load buses: " + busesRes.error.message);

      setRoutes(
        (routesRes.data ?? []).map((r: any) => ({
          id: r.id,
          destination: r.destination,
          base_fare: r.base_fare,
          origin_branch_id: r.origin_branch_id,
          origin_name: r.branches?.name ?? null,
        })),
      );
      setBuses(
        (busesRes.data ?? [])
          .filter((b: any) => b.status !== "Maintenance")
          .map((b: any) => ({
            id: b.id,
            plate_number: b.plate_number,
            capacity: b.capacity,
            branch_id: b.branch_id,
          })),
      );
      setBranches((branchesRes.data ?? []) as BranchOption[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const selectedRoute = useMemo(() => routes.find((r) => r.id === routeId), [routes, routeId]);
  const selectedBus = useMemo(() => buses.find((b) => b.id === busId), [buses, busId]);

  // Default the branch from the chosen route's origin, then bus branch, then the clerk's branch.
  useEffect(() => {
    const next = selectedRoute?.origin_branch_id ?? selectedBus?.branch_id ?? branchId ?? "";
    if (next) setBranchIdField(next);
  }, [selectedRoute, selectedBus, branchId]);

  // Auto-fill total seats from the bus capacity.
  useEffect(() => {
    if (selectedBus) setTotalSeats(String(selectedBus.capacity));
  }, [selectedBus]);

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!routeId) return toast.error("Select a route.");
    if (!departure) return toast.error("Choose a departure date and time.");
    if (!branchIdField) return toast.error("Select an origin branch.");
    const seats = Number(totalSeats);
    if (!seats || seats < 1) return toast.error("Enter a valid seat count.");

    setSubmitting(true);
    const { error } = await supabase.from("trips").insert({
      route_id: routeId,
      branch_id: branchIdField,
      bus_plate: selectedBus?.plate_number ?? null,
      departure_time: new Date(departure).toISOString(),
      total_seats: seats,
      driver_name: driverName.trim() || null,
      driver_phone: driverPhone.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Failed to schedule trip: " + error.message);
      return;
    }
    toast.success("Trip scheduled");
    navigate({ to: "/trips" });
  }

  return (
    <Page title="Create Trip" description="Schedule a bus against a route and departure time.">
      <SectionCard title="Trip schedule">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Route</Label>
            <Select value={routeId} onValueChange={setRouteId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading…" : "Select a route"} />
              </SelectTrigger>
              <SelectContent>
                {routes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {(r.origin_name ?? "—") + " → " + r.destination} · KES {r.base_fare}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Bus</Label>
            <Select value={busId} onValueChange={setBusId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading…" : "Select a bus"} />
              </SelectTrigger>
              <SelectContent>
                {buses.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.plate_number} · {b.capacity} seats
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Origin branch</Label>
            <Select value={branchIdField} onValueChange={setBranchIdField} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading…" : "Select a branch"} />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Departure date &amp; time</Label>
            <Input
              type="datetime-local"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Total seats</Label>
            <Input
              type="number"
              min={1}
              value={totalSeats}
              onChange={(e) => setTotalSeats(e.target.value)}
              placeholder="e.g. 49"
            />
          </div>

          <div className="space-y-2">
            <Label>Driver name</Label>
            <Input
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="Driver name (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label>Driver phone</Label>
            <Input
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
              placeholder="Driver phone (optional)"
            />
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Scheduling…" : "Schedule trip"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </Page>
  );
}
