import { createFileRoute } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KES, expenses } from "@/lib/demo-data";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/finance/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses | Transline Classic TMS" },
      { name: "description", content: "Fuel, maintenance and branch running costs." },
      { property: "og:title", content: "Expenses | Transline Classic TMS" },
      { property: "og:description", content: "Fuel, maintenance and branch running costs." },
    ],
  }),
  component: FinanceExpensesPage,
});

function FinanceExpensesPage() {
  return (
    <Page title="Expenses" description="Fuel, maintenance and branch running costs.">
      <DemoNotice />
      <SectionCard title="Expenses">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Branch</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.branch}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>{KES(row.amount)}</TableCell>
                  <TableCell>{row.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </Page>
  );
}
