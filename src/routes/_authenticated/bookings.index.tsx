import { createFileRoute } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { KES, bookings } from "@/lib/demo-data";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({
    meta: [
      { title: "All Bookings | Transline Classic TMS" },
      { name: "description", content: "Every ticket sold across Transline Classic branches." },
      { property: "og:title", content: "All Bookings | Transline Classic TMS" },
      { property: "og:description", content: "Every ticket sold across Transline Classic branches." },
    ],
  }),
  component: BookingsIndexPage,
});

function BookingsIndexPage() {
  return (
    <Page title="All Bookings" description="Every ticket sold across Transline Classic branches.">
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
