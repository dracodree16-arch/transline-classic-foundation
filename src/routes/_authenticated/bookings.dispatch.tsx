import { createFileRoute } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trips } from "@/lib/demo-data";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/bookings/dispatch")({
  head: () => ({
    meta: [
      { title: "Bus Dispatch | Transline Classic TMS" },
      { name: "description", content: "Confirm departures and release buses from the stage." },
      { property: "og:title", content: "Bus Dispatch | Transline Classic TMS" },
      { property: "og:description", content: "Confirm departures and release buses from the stage." },
    ],
  }),
  component: BookingsDispatchPage,
});

function BookingsDispatchPage() {
  return (
    <Page title="Bus Dispatch" description="Confirm departures and release buses from the stage.">
      <DemoNotice />
      <SectionCard title="Trips">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Route</TableHead><TableHead>Bus</TableHead><TableHead>Departure</TableHead><TableHead>Seats</TableHead><TableHead>Booked</TableHead><TableHead>Status</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.route}</TableCell>
                  <TableCell className="font-mono text-xs">{row.bus}</TableCell>
                  <TableCell>{row.departure}</TableCell>
                  <TableCell>{row.seats}</TableCell>
                  <TableCell>{row.booked}</TableCell>
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
