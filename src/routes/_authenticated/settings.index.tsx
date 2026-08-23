import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/settings/")({
  head: () => ({
    meta: [
      { title: "Settings | Transline Classic TMS" },
      { name: "description", content: "Manage your profile and system configuration." },
      { property: "og:title", content: "Settings | Transline Classic TMS" },
      { property: "og:description", content: "Manage your profile and system configuration." },
    ],
  }),
  component: SettingsIndexPage,
});

function SettingsIndexPage() {
  return (
    <Page title="Settings" description="Manage your profile and system configuration.">
      <DemoNotice />
      <SectionCard title="Settings">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link to="/settings/profile" className="rounded-xl border border-border p-4 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent">Profile</Link>
            <Link to="/settings/system" className="rounded-xl border border-border p-4 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent">System Settings</Link>
          </div>
      </SectionCard>
    </Page>
  );
}
