import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/settings/profile")({
  head: () => ({
    meta: [
      { title: "Profile | Transline Classic TMS" },
      { name: "description", content: "Your account details and preferences." },
      { property: "og:title", content: "Profile | Transline Classic TMS" },
      { property: "og:description", content: "Your account details and preferences." },
    ],
  }),
  component: SettingsProfilePage,
});

function SettingsProfilePage() {
  return (
    <Page title="Profile" description="Your account details and preferences.">
      <DemoNotice />
      <SectionCard title="Your profile">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); toast.info("Demo only — saving is enabled in a later phase."); }}>
            <div className="space-y-2"><Label>Full name</Label><Input placeholder="Full name" /></div>
            <div className="space-y-2"><Label>Email</Label><Input placeholder="Email" /></div>
            <div className="space-y-2"><Label>Phone number</Label><Input placeholder="Phone number" /></div>
            <div className="space-y-2"><Label>Branch</Label><Input placeholder="Branch" /></div>
            <div className="sm:col-span-2">
              <Button type="submit">Save profile</Button>
            </div>
          </form>
      </SectionCard>
    </Page>
  );
}
