import { createFileRoute } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { KES, parcels } from "@/lib/demo-data";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

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
  return (
    <Page title="All Parcels" description="Parcels booked, in transit and delivered.">
      <DemoNotice />
      <SectionCard title="Parcels">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Code</TableHead><TableHead>Sender</TableHead><TableHead>Receiver</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Weight</TableHead><TableHead>Charge</TableHead><TableHead>Status</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {parcels.map((row) => (
                <TableRow key={row.code}>
                  <TableCell className="font-mono text-xs">{row.code}</TableCell>
                  <TableCell className="font-medium">{row.sender}</TableCell>
                  <TableCell>{row.receiver}</TableCell>
                  <TableCell>{row.from}</TableCell>
                  <TableCell>{row.to}</TableCell>
                  <TableCell>{row.weight} kg</TableCell>
                  <TableCell>{KES(row.fare)}</TableCell>
                  <TableCell><Badge variant="secondary">{row.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </Page>
  );
}
