import { useEffect, useState } from "react";
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

export const Route = createFileRoute("/_authenticated/fleet/new")({
  head: () => ({
    meta: [
      { title: "Add Bus | Transline Classic TMS" },
      { name: "description", content: "Register a new bus into the fleet." },
      { property: "og:title", content: "Add Bus | Transline Classic TMS" },
      { property: "og:description", content: "Register a new bus into the fleet." },
    ],
  }),
  component: FleetNewPage,
});

type BranchOption = { id: string; name: string };
const STATUSES = ["active", "maintenance", "inactive"];

function FleetNewPage() {
  const navigate = useNavigate();

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [plateNumber, setPlateNumber] = useState("");
  const [model, setModel] = useState("");
  const [capacity, setCapacity] = useState("");
  const [branchId, setBranchId] = useState("");
  const [status, setStatus] = useState("active");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from("branches").select("id, name").order("name");
      if (!active) return;
      if (error) toast.error("Failed to load branches: " + error.message);
      else setBranches(data ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();

    if (!plateNumber.trim()) return toast.error("Plate number is required.");
    if (!capacity || Number(capacity) <= 0) return toast.error("Enter a valid seat capacity.");

    setSubmitting(true);
    const { error } = await supabase.from("buses").insert({
      plate_number: plateNumber.trim(),
      model: model.trim() || null,
      capacity: Number(capacity),
      branch_id: branchId || null,
      status,
    });
    setSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        toast.error("A bus with that plate number already exists.");
      } else {
        toast.error("Failed to add bus: " + error.message);
      }
      return;
    }
    toast.success("Bus added to the fleet.");
    navigate({ to: "/fleet" });
  }

  return (
    <Page title="Add Bus" description="Register a new bus into the fleet.">
      <SectionCard title="Bus details">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Plate number</Label>
            <Input value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} placeholder="Plate number" />
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model (optional)" />
          </div>
          <div className="space-y-2">
            <Label>Seat capacity</Label>
            <Input value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Seat capacity" type="number" />
          </div>
          <div className="space-y-2">
            <Label>Home branch</Label>
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
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add bus"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </Page>
  );
}
