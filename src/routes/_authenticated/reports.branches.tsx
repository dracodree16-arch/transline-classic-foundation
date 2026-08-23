import { createFileRoute } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { branches } from "@/lib/demo-data";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/reports/branches")({
  head: () => ({
    meta: [
      { title: "Branch Reports | Transline Classic TMS" },
      { name: "description", content: "Performance comparison across branches." },
      { property: "og:title", content: "Branch Reports | Transline Classic TMS" },
      { property: "og:description", content: "Performance comparison across branches." },
    ],
  }),
  component: ReportsBranchesPage,
});

function ReportsBranchesPage() {
  return (
    <Page title="Branch Reports" description="Performance comparison across branches.">
      <DemoNotice />
      <SectionCard title="Branches">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Branch</TableHead><TableHead>Town</TableHead><TableHead>Phone</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.town}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </Page>
  );
}
