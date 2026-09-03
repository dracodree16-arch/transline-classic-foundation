import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth_/disabled")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Account Disabled | Transline Classic TMS" },
      {
        name: "description",
        content: "This Transline Classic staff account has been deactivated by an administrator.",
      },
      { property: "og:title", content: "Account Disabled | Transline Classic TMS" },
      { property: "og:description", content: "This staff account has been deactivated." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DisabledPage,
});

function DisabledPage() {
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md" style={{ boxShadow: "var(--shadow-elevated)" }}>
        <CardContent className="space-y-4 pt-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10">
            <ShieldAlert className="size-6 text-destructive" />
          </span>
          <h1 className="text-xl font-semibold">Account disabled</h1>
          <p className="text-sm text-muted-foreground">
            Your access to the Transline Classic system has been deactivated. Please contact the Main
            Admin if you believe this is a mistake.
          </p>
          <Button variant="outline" className="w-full" onClick={signOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
