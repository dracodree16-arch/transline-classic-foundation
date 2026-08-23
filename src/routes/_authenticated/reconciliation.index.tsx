import { createFileRoute, Link } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { KES } from "@/lib/demo-data";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/reconciliation")({
  head: () => ({
    meta: [
      { title: "Reconciliation Dashboard | Transline Classic TMS" },
      { name: "description", content: "Daily matching of sales, cash and banking." },
      { property: "og:title", content: "Reconciliation Dashboard | Transline Classic TMS" },
      { property: "og:description", content: "Daily matching of sales, cash and banking." },
    ],
  }),
  component: ReconciliationIndexPage,
});

function ReconciliationIndexPage() {
  return (
    <Page title="Reconciliation Dashboard" description="Daily matching of sales, cash and banking.">
      <DemoNotice />
      <SectionCard title="Daily reconciliation">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Branch</TableHead><TableHead>Sales</TableHead><TableHead>Cash</TableHead><TableHead>M-Pesa</TableHead><TableHead>Variance</TableHead><TableHead /></TableRow>
            </TableHeader>
            <TableBody>
              {[["Nairobi CBD", 264100, 118400, 145700, 0], ["Kisii Town", 148500, 61200, 86800, 500], ["Kisumu", 96300, 42100, 54200, 0]].map(([branch, sales, cash, mpesa, variance]) => (
                <TableRow key={branch as string}>
                  <TableCell className="font-medium">{branch}</TableCell>
                  <TableCell>{KES(sales as number)}</TableCell>
                  <TableCell>{KES(cash as number)}</TableCell>
                  <TableCell>{KES(mpesa as number)}</TableCell>
                  <TableCell>{KES(variance as number)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm"><Link to="/reconciliation/$id" params={{ id: "demo-1" }}>Open</Link></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </Page>
  );
}
