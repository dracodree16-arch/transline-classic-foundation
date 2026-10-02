import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
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
import { KES } from "@/lib/format";
import { Page, SectionCard } from "@/components/page-shell";
import { PrintTicket } from "@/components/print-ticket";
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
  const queryClient = useQueryClient();

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
  const [bookedParcel, setBookedParcel] = useState<any | null>(null);

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

    if (!senderName.trim() || !senderPhone.trim()) { toast.error("Sender name and phone are required."); return; }
    if (!receiverName.trim() || !receiverPhone.trim()) { toast.error("Receiver name and phone are required."); return; }
    if (!originBranchId) { toast.error("Select an origin branch."); return; }
    if (!destinationBranchId) { toast.error("Select a destination branch."); return; }
    if (!charge || Number(charge) <= 0) { toast.error("Enter a valid charge."); return; }

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
    await queryClient.invalidateQueries({ queryKey: ["parcels", "all"] });
    setBookedParcel({
      tracking_code: trackingCode,
      access_password: accessPassword,
      sender_name: senderName.trim(),
      sender_phone: senderPhone.trim(),
      receiver_name: receiverName.trim(),
      receiver_phone: receiverPhone.trim(),
      origin: branches.find((b) => b.id === originBranchId),
      destination: branches.find((b) => b.id === destinationBranchId),
      description: description.trim() || null,
      weight_kg: weight ? Number(weight) : null,
      fare_amount: Number(charge),
      payment_status: "pending",
      status: "received",
      created_at: new Date().toISOString(),
    });
  }

  return (
    <Page title="Book Parcel" description="Register a parcel for transport between branches.">
      {bookedParcel && (
        <SectionCard title="Booking ticket">
          <PrintTicket
            title="Parcel Booking Ticket"
            subtitle={(bookedParcel.origin?.name ?? "—") + " → " + (bookedParcel.destination?.name ?? "—")}
            reference={bookedParcel.tracking_code}
            fields={[
              { label: "Sender", value: bookedParcel.sender_name },
              { label: "Sender phone", value: bookedParcel.sender_phone },
              { label: "Receiver", value: bookedParcel.receiver_name },
              { label: "Receiver phone", value: bookedParcel.receiver_phone },
              { label: "From", value: bookedParcel.origin?.name ?? "—" },
              { label: "To", value: bookedParcel.destination?.name ?? "—" },
              { label: "Description", value: bookedParcel.description ?? "—" },
              { label: "Weight", value: bookedParcel.weight_kg != null ? bookedParcel.weight_kg + " kg" : "—" },
              { label: "Charge", value: KES(bookedParcel.fare_amount) },
              { label: "Payment", value: bookedParcel.payment_status },
              { label: "Status", value: bookedParcel.status },
              { label: "Parcel access code", value: bookedParcel.access_password },
            ]}
            instructions={
              <>
                <p>Use the tracking code and access code to track this parcel.</p>
                <p className="mt-2 font-mono text-sm">Access code: {bookedParcel.access_password}</p>
              </>
            }
            footer="Keep this booking ticket for parcel tracking and collection."
          />
        </SectionCard>
      )}

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
