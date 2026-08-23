import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/settings/system")({
  head: () => ({
    meta: [
      { title: "System Settings | Transline Classic TMS" },
      { name: "description", content: "Company, branch and operational configuration." },
      { property: "og:title", content: "System Settings | Transline Classic TMS" },
      { property: "og:description", content: "Company, branch and operational configuration." },
    ],
  }),
  component: SettingsSystemPage,
});

function SettingsSystemPage() {
  return (
    <Page title="System Settings" description="Company, branch and operational configuration.">
      <DemoNotice />
      <SectionCard title="Company configuration">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); toast.info("Demo only — saving is enabled in a later phase."); }}>
            <div className="space-y-2"><Label>Company name</Label><Input placeholder="Company name" /></div>
            <div className="space-y-2"><Label>Head office</Label><Input placeholder="Head office" /></div>
            <div className="space-y-2"><Label>Default currency</Label><Input placeholder="Default currency" /></div>
            <div className="space-y-2"><Label>Booking timeout (minutes)</Label><Input placeholder="Booking timeout (minutes)" /></div>
            <div className="space-y-2"><Label>Support phone</Label><Input placeholder="Support phone" /></div>
            <div className="space-y-2"><Label>Support email</Label><Input placeholder="Support email" /></div>
            <div className="sm:col-span-2">
              <Button type="submit">Save settings</Button>
            </div>
          </form>
      </SectionCard>
    </Page>
  );
}
