import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { getStaffContext } from "@/lib/authz.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  // Server-side authorization: the role is resolved from the database by a
  // server function, never from client state.
  beforeLoad: async () => {
    const ctx = await getStaffContext();
    if (!ctx.is_active) throw redirect({ to: "/auth/disabled" });
    if (ctx.role !== "admin") throw redirect({ to: "/dashboard" });
    return { admin: ctx };
  },
  component: () => <Outlet />,
});
