import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Smartphone, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Page, SectionCard } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { KES } from "@/lib/demo-data";
import { initiateMpesaPayment, queryMpesaPayment } from "@/lib/mpesa.functions";

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

type PayState = "idle" | "sending" | "waiting" | "success" | "failed";

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
  const initiate = useServerFn(initiateMpesaPayment);
  const query = useServerFn(queryMpesaPayment);

  const [phone, setPhone] = useState("");
  const [payState, setPayState] = useState<PayState>("idle");
  const [payMessage, setPayMessage] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["booking", ref],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "id, booking_ref, passenger_name, passenger_phone, seat_number, fare_amount, payment_status, mpesa_receipt, trips(departure_time, bus_plate, routes(destination, branches(name)))",
        )
        .eq("booking_ref", ref)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) throw new Error("Booking not found or not accessible.");
      return data as any;
    },
  });

  useEffect(() => {
    if (data?.passenger_phone) setPhone((p) => p || data.passenger_phone);
  }, [data]);

  // Clear any polling timer on unmount.
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const isPaid =
    data?.payment_status === "paid" || data?.payment_status === "success" || payState === "success";

  async function startPayment() {
    if (!data) return;
    if (!phone.trim()) return toast.error("Enter the payer's phone number.");
    setPayState("sending");
    setPayMessage("");
    try {
      const res = await initiate({ data: { booking_id: data.id, phone: phone.trim() } });
      setPayState("waiting");
      setPayMessage(res.message);
      toast.success("STK push sent to " + phone);

      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts += 1;
        try {
          const status = await query({
            data: { booking_id: data.id, checkoutRequestId: res.checkoutRequestId },
          });
          setPayMessage(status.description);
          if (status.status === "success") {
            if (pollRef.current) clearInterval(pollRef.current);
            setPayState("success");
            toast.success("Payment received");
            refetch();
          } else if (status.status === "failed") {
            if (pollRef.current) clearInterval(pollRef.current);
            setPayState("failed");
            toast.error(status.description || "Payment failed");
          }
        } catch {
          /* transient query error — keep polling */
        }
        if (attempts >= 20 && pollRef.current) {
          clearInterval(pollRef.current);
          if (payState !== "success") {
            setPayState("failed");
            setPayMessage("Timed out waiting for confirmation. Check M-Pesa and refresh.");
          }
        }
      }, 4000);
    } catch (e) {
      setPayState("failed");
      setPayMessage((e as Error).message);
      toast.error((e as Error).message);
    }
  }

  return (
    <Page title="Booking Details" description="Full ticket record, payment status and passenger information.">
      {isLoading && <p className="text-sm text-muted-foreground">Loading booking…</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      {data && (
        <>
          <SectionCard title="Record">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Reference" value={<span className="font-mono text-sm">{data.booking_ref}</span>} />
              <Field label="Passenger" value={data.passenger_name} />
              <Field label="Phone" value={data.passenger_phone} />
              <Field
                label="Route"
                value={(data.trips?.routes?.branches?.name ?? "—") + " → " + (data.trips?.routes?.destination ?? "—")}
              />
              <Field label="Bus" value={data.trips?.bus_plate ?? "—"} />
              <Field label="Seat" value={data.seat_number ?? "—"} />
              <Field label="Fare" value={KES(Number(data.fare_amount))} />
              <Field
                label="Departure"
                value={data.trips?.departure_time ? new Date(data.trips.departure_time).toLocaleString() : "—"}
              />
              <Field
                label="Payment"
                value={
                  <Badge variant={isPaid ? "default" : "secondary"} className="capitalize">
                    {isPaid ? "Paid" : (data.payment_status ?? "pending")}
                  </Badge>
                }
              />
            </div>
          </SectionCard>

          <SectionCard title="M-Pesa payment">
            {isPaid ? (
              <div className="flex items-center gap-2 text-sm text-primary">
                <CheckCircle2 className="size-5" />
                <span>
                  Payment confirmed{data.mpesa_receipt ? ` — receipt ${data.mpesa_receipt}` : ""}.
                </span>
              </div>
            ) : (
              <div className="max-w-md space-y-4">
                <p className="text-sm text-muted-foreground">
                  Send an STK push to the passenger&apos;s phone to collect{" "}
                  <span className="font-medium text-foreground">{KES(Number(data.fare_amount))}</span> via M-Pesa.
                </p>
                <div className="space-y-2">
                  <Label>Payer phone number</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0712345678"
                    disabled={payState === "sending" || payState === "waiting"}
                  />
                </div>
                <Button
                  onClick={startPayment}
                  disabled={payState === "sending" || payState === "waiting"}
                >
                  {payState === "sending" || payState === "waiting" ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      {payState === "sending" ? "Sending…" : "Waiting for PIN…"}
                    </>
                  ) : (
                    <>
                      <Smartphone className="mr-2 size-4" /> Pay with M-Pesa
                    </>
                  )}
                </Button>
                {payMessage && (
                  <p
                    className={
                      "text-sm " + (payState === "failed" ? "text-destructive" : "text-muted-foreground")
                    }
                  >
                    {payMessage}
                  </p>
                )}
              </div>
            )}
          </SectionCard>
        </>
      )}
    </Page>
  );
}
