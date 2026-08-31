import { useRouteContext } from "@tanstack/react-router";

export type StaffProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "admin" | "clerk";
  branch_id: string | null;
  branch_name: string | null;
  is_active: boolean;
};

export function useStaffSession() {
  const ctx = useRouteContext({ from: "/_authenticated" }) as {
    user: { id: string; email?: string | undefined };
    profile: StaffProfile;
  };
  return {
    user: ctx.user,
    profile: ctx.profile,
    isAdmin: ctx.profile.role === "admin",
    isClerk: ctx.profile.role === "clerk",
    branchId: ctx.profile.branch_id,
    branchName: ctx.profile.branch_name,
  };
}

export const roleTitle = (role: string) => (role === "admin" ? "Main Admin" : "Clerk");
