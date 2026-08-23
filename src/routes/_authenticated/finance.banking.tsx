import { createFileRoute } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { KES } from "@/lib/demo-data";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/finance/banking")({
  head: () => ({
    meta: [
      { title: "Banking | Transline Classic TMS" },
      { name: "description", content: "Bank deposits and slips per branch." },
      { property: "og:title", content: "Banking | Transline Classic TMS" },
      { property: "og:description", content: "Bank deposits and slips per branch." },
    ],
  }),
  component: FinanceBankingPage,
});

function FinanceBankingPage() {
  return (
    <Page title="Banking" description="Bank deposits and slips per branch.">
      <DemoNotice />
      <SectionCard title="Records">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Reference</TableHead><TableHead>Branch</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {[["TX-DEMO-9001", "Nairobi CBD", 264100], ["TX-DEMO-9002", "Kisii Town", 148500], ["TX-DEMO-9003", "Nakuru", 84200], ["TX-DEMO-9004", "Kisumu", 96300]].map(([ref, branch, amount]) => (
                <TableRow key={ref as string}>
                  <TableCell className="font-mono text-xs">{ref}</TableCell>
                  <TableCell className="font-medium">{branch}</TableCell>
                  <TableCell>{KES(amount as number)}</TableCell>
                  <TableCell>Today</TableCell>
                  <TableCell><Badge variant="secondary">Recorded</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </Page>
  );
}
