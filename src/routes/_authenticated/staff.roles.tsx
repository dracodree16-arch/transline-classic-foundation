import { createFileRoute } from "@tanstack/react-router";
import { APP_ROLES } from "@/lib/nav";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/staff/roles")({
  head: () => ({
    meta: [
      { title: "Roles & Permissions | Transline Classic TMS" },
      { name: "description", content: "The eight access levels used across the system." },
      { property: "og:title", content: "Roles & Permissions | Transline Classic TMS" },
      { property: "og:description", content: "The eight access levels used across the system." },
    ],
  }),
  component: StaffRolesPage,
});

function StaffRolesPage() {
  return (
    <Page title="Roles & Permissions" description="The eight access levels used across the system.">
      <DemoNotice />
      <SectionCard title="Access levels">
        <div className="grid gap-3 md:grid-cols-2">
          {APP_ROLES.map((role) => (
            <div key={role.value} className="rounded-xl border border-border p-4">
              <p className="font-medium">{role.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{role.description}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </Page>
  );
}
