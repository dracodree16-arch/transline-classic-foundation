import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Page, SectionCard } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { initiateMpesaPayment } from "@/lib/mpesa";

export const Route = createFileRoute("/_authenticated/bookings/$ref")({
  head: () => ({
    meta: [
      { title: "Booking Details | Transline Classic TMS" },
      { name: "description", content: "Full ticket record, payment status and passenger information." },
      { property: "og:title", content: "Booking Details | Transline Classic TMS" },
      { property: "og:description", content: "Full ticket record, payment status and passenger information." },
    ],
  }),
  component: BookingsRefPage,
});

type BookingRecord = {
  id: string;
  booking_ref: string | null;
  passenger_name: string;
  passenger_phone: string;
  seat_number: string | null;
  fare_amount: number;
  payment_status: string | null;
  mpesa_receipt: string | null;
  origin: string | null;
  destination: string | null;
  branch: string | null;
};

const KES = (n: number) => "KES " + n.toLocaleString("en-KE");

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function BookingsRefPage() {
  const { ref } = Route.useParams();

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [collecting, setCollecting] = useState(false);

  async function loadBooking() {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, booking_ref, passenger_name, passenger_phone, seat_number, fare_amount, payment_status, mpesa_receipt, branches(name), trips(routes(destination, branches(name)))"
      )
      .eq("booking_ref", ref)
      .maybeSingle();

    if (error) {
      toast.error("Failed to load booking: " + error.message);
      setBooking(null);
    } else if (data) {
      const rec: BookingRecord = {
        id: data.id,
        booking_ref: data.booking_ref,
        passenger_name: data.passenger_name,
        passenger_phone: data.passenger_phone,
        seat_number: data.seat_number,
        fare_amount: data.fare_amount,
        payment_status: data.payment_status,
        mpesa_receipt: data.mpesa_receipt,
        origin: (data as any).trips?.routes?.branches?.name ?? null,
        destination: (data as any).trips?.routes?.destination ?? null,
        branch: (data as any).branches?.name ?? null,
      };
      setBooking(rec);
      setPhone(rec.passenger_phone ?? "");
    } else {
      setBooking(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  async function handleCollectPayment() {
    if (!booking) return;
    if (!phone.trim()) { toast.error("Enter the customer's phone number."); return; }

    setCollecting(true);
    try {
      const result = await initiateMpesaPayment(booking.id, phone.trim());
      toast.success(result.message ?? "STK push sent.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setCollecting(false);
    }
  }

  const isPaid = booking?.payment_status === "paid";

  return (
    <Page title="Booking Details" description="Full ticket record, payment status and passenger information.">
      <SectionCard title="Record">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading booking…</p>
        ) : !booking ? (
          <p className="text-sm text-muted-foreground">No booking found for reference {ref}.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Reference" value={<span className="font-mono text-sm">{booking.booking_ref ?? ref}</span>} />
            <Field label="Passenger" value={booking.passenger_name} />
            <Field label="Phone" value={booking.passenger_phone} />
            <Field
              label="Route"
              value={(booking.origin ?? "—") + " → " + (booking.destination ?? "—")}
            />
            <Field label="Seat" value={booking.seat_number ?? "—"} />
            <Field label="Fare" value={KES(booking.fare_amount)} />
            <Field
              label="Payment"
              value={
                <Badge variant={isPaid ? "default" : "secondary"} className="capitalize">
                  {booking.payment_status ?? "pending"}
                </Badge>
              }
            />
            <Field label="M-Pesa receipt" value={booking.mpesa_receipt ?? "—"} />
            <Field label="Branch" value={booking.branch ?? "—"} />
          </div>
        )}
      </SectionCard>

      {booking && (
        <SectionCard title="Collect payment (M-Pesa STK Push)">
          {isPaid ? (
            <p className="text-sm text-muted-foreground">
              This booking is already paid{booking.mpesa_receipt ? ` (receipt ${booking.mpesa_receipt})` : ""}.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Customer phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XX XXX XXX"
                  inputMode="tel"
                />
              </div>
              <div className="flex items-end gap-3">
                <Button onClick={handleCollectPayment} disabled={collecting}>
                  {collecting ? "Sending…" : `Collect ${KES(booking.fare_amount)}`}
                </Button>
                <Button variant="outline" onClick={loadBooking} disabled={collecting}>
                  Refresh status
                </Button>
              </div>
              <p className="text-xs text-muted-foreground sm:col-span-2">
                A payment prompt is sent to the customer&apos;s phone. Once they enter their M-Pesa PIN, the
                status updates automatically — use &quot;Refresh status&quot; to check.
              </p>
            </div>
          )}
        </SectionCard>
      )}
    </Page>
  );
}
