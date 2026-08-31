import { useMatches } from "@tanstack/react-router";

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
  const matches = useMatches();
  const authenticatedMatch = matches.find((match) => match.id === "/_authenticated");
  const ctx = authenticatedMatch?.context as {
    user: { id: string; email?: string | undefined };
    profile: StaffProfile;
  } | undefined;

  if (!ctx) {
    throw new Error("Staff session context is unavailable outside the authenticated route.");
  }
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
