import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Page, SectionCard } from "@/components/page-shell";
import { QueryState } from "@/components/query-state";
import { KES, dateOnly } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

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
  const { data, isLoading, error } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("id, category, description, amount, spent_at, branches(name)")
        .order("spent_at", { ascending: false })
        .limit(300);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const rows = data ?? [];

  return (
    <Page title="Expenses" description="Fuel, maintenance and branch running costs.">
      <SectionCard title="Expenses">
        <QueryState isLoading={isLoading} error={error} isEmpty={rows.length === 0} emptyMessage="No expenses recorded yet.">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead><TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.branches?.name ?? "—"}</TableCell>
                    <TableCell className="capitalize">{row.category}</TableCell>
                    <TableCell>{row.description ?? "—"}</TableCell>
                    <TableCell>{KES(row.amount)}</TableCell>
                    <TableCell>{dateOnly(row.spent_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </QueryState>
      </SectionCard>
    </Page>
  );
}
