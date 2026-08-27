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

export const Route = createFileRoute("/_authenticated/routes/new")({
  head: () => ({
    meta: [
      { title: "Add Route | Transline Classic TMS" },
      { name: "description", content: "Define origin, destination and base fare." },
      { property: "og:title", content: "Add Route | Transline Classic TMS" },
      { property: "og:description", content: "Define origin, destination and base fare." },
    ],
  }),
  component: RoutesNewPage,
});

type BranchOption = { id: string; name: string };

function RoutesNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [originBranchId, setOriginBranchId] = useState("");
  const [destination, setDestination] = useState("");
  const [baseFare, setBaseFare] = useState("");
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

    if (!originBranchId) return toast.error("Select an origin branch.");
    if (!destination.trim()) return toast.error("Destination is required.");
    if (!baseFare || Number(baseFare) <= 0) return toast.error("Enter a valid base fare.");

    setSubmitting(true);
    const { error } = await supabase.from("routes").insert({
      origin_branch_id: originBranchId,
      destination: destination.trim(),
      base_fare: Number(baseFare),
    });
    setSubmitting(false);

    if (error) {
      toast.error("Failed to add route: " + error.message);
      return;
    }
    toast.success("Route added.");
    await queryClient.invalidateQueries({ queryKey: ["routes", "all"] });
    navigate({ to: "/routes" });
  }

  return (
    <Page title="Add Route" description="Define origin, destination and base fare.">
      <SectionCard title="Route details">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Origin branch</Label>
            <Select value={originBranchId} onValueChange={setOriginBranchId} disabled={loading}>
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
            <Label>Destination</Label>
            <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination" />
          </div>
          <div className="space-y-2">
            <Label>Base fare (KES)</Label>
            <Input value={baseFare} onChange={(e) => setBaseFare(e.target.value)} placeholder="Base fare (KES)" type="number" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add route"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </Page>
  );
}
