import { createMiddleware } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AppRole = "admin" | "clerk";

export type AuthzProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: AppRole;
  branch_id: string | null;
  branch_name: string | null;
  is_active: boolean;
};

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * requireAuth — validates the Supabase bearer token and loads the caller's
 * profile (role / branch / active status) from the database. Role and branch
 * are NEVER taken from the client.
 */
export const requireAuth = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, full_name, email, role, branch_id, is_active, branches(name)")
      .eq("id", context.userId)
      .maybeSingle();

    if (error) throw new HttpError(500, error.message);
    if (!data) throw new HttpError(403, "No staff profile found for this account");

    const profile: AuthzProfile = {
      id: data.id,
      full_name: data.full_name ?? null,
      email: data.email ?? null,
      role: (data.role as AppRole) ?? "clerk",
      branch_id: data.branch_id ?? null,
      branch_name:
        (data as { branches?: { name?: string } | null }).branches?.name ?? null,
      is_active: data.is_active ?? true,
    };

    if (!profile.is_active) throw new HttpError(403, "Account disabled");

    return next({ context: { profile } });
  });

/** requireAdmin — main admin only. */
export const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireAuth])
  .server(async ({ next, context }) => {
    if (context.profile.role !== "admin") {
      throw new HttpError(403, "Forbidden — administrators only");
    }
    return next();
  });

/** requireClerk — active clerk with an assigned branch. */
export const requireClerk = createMiddleware({ type: "function" })
  .middleware([requireAuth])
  .server(async ({ next, context }) => {
    if (context.profile.role !== "clerk") {
      throw new HttpError(403, "Forbidden — clerks only");
    }
    if (!context.profile.branch_id) {
      throw new HttpError(403, "No branch assigned to this clerk");
    }
    return next();
  });

/** requireAdminOrClerk — any active staff member. */
export const requireAdminOrClerk = createMiddleware({ type: "function" })
  .middleware([requireAuth])
  .server(async ({ next, context }) => {
    const role = context.profile.role;
    if (role !== "admin" && role !== "clerk") {
      throw new HttpError(403, "Forbidden");
    }
    return next();
  });

/**
 * requireBranchAccess — call inside a handler. Admins pass for any branch;
 * clerks only for their own assigned branch. Returns the branch id that must
 * be used for the query (always server-derived for clerks).
 */
export function requireBranchAccess(profile: AuthzProfile, branchId?: string | null): string | null {
  if (profile.role === "admin") return branchId ?? null;
  if (!profile.branch_id) throw new HttpError(403, "No branch assigned to this clerk");
  if (branchId && branchId !== profile.branch_id) {
    throw new HttpError(403, "Forbidden — you can only access your own branch");
  }
  return profile.branch_id;
}
