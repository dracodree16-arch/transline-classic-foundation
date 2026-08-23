import { createFileRoute } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trips } from "@/lib/demo-data";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/trips")({
  head: () => ({
    meta: [
      { title: "All Trips | Transline Classic TMS" },
      { name: "description", content: "Scheduled, boarding and completed trips." },
      { property: "og:title", content: "All Trips | Transline Classic TMS" },
      { property: "og:description", content: "Scheduled, boarding and completed trips." },
    ],
  }),
  component: TripsIndexPage,
});

function TripsIndexPage() {
  return (
    <Page title="All Trips" description="Scheduled, boarding and completed trips.">
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
