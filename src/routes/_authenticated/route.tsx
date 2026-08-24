import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { roleTitle, type StaffProfile } from "@/lib/session";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    const { data: row } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, branch_id, is_active, branches(name)")
      .eq("id", data.user.id)
      .maybeSingle();

    if (row && row.is_active === false) {
      await supabase.auth.signOut();
      throw redirect({ to: "/auth" });
    }

    const profile: StaffProfile = {
      id: data.user.id,
      full_name: row?.full_name ?? null,
      email: row?.email ?? data.user.email ?? null,
      role: (row?.role as "admin" | "clerk") ?? "clerk",
      branch_id: row?.branch_id ?? null,
      branch_name: (row as { branches?: { name?: string } | null } | null)?.branches?.name ?? null,
      is_active: row?.is_active ?? true,
    };

    return { user: data.user, profile };
  },
  component: AppLayout,
});

function AppLayout() {
  const { user, profile } = Route.useRouteContext();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar role={profile.role} />
        <SidebarInset className="min-w-0">
          <AppTopbar
            email={profile.email ?? user.email ?? "staff@translineclassic.co.ke"}
            role={roleTitle(profile.role)}
            branch={profile.branch_name}
          />
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
