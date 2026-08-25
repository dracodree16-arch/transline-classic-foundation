import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Page, SectionCard } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { listStaff, updateStaff } from "@/lib/staff.functions";
import { useStaffSession } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/staff/$id")({
  head: () => ({
    meta: [
      { title: "Edit Staff | Transline Classic TMS" },
      { name: "description", content: "Update a staff member's branch, role and access." },
      { property: "og:title", content: "Edit Staff | Transline Classic TMS" },
      { property: "og:description", content: "Update a staff member's branch, role and access." },
    ],
  }),
  component: StaffIdPage,
});

function StaffIdPage() {
  const { id } = Route.useParams();
  const { isAdmin } = useStaffSession();
  const queryClient = useQueryClient();
  const fetchStaff = useServerFn(listStaff);
  const patchStaff = useServerFn(updateStaff);

  const { data: staff } = useQuery({
    queryKey: ["staff"],
    queryFn: () => fetchStaff(),
    enabled: isAdmin,
  });
  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("branches").select("id, name").order("name");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const member = staff?.find((s) => s.id === id) ?? null;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [branchId, setBranchId] = useState("");
  const [role, setRole] = useState<"admin" | "clerk">("clerk");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!member) return;
    setFullName(member.full_name ?? "");
    setPhone(member.phone ?? "");
    setBranchId(member.branch_id ?? "");
    setRole(member.role);
    setIsActive(member.is_active);
  }, [member?.id]);

  const save = useMutation({
    mutationFn: () =>
      patchStaff({
        data: {
          id,
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          branch_id: branchId || null,
          role,
          is_active: isActive,
        },
      }),
    onSuccess: () => {
      toast.success("Staff account updated");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isAdmin) {
    return (
      <Page title="Staff" description="Main admin only.">
        <SectionCard title="Restricted">
          <p className="text-sm text-muted-foreground">Only the main admin can manage staff accounts.</p>
        </SectionCard>
      </Page>
    );
  }

  return (
    <Page title={member?.full_name ?? "Staff member"} description={member?.email ?? "Staff profile"}>
      <SectionCard title="Account">
        {!member ? (
          <p className="text-sm text-muted-foreground">Loading staff record…</p>
        ) : (
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {(branches ?? []).map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "admin" | "clerk")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clerk">Clerk</SelectItem>
                  <SelectItem value="admin">Main Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} id="active" />
              <Label htmlFor="active">Account active</Label>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        )}
      </SectionCard>
    </Page>
  );
}
