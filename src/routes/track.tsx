import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Parcel | Transline Classic" },
      { name: "description", content: "Track your Transline Classic parcel using its tracking code." },
    ],
  }),
  component: PublicTrackingPage,
});

function PublicTrackingPage() {
  const [code, setCode] = useState("");
  const [searchedCode, setSearchedCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("code")?.trim() ?? "";
  });

  const parcel = useQuery({
    queryKey: ["public-parcel-tracking", searchedCode],
    enabled: Boolean(searchedCode),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_parcel_tracking", {
        _tracking_code: searchedCode,
      });
      if (error) throw new Error(error.message);
      return Array.isArray(data) ? data[0] ?? null : data;
    },
  });

  function submit(e: { preventDefault: () => void }) {
    e.preventDefault();
    setSearchedCode(code.trim());
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (code.trim()) url.searchParams.set("code", code.trim());
      else url.searchParams.delete("code");
      window.history.replaceState({}, "", url);
    }
  }

  return (
    <main className="min-h-screen bg-muted/20 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Transline Classic</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Track your parcel</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the tracking code printed on your parcel receipt.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border bg-background p-5 shadow-sm">
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={submit}>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. TPABC123456"
              className="font-mono"
              aria-label="Parcel tracking code"
            />
            <Button type="submit" disabled={!code.trim()}>
              <Search className="mr-2 size-4" />
              Track parcel
            </Button>
          </form>
        </div>

        {parcel.isLoading && (
          <div className="mt-5 rounded-2xl border bg-background p-6 text-center text-sm text-muted-foreground">
            Looking up your parcel…
          </div>
        )}

        {parcel.error && (
          <div className="mt-5 rounded-2xl border border-destructive/30 bg-background p-6 text-sm text-destructive">
            We could not complete the tracking lookup. Please try again.
          </div>
        )}

        {searchedCode && !parcel.isLoading && !parcel.error && !parcel.data && (
          <div className="mt-5 rounded-2xl border bg-background p-6 text-center">
            <PackageCheck className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-semibold">Tracking code not found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check the code on your ticket and enter it again.
            </p>
          </div>
        )}

        {parcel.data && (
          <div className="mt-5 overflow-hidden rounded-2xl border bg-background shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b p-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Tracking code</p>
                <p className="mt-1 font-mono text-xl font-bold">{parcel.data.tracking_code}</p>
              </div>
              <Badge variant="secondary" className="capitalize">{parcel.data.status}</Badge>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              <div><p className="text-xs text-muted-foreground">Sender</p><p className="font-medium">{parcel.data.sender_name}</p></div>
              <div><p className="text-xs text-muted-foreground">Receiver</p><p className="font-medium">{parcel.data.receiver_name}</p></div>
              <div><p className="text-xs text-muted-foreground">From</p><p className="font-medium">{parcel.data.origin_name ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">To</p><p className="font-medium">{parcel.data.destination_name ?? "—"}</p></div>
              <div className="sm:col-span-2"><p className="text-xs text-muted-foreground">Booked</p><p className="font-medium">{parcel.data.created_at ? new Date(parcel.data.created_at).toLocaleString() : "—"}</p></div>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Keep your tracking code safe. Use this page to check the latest parcel status.
        </p>
      </div>
    </main>
  );
}
