import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Page, SectionCard } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings/profile")({
  head: () => ({
    meta: [
      { title: "Profile | Transline Classic TMS" },
      { name: "description", content: "Your account details and preferences." },
      { property: "og:title", content: "Profile | Transline Classic TMS" },
      { property: "og:description", content: "Your account details and preferences." },
    ],
  }),
  component: SettingsProfilePage,
});

function SettingsProfilePage() {
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [branchName, setBranchName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const id = userData.user?.id;
      if (!active) return;
      if (!id) {
        setLoading(false);
        return;
      }
      setUserId(id);
      setEmail(userData.user?.email ?? "");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, email, phone, branches(name)")
        .eq("id", id)
        .maybeSingle();

      if (!active) return;
      if (error) {
        toast.error("Failed to load profile: " + error.message);
      } else if (profile) {
        setFullName(profile.full_name ?? "");
        if (profile.email) setEmail(profile.email);
        setPhone(profile.phone ?? "");
        setBranchName((profile as any).branches?.name ?? "");
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!userId) { toast.error("You are not signed in."); return; }
    if (!fullName.trim()) { toast.error("Full name is required."); return; }

    setSubmitting(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim() || null })
      .eq("id", userId);
    setSubmitting(false);

    if (error) {
      toast.error("Failed to save profile: " + error.message);
      return;
    }
    toast.success("Profile saved.");
  }

  return (
    <Page title="Profile" description="Your account details and preferences.">
      <SectionCard title="Your profile">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} placeholder="Email" readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label>Phone number</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label>Branch</Label>
            <Input value={branchName} placeholder="No branch assigned" readOnly disabled />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting || loading}>
              {submitting ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </Page>
  );
}
