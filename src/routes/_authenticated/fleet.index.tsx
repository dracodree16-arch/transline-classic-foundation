import { createFileRoute } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buses } from "@/lib/demo-data";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/fleet")({
  head: () => ({
    meta: [
      { title: "Fleet — All Buses | Transline Classic TMS" },
      { name: "description", content: "Every bus in the Transline Classic fleet." },
      { property: "og:title", content: "Fleet — All Buses | Transline Classic TMS" },
      { property: "og:description", content: "Every bus in the Transline Classic fleet." },
    ],
  }),
  component: FleetIndexPage,
});

function FleetIndexPage() {
  return (
    <Page title="Fleet — All Buses" description="Every bus in the Transline Classic fleet.">
      <DemoNotice />
      <SectionCard title="Fleet">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Plate</TableHead><TableHead>Model</TableHead><TableHead>Capacity</TableHead><TableHead>Branch</TableHead><TableHead>Status</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {buses.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.plate}</TableCell>
                  <TableCell className="font-medium">{row.model}</TableCell>
                  <TableCell>{row.capacity}</TableCell>
                  <TableCell>{row.branch}</TableCell>
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
