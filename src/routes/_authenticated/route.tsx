import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { roleTitle, type StaffProfile } from "@/lib/session";
import { getStaffContext } from "@/lib/authz.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    // Role, branch and status are resolved server-side from the database.
    const ctx = await getStaffContext();

    if (!ctx.is_active) {
      await supabase.auth.signOut();
      throw redirect({ to: "/auth/disabled" });
    }
    if (ctx.role === "clerk" && !ctx.branch_id) {
      throw redirect({ to: "/auth/pending" });
    }
    // Clerks never land on admin-only sections.
    if (ctx.role === "clerk" && location.pathname.startsWith("/admin")) {
      throw redirect({ to: "/dashboard" });
    }

    const profile: StaffProfile = {
      id: ctx.id,
      full_name: ctx.full_name,
      email: ctx.email ?? data.user.email ?? null,
      role: ctx.role,
      branch_id: ctx.branch_id,
      branch_name: ctx.branch_name,
      is_active: ctx.is_active,
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
