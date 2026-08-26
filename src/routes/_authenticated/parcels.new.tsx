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

export const Route = createFileRoute("/_authenticated/parcels/new")({
  head: () => ({
    meta: [
      { title: "Book Parcel | Transline Classic TMS" },
      { name: "description", content: "Register a parcel for transport between branches." },
      { property: "og:title", content: "Book Parcel | Transline Classic TMS" },
      { property: "og:description", content: "Register a parcel for transport between branches." },
    ],
  }),
  component: ParcelsNewPage,
});

type BranchOption = { id: string; name: string };

function ParcelsNewPage() {
  const navigate = useNavigate();

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [originBranchId, setOriginBranchId] = useState("");
  const [destinationBranchId, setDestinationBranchId] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [charge, setCharge] = useState("");
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

    if (!senderName.trim() || !senderPhone.trim()) return toast.error("Sender name and phone are required.");
    if (!receiverName.trim() || !receiverPhone.trim()) return toast.error("Receiver name and phone are required.");
    if (!originBranchId) return toast.error("Select an origin branch.");
    if (!destinationBranchId) return toast.error("Select a destination branch.");
    if (!charge || Number(charge) <= 0) return toast.error("Enter a valid charge.");

    const trackingCode = `TP${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;
    const accessPassword = Math.floor(1000 + Math.random() * 9000).toString();

    const { data: userData } = await supabase.auth.getUser();

    setSubmitting(true);
    const { error } = await supabase.from("parcels").insert({
      sender_name: senderName.trim(),
      sender_phone: senderPhone.trim(),
      receiver_name: receiverName.trim(),
      receiver_phone: receiverPhone.trim(),
      origin_branch_id: originBranchId,
      destination_branch_id: destinationBranchId,
      description: description.trim() || null,
      weight_kg: weight ? Number(weight) : null,
      fare_amount: Number(charge),
      tracking_code: trackingCode,
      access_password: accessPassword,
      payment_status: "pending",
      status: "received",
      booked_by: userData.user?.id ?? null,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Failed to book parcel: " + error.message);
      return;
    }
    toast.success(`Parcel booked — tracking ${trackingCode}, access code ${accessPassword}`);
    navigate({ to: "/parcels" });
  }

  return (
    <Page title="Book Parcel" description="Register a parcel for transport between branches.">
      <SectionCard title="Parcel details">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Sender name</Label>
            <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Sender name" />
          </div>
          <div className="space-y-2">
            <Label>Sender phone</Label>
            <Input value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} placeholder="Sender phone" />
          </div>
          <div className="space-y-2">
            <Label>Receiver name</Label>
            <Input value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Receiver name" />
          </div>
          <div className="space-y-2">
            <Label>Receiver phone</Label>
            <Input value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} placeholder="Receiver phone" />
          </div>
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
            <Label>Destination branch</Label>
            <Select value={destinationBranchId} onValueChange={setDestinationBranchId} disabled={loading}>
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
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" />
          </div>
          <div className="space-y-2">
            <Label>Weight (kg)</Label>
            <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight (kg)" type="number" />
          </div>
          <div className="space-y-2">
            <Label>Charge (KES)</Label>
            <Input value={charge} onChange={(e) => setCharge(e.target.value)} placeholder="Charge (KES)" type="number" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Booking…" : "Book parcel"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </Page>
  );
}
