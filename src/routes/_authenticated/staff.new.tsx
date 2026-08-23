import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/staff/new")({
  head: () => ({
    meta: [
      { title: "Add Staff | Transline Classic TMS" },
      { name: "description", content: "Invite a staff member and assign a role." },
      { property: "og:title", content: "Add Staff | Transline Classic TMS" },
      { property: "og:description", content: "Invite a staff member and assign a role." },
    ],
  }),
  component: StaffNewPage,
});

function StaffNewPage() {
  return (
    <Page title="Add Staff" description="Invite a staff member and assign a role.">
      <DemoNotice />
      <SectionCard title="Staff details">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); toast.info("Demo only — saving is enabled in a later phase."); }}>
            <div className="space-y-2"><Label>Full name</Label><Input placeholder="Full name" /></div>
            <div className="space-y-2"><Label>Work email</Label><Input placeholder="Work email" /></div>
            <div className="space-y-2"><Label>Phone number</Label><Input placeholder="Phone number" /></div>
            <div className="space-y-2"><Label>Branch</Label><Input placeholder="Branch" /></div>
            <div className="space-y-2"><Label>Role</Label><Input placeholder="Role" /></div>
            <div className="space-y-2"><Label>Employee number</Label><Input placeholder="Employee number" /></div>
            <div className="sm:col-span-2">
              <Button type="submit">Invite staff</Button>
            </div>
          </form>
      </SectionCard>
    </Page>
  );
}
