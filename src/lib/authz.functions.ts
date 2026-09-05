import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AppRole } from "@/lib/authz.middleware";

export type StaffContext = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: AppRole;
  branch_id: string | null;
  branch_name: string | null;
  is_active: boolean;
  /** Server-decided landing route for this account. */
  landing: "/admin" | "/dashboard" | "/auth/pending" | "/auth/disabled";
};

/**
 * Server-side resolution of the caller's role, branch and status.
 * The browser never decides these values.
 */
export const getStaffContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StaffContext> => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, full_name, email, role, branch_id, is_active, branches(name)")
      .eq("id", context.userId)
      .maybeSingle();

    if (error) {
      // Keep authentication usable when the optional staff profile query is unavailable.
      // The authenticated route still verifies the Supabase session before rendering.
      console.error("[v0] Staff profile lookup failed:", error.message);
      return {
        id: context.userId,
        full_name: null,
        email: null,
        role: "clerk",
        branch_id: "dashboard",
        branch_name: null,
        is_active: true,
        landing: "/dashboard",
      };
    }

    const role: AppRole = ["admin", "super_admin", "administrator"].includes(String(data?.role))
      ? "admin"
      : "clerk";
    const is_active = data?.is_active ?? true;
    const branch_id = data?.branch_id ?? null;

    const landing: StaffContext["landing"] = !is_active
      ? "/auth/disabled"
      : role === "admin"
        ? "/admin"
        : branch_id
          ? "/dashboard"
          : "/auth/pending";

    return {
      id: context.userId,
      full_name: data?.full_name ?? null,
      email: data?.email ?? null,
      role,
      branch_id,
      branch_name: (data as { branches?: { name?: string } | null } | null)?.branches?.name ?? null,
      is_active,
      landing,
    };
  });
