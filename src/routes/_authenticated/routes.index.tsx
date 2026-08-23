import { createFileRoute } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KES, routes } from "@/lib/demo-data";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/routes")({
  head: () => ({
    meta: [
      { title: "All Routes | Transline Classic TMS" },
      { name: "description", content: "Routes served across the western Kenya network." },
      { property: "og:title", content: "All Routes | Transline Classic TMS" },
      { property: "og:description", content: "Routes served across the western Kenya network." },
    ],
  }),
  component: RoutesIndexPage,
});

function RoutesIndexPage() {
  return (
    <Page title="All Routes" description="Routes served across the western Kenya network.">
      <DemoNotice />
      <SectionCard title="Routes">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Origin</TableHead><TableHead>Destination</TableHead><TableHead>Base fare</TableHead><TableHead>Distance</TableHead><TableHead>Duration</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.origin}</TableCell>
                  <TableCell>{row.destination}</TableCell>
                  <TableCell>{KES(row.fare)}</TableCell>
                  <TableCell>{row.distanceKm} km</TableCell>
                  <TableCell>{row.duration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </Page>
  );
}
