import { createFileRoute } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { KES, bookings } from "@/lib/demo-data";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/bookings/manifest")({
  head: () => ({
    meta: [
      { title: "Passenger Manifest | Transline Classic TMS" },
      { name: "description", content: "Printable boarding manifest per trip." },
      { property: "og:title", content: "Passenger Manifest | Transline Classic TMS" },
      { property: "og:description", content: "Printable boarding manifest per trip." },
    ],
  }),
  component: BookingsManifestPage,
});

function BookingsManifestPage() {
  return (
    <Page title="Passenger Manifest" description="Printable boarding manifest per trip.">
      <DemoNotice />
      <SectionCard title="Bookings">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Ref</TableHead><TableHead>Passenger</TableHead><TableHead>Phone</TableHead><TableHead>Route</TableHead><TableHead>Seat</TableHead><TableHead>Fare</TableHead><TableHead>Status</TableHead><TableHead>Branch</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((row) => (
                <TableRow key={row.ref}>
                  <TableCell className="font-mono text-xs">{row.ref}</TableCell>
                  <TableCell className="font-medium">{row.passenger}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell className="whitespace-nowrap">{row.route}</TableCell>
                  <TableCell>{row.seat}</TableCell>
                  <TableCell>{KES(row.fare)}</TableCell>
                  <TableCell><Badge variant="secondary">{row.status}</Badge></TableCell>
                  <TableCell>{row.agent}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </Page>
  );
}
