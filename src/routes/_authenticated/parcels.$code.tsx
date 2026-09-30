import { createFileRoute } from "@tanstack/react-router";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/parcels/$code")({
  head: () => ({
    meta: [
      { title: "Parcel Details | Transline Classic TMS" },
      { name: "description", content: "Sender, receiver, charges and delivery status." },
      { property: "og:title", content: "Parcel Details | Transline Classic TMS" },
      { property: "og:description", content: "Sender, receiver, charges and delivery status." },
    ],
  }),
  component: ParcelsCodePage,
});

function ParcelsCodePage() {
  const { code } = Route.useParams();
  return (
    <Page title="Parcel Details" description="Sender, receiver, charges and delivery status.">
      <DemoNotice />
      <SectionCard title="Record">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Reference</p><p className="mt-1 font-mono text-sm font-medium">{code}</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Sender</p><p className="mt-1 font-medium">Peter Mwangi</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Receiver</p><p className="mt-1 font-medium">Jane Moraa</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">From</p><p className="mt-1 font-medium">Nairobi CBD</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">To</p><p className="mt-1 font-medium">Kisii Town</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Weight</p><p className="mt-1 font-medium">1.5 kg</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Charge</p><p className="mt-1 font-medium">KES 300</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Status</p><p className="mt-1 font-medium">In transit</p></div>
          </div>
      </SectionCard>
    </Page>
  );
}
