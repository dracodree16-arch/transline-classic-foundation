import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth_/pending")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Awaiting Branch Assignment | Transline Classic TMS" },
      {
        name: "description",
        content: "Your Transline Classic staff account is waiting for an administrator to assign a branch.",
      },
      { property: "og:title", content: "Awaiting Branch Assignment | Transline Classic TMS" },
      {
        property: "og:description",
        content: "Your staff account is waiting for a branch assignment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PendingPage,
});

function PendingPage() {
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md" style={{ boxShadow: "var(--shadow-elevated)" }}>
        <CardContent className="space-y-4 pt-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted">
            <Clock className="size-6 text-muted-foreground" />
          </span>
          <h1 className="text-xl font-semibold">Awaiting branch assignment</h1>
          <p className="text-sm text-muted-foreground">
            Your clerk account is active but has not been assigned to a branch yet. A Main Admin must
            assign your branch before you can access the operations dashboard.
          </p>
          <Button variant="outline" className="w-full" onClick={signOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
