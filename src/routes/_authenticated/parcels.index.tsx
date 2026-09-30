import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Page, SectionCard } from "@/components/page-shell";
import { QueryState } from "@/components/query-state";
import { PrintTicket } from "@/components/print-ticket";
import { KES } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/parcels/")({
  head: () => ({
    meta: [
      { title: "All Parcels | Transline Classic TMS" },
      { name: "description", content: "Parcels booked, in transit and delivered." },
      { property: "og:title", content: "All Parcels | Transline Classic TMS" },
      { property: "og:description", content: "Parcels booked, in transit and delivered." },
    ],
  }),
  component: ParcelsIndexPage,
});

function ParcelsIndexPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["parcels", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parcels")
        .select(
          "id, tracking_code, access_password, sender_name, sender_phone, receiver_name, receiver_phone, description, weight_kg, fare_amount, status, payment_status, created_at, origin:origin_branch_id(name), destination:destination_branch_id(name)",
        )
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const [printParcel, setPrintParcel] = useState<any | null>(null);

  useEffect(() => {
    if (!printParcel) return;

    const timer = window.setTimeout(() => window.print(), 50);
    return () => window.clearTimeout(timer);
  }, [printParcel]);

  useEffect(() => {
    const handleAfterPrint = () => setPrintParcel(null);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  const rows = data ?? [];

  return (
    <Page title="All Parcels" description="Parcels booked, in transit and delivered.">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .parcel-print-page,
          .parcel-print-page * {
            visibility: visible !important;
          }
          .parcel-print-page {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>

      <div className="parcel-list">
        <SectionCard title="Parcels">
          <QueryState isLoading={isLoading} error={error} isEmpty={rows.length === 0} emptyMessage="No parcels booked yet.">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead>Receiver</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Charge</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="print:hidden">Print</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">{row.tracking_code}</TableCell>
                      <TableCell className="font-medium">{row.sender_name}</TableCell>
                      <TableCell>{row.receiver_name}</TableCell>
                      <TableCell>{row.origin?.name ?? "—"}</TableCell>
                      <TableCell>{row.destination?.name ?? "—"}</TableCell>
                      <TableCell>{row.weight_kg != null ? `${row.weight_kg} kg` : "—"}</TableCell>
                      <TableCell>{KES(row.fare_amount)}</TableCell>
                      <TableCell><Badge variant="secondary">{row.status ?? "booked"}</Badge></TableCell>
                      <TableCell className="print:hidden">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPrintParcel(row)}
                        >
                          <Printer className="mr-2 size-4" />
                          Print
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </QueryState>
        </SectionCard>
      </div>

      {printParcel && (
        <div className="parcel-print-page mx-auto w-full max-w-3xl">
          <PrintTicket
            title="Parcel Receipt / Tracking Ticket"
            subtitle={(printParcel.origin?.name ?? "—") + " → " + (printParcel.destination?.name ?? "—")}
            reference={printParcel.tracking_code}
            fields={[
              { label: "Sender", value: printParcel.sender_name },
              { label: "Sender phone", value: printParcel.sender_phone },
              { label: "Receiver", value: printParcel.receiver_name },
              { label: "Receiver phone", value: printParcel.receiver_phone },
              { label: "From", value: printParcel.origin?.name ?? "—" },
              { label: "To", value: printParcel.destination?.name ?? "—" },
              { label: "Description", value: printParcel.description ?? "—" },
              { label: "Weight", value: printParcel.weight_kg != null ? printParcel.weight_kg + " kg" : "—" },
              { label: "Charge", value: KES(printParcel.fare_amount) },
              { label: "Payment", value: printParcel.payment_status ?? "pending" },
              { label: "Status", value: printParcel.status ?? "received" },
              { label: "Parcel access code", value: printParcel.access_password ?? "—" },
              {
                label: "Booked",
                value: printParcel.created_at ? new Date(printParcel.created_at).toLocaleString() : "—",
              },
            ]}
            instructions={
              <>
                <p>Keep the tracking code and access code safe for parcel tracking and collection.</p>
                <p className="mt-2 font-mono text-sm">Access code: {printParcel.access_password ?? "—"}</p>
              </>
            }
            footer="Present this ticket when collecting the parcel. The tracking code is the parcel reference."
          />
        </div>
      )}
    </Page>
  );
}
