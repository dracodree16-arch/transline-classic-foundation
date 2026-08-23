import { createFileRoute } from "@tanstack/react-router";
import { Page, SectionCard, DemoNotice } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/bookings/$ref")({
  head: () => ({
    meta: [
      { title: "Booking Details | Transline Classic TMS" },
      { name: "description", content: "Full ticket record, payment status and passenger information." },
      { property: "og:title", content: "Booking Details | Transline Classic TMS" },
      { property: "og:description", content: "Full ticket record, payment status and passenger information." },
    ],
  }),
  component: BookingsRefPage,
});

function BookingsRefPage() {
  const { ref } = Route.useParams();
  return (
    <Page title="Booking Details" description="Full ticket record, payment status and passenger information.">
      <DemoNotice />
      <SectionCard title="Record">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Reference</p><p className="mt-1 font-mono text-sm font-medium">{ref}</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Passenger</p><p className="mt-1 font-medium">Wanjiru Kamau</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Phone</p><p className="mt-1 font-medium">+254 712 345 601</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Route</p><p className="mt-1 font-medium">Nairobi → Kisii</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Seat</p><p className="mt-1 font-medium">12</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Fare</p><p className="mt-1 font-medium">KES 1,500</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Payment</p><p className="mt-1 font-medium">Paid (M-Pesa)</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Branch</p><p className="mt-1 font-medium">Nairobi CBD</p></div>
          </div>
      </SectionCard>
    </Page>
  );
}
