import { createFileRoute } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { staff } from "@/lib/demo-data";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/staff/")({
  head: () => ({
    meta: [
      { title: "Staff List | Transline Classic TMS" },
      { name: "description", content: "All staff accounts and their assigned roles." },
      { property: "og:title", content: "Staff List | Transline Classic TMS" },
      { property: "og:description", content: "All staff accounts and their assigned roles." },
    ],
  }),
  component: StaffIndexPage,
});

function StaffIndexPage() {
  return (
    <Page title="Staff List" description="All staff accounts and their assigned roles.">
      <DemoNotice />
      <SectionCard title="Staff">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Branch</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell><Badge variant="secondary">{row.role}</Badge></TableCell>
                  <TableCell>{row.branch}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </Page>
  );
}
