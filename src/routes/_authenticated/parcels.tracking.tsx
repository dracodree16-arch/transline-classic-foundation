import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/parcels/tracking")({
  head: () => ({
    meta: [
      { title: "Parcel Tracking | Transline Classic TMS" },
      { name: "description", content: "Track a parcel using its code." },
      { property: "og:title", content: "Parcel Tracking | Transline Classic TMS" },
      { property: "og:description", content: "Track a parcel using its code." },
    ],
  }),
  component: ParcelsTrackingPage,
});

function ParcelsTrackingPage() {
  return (
    <Page title="Parcel Tracking" description="Track a parcel using its code.">
      <DemoNotice />
      <SectionCard title="Track a parcel">
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input placeholder="Enter parcel code e.g. TCP-DEMO-1001" />
            <Button onClick={() => toast.info("Live tracking arrives in a later phase.")}>Track</Button>
          </div>
          <ol className="space-y-3">
            {["Booked at Nairobi CBD", "Loaded on KDU 995Y", "In transit to Kisii", "Ready for collection"].map((step, i) => (
              <li key={step} className="flex items-start gap-3 rounded-xl border border-border p-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{i + 1}</span>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </SectionCard>
    </Page>
  );
}
