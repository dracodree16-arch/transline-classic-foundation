import { createFileRoute } from "@tanstack/react-router";

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
  return (
    <main className="min-h-screen bg-muted/20 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border bg-background p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Transline Classic</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Track your parcel</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your tracking code to check the latest parcel status.
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            Public parcel tracking is being prepared. Please keep your tracking code.
          </p>
        </div>
      </div>
    </main>
  );
}
