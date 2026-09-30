import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Page, SectionCard } from "@/components/page-shell";
import { PrintTicket } from "@/components/print-ticket";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/parcels/$code")({
  head: () => ({
    meta: [{ title: "Parcel Details | Transline Classic TMS" }],
  }),
  component: ParcelsCodePage,
});

const KES = (n: number) => "KES " + Number(n ?? 0).toLocaleString("en-KE");

function ParcelsCodePage() {
  const { code } = Route.useParams();

  const parcel = useQuery({
    queryKey: ["parcel", code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parcels")
        .select(
          "id, tracking_code, access_password, sender_name, sender_phone, receiver_name, receiver_phone, description, weight_kg, fare_amount, payment_status, status, created_at, origin:origin_branch_id(name), destination:destination_branch_id(name)"
        )
        .eq("tracking_code", code)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    },
  });

  const p: any = parcel.data;

  return (
    <Page title="Parcel Details" description="Sender, receiver, charges and delivery status.">
      <SectionCard title="Printable parcel ticket">
        {parcel.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading parcel…</p>
        ) : parcel.error ? (
          <p className="text-sm text-destructive">{parcel.error.message}</p>
        ) : !p ? (
          <p className="text-sm text-muted-foreground">
            No parcel found for tracking code {code}.
          </p>
        ) : (
          <PrintTicket
            title="Parcel Receipt / Tracking Ticket"
            subtitle={(p.origin?.name ?? "—") + " → " + (p.destination?.name ?? "—")}
            reference={p.tracking_code ?? code}
            fields={[
              { label: "Sender", value: p.sender_name },
              { label: "Sender phone", value: p.sender_phone },
              { label: "Receiver", value: p.receiver_name },
              { label: "Receiver phone", value: p.receiver_phone },
              { label: "From", value: p.origin?.name ?? "—" },
              { label: "To", value: p.destination?.name ?? "—" },
              { label: "Description", value: p.description ?? "—" },
              { label: "Weight", value: p.weight_kg != null ? p.weight_kg + " kg" : "—" },
              { label: "Charge", value: KES(p.fare_amount) },
              { label: "Payment", value: p.payment_status ?? "pending" },
              { label: "Status", value: p.status ?? "received" },
              {
                label: "Booked",
                value: p.created_at ? new Date(p.created_at).toLocaleString() : "—",
              },
            ]}
            instructions={
              <>
                Keep this tracking code for parcel collection and tracking.
                <div className="mt-2 break-all font-mono text-xs">
                  {typeof window !== "undefined"
                    ? window.location.origin +
                      "/track?code=" +
                      encodeURIComponent(p.tracking_code ?? code)
                    : "/track?code=" + encodeURIComponent(p.tracking_code ?? code)}
                </div>
              </>
            }
            footer="Present this ticket when collecting the parcel. The tracking code is the parcel reference."
          />
        )}
      </SectionCard>

      <SectionCard title="Parcel record">
        {p && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Tracking code", p.tracking_code],
              ["Sender", p.sender_name],
              ["Sender phone", p.sender_phone],
              ["Receiver", p.receiver_name],
              ["Receiver phone", p.receiver_phone],
              ["From", p.origin?.name ?? "—"],
              ["To", p.destination?.name ?? "—"],
              ["Description", p.description ?? "—"],
              ["Weight", p.weight_kg != null ? p.weight_kg + " kg" : "—"],
              ["Charge", KES(p.fare_amount)],
              ["Payment", p.payment_status ?? "pending"],
              ["Status", p.status ?? "received"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 font-medium">{value}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </Page>
  );
}
