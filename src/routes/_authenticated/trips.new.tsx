import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { toast } from "sonner";
import { Page, SectionCard } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/trips/new")({
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

type RouteOption = { id: string; destination: string; origin: string | null; base_fare: number };
type BusOption = { plate_number: string; capacity: number };
type BranchOption = { id: string; name: string };

function TripsNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [buses, setBuses] = useState<BusOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [routeId, setRouteId] = useState("");
  const [busPlate, setBusPlate] = useState("");
  const [branchId, setBranchId] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const [routesRes, busesRes, branchesRes, userRes] = await Promise.all([
        supabase.from("routes").select("id, destination, base_fare, branches(name)"),
        supabase.from("buses").select("plate_number, capacity").order("plate_number"),
        supabase.from("branches").select("id, name").order("name"),
        supabase.auth.getUser(),
      ]);
      if (!active) return;

      if (routesRes.error) toast.error("Failed to load routes: " + routesRes.error.message);
      else
        setRoutes(
          (routesRes.data ?? []).map((r: any) => ({
            id: r.id,
            destination: r.destination,
            origin: r.branches?.name ?? null,
            base_fare: r.base_fare,
          }))
        );

      if (busesRes.error) toast.error("Failed to load buses: " + busesRes.error.message);
      else setBuses(busesRes.data ?? []);

      if (branchesRes.error) toast.error("Failed to load branches: " + branchesRes.error.message);
      else setBranches(branchesRes.data ?? []);

      // Default branch to the current user's assigned branch.
      const userId = userRes.data.user?.id;
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("branch_id")
          .eq("id", userId)
          .maybeSingle();
        if (active && profile?.branch_id) setBranchId(profile.branch_id);
      }

      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  function handleBusChange(plate: string) {
    setBusPlate(plate);
    const bus = buses.find((b) => b.plate_number === plate);
    if (bus && !totalSeats) setTotalSeats(String(bus.capacity));
  }

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();

    if (!routeId) return toast.error("Select a route.");
    if (!branchId) return toast.error("Select a branch.");
    if (!departureDate || !departureTime) return toast.error("Set the departure date and time.");
    if (!totalSeats || Number(totalSeats) <= 0) return toast.error("Enter the total seats.");

    // Combine local date + time into an ISO timestamp.
    const departure = new Date(`${departureDate}T${departureTime}`);
    if (Number.isNaN(departure.getTime())) return toast.error("Invalid departure date/time.");

    setSubmitting(true);
    const { error } = await supabase.from("trips").insert({
      route_id: routeId,
      bus_plate: busPlate || null,
      branch_id: branchId,
      departure_time: departure.toISOString(),
      total_seats: Number(totalSeats),
      driver_name: driverName.trim() || null,
      driver_phone: driverPhone.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Failed to schedule trip: " + error.message);
      return;
    }
    toast.success("Trip scheduled.");
    await queryClient.invalidateQueries({ queryKey: ["trips", "all"] });
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
                    {(r.origin ?? "—") + " → " + r.destination} · KES {r.base_fare}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Bus plate</Label>
            <Select value={busPlate} onValueChange={handleBusChange} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading…" : "Select a bus"} />
              </SelectTrigger>
              <SelectContent>
                {buses.map((b) => (
                  <SelectItem key={b.plate_number} value={b.plate_number}>
                    {b.plate_number} ({b.capacity} seats)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Branch</Label>
            <Select value={branchId} onValueChange={setBranchId} disabled={loading}>
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
            <Label>Total seats</Label>
            <Input
              value={totalSeats}
              onChange={(e) => setTotalSeats(e.target.value)}
              placeholder="Total seats"
              type="number"
            />
          </div>
          <div className="space-y-2">
            <Label>Departure date</Label>
            <Input value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} type="date" />
          </div>
          <div className="space-y-2">
            <Label>Departure time</Label>
            <Input value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} type="time" />
          </div>
          <div className="space-y-2">
            <Label>Driver name</Label>
            <Input value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Driver name (optional)" />
          </div>
          <div className="space-y-2">
            <Label>Driver phone</Label>
            <Input value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} placeholder="Driver phone (optional)" />
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
