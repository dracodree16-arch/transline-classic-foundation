import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Page, SectionCard } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/bookings/new")({
  head: () => ({
    meta: [
      { title: "New Booking | Transline Classic TMS" },
      { name: "description", content: "Capture passenger details and issue a ticket." },
      { property: "og:title", content: "New Booking | Transline Classic TMS" },
      { property: "og:description", content: "Capture passenger details and issue a ticket." },
    ],
  }),
  component: BookingsNewPage,
});

type TripOption = {
  id: string;
  departure_time: string;
  bus_plate: string | null;
  total_seats: number;
  seats_booked: number;
  destination: string | null;
  origin_town: string | null;
  base_fare: number | null;
};

function BookingsNewPage() {
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [takenSeats, setTakenSeats] = useState<Set<string>>(new Set());
  const [selectedSeat, setSelectedSeat] = useState<string>("");
  const [loadingSeats, setLoadingSeats] = useState(false);

  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [fare, setFare] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingTrips(true);
      const { data, error } = await supabase
        .from("trips")
        .select(
          "id, departure_time, bus_plate, total_seats, seats_booked, routes(destination, base_fare, branches(name, town))"
        )
        .gte("departure_time", new Date().toISOString())
        .order("departure_time", { ascending: true });

      if (!active) return;
      if (error) {
        toast.error("Failed to load trips: " + error.message);
        setTrips([]);
      } else {
        setTrips(
          (data ?? []).map((t: any) => ({
            id: t.id,
            departure_time: t.departure_time,
            bus_plate: t.bus_plate,
            total_seats: t.total_seats,
            seats_booked: t.seats_booked,
            destination: t.routes?.destination ?? null,
            origin_town: t.routes?.branches?.town ?? t.routes?.branches?.name ?? null,
            base_fare: t.routes?.base_fare ?? null,
          }))
        );
      }
      setLoadingTrips(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const selectedTrip = trips.find((t) => t.id === selectedTripId) ?? null;

  async function loadTakenSeats(tripId: string) {
    setLoadingSeats(true);
    const { data, error } = await supabase.rpc("get_taken_seats", { _trip_id: tripId });
    if (error) {
      toast.error("Failed to load seat availability: " + error.message);
      setTakenSeats(new Set());
    } else {
      setTakenSeats(new Set((data ?? []).map((r: { seat_number: string }) => r.seat_number)));
    }
    setLoadingSeats(false);
  }

  useEffect(() => {
    setSelectedSeat("");
    if (selectedTripId) {
      loadTakenSeats(selectedTripId);
    } else {
      setTakenSeats(new Set());
    }
  }, [selectedTripId]);

  useEffect(() => {
    if (selectedTrip?.base_fare != null) {
      setFare(String(selectedTrip.base_fare));
    }
  }, [selectedTripId]);

  async function handleSubmit(e: { preventDefault: () => void })  {
    e.preventDefault();

    if (!selectedTripId) return toast.error("Select a trip first.");
    if (!selectedSeat) return toast.error("Select a seat.");
    if (!passengerName.trim()) return toast.error("Passenger name is required.");
    if (!passengerPhone.trim()) return toast.error("Phone number is required.");
    if (!fare || Number(fare) <= 0) return toast.error("Enter a valid fare.");

    setSubmitting(true);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    const { data: profile } = await supabase
      .from("profiles")
      .select("branch_id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.branch_id) {
      setSubmitting(false);
      return toast.error("Your account has no branch assigned. Contact an admin.");
    }

    const bookingRef = `BK${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        trip_id: selectedTripId,
        seat_number: selectedSeat,
        passenger_name: passengerName.trim(),
        passenger_phone: passengerPhone.trim(),
        fare_amount: Number(fare),
        payment_status: "pending",
        branch_id: profile.branch_id,
        booked_by: userId,
        booking_ref: bookingRef,
      })
      .select()
      .single();

    if (error) {
      setSubmitting(false);
      if (error.code === "23505") {
        toast.error("That seat was just taken. Pick another seat.");
        loadTakenSeats(selectedTripId);
        setSelectedSeat("");
      } else {
        toast.error("Failed to create booking: " + error.message);
      }
      return;
    }

    if (idNumber.trim() && booking) {
      await supabase.from("passengers").insert({
        booking_id: booking.id,
        full_name: passengerName.trim(),
        phone: passengerPhone.trim(),
        id_number: idNumber.trim(),
        seat_number: selectedSeat,
      });
    }

    toast.success(`Booking ${bookingRef} created — seat ${selectedSeat}`);
    setPassengerName("");
    setPassengerPhone("");
    setIdNumber("");
    setSelectedSeat("");
    if (selectedTripId) loadTakenSeats(selectedTripId);
    setSubmitting(false);
  }

  const seatNumbers = selectedTrip
    ? Array.from({ length: selectedTrip.total_seats }, (_, i) => String(i + 1))
    : [];

  return (
    <Page title="New Booking" description="Capture passenger details and issue a ticket.">
      <SectionCard title="Trip">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Trip</Label>
            <Select
              value={selectedTripId}
              onValueChange={setSelectedTripId}
              disabled={loadingTrips}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingTrips ? "Loading trips…" : "Select a trip"} />
              </SelectTrigger>
              <SelectContent>
                {trips.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {(t.origin_town ?? "—") + " → " + (t.destination ?? "—")} ·{" "}
                    {new Date(t.departure_time).toLocaleString()} · {t.bus_plate ?? "no bus"} (
                    {t.total_seats - t.seats_booked} seats left)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      {selectedTrip && (
        <SectionCard title="Select seat">
          {loadingSeats ? (
            <p className="text-sm text-muted-foreground">Loading seat availability…</p>
          ) : (
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
              {seatNumbers.map((seat) => {
                const taken = takenSeats.has(seat);
                const active = selectedSeat === seat;
                return (
                  <button
                    key={seat}
                    type="button"
                    disabled={taken}
                    onClick={() => setSelectedSeat(seat)}
                    className={[
                      "rounded-md border px-2 py-2 text-sm font-medium transition-colors",
                      taken
                        ? "cursor-not-allowed border-muted bg-muted text-muted-foreground"
                        : active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background hover:bg-accent",
                    ].join(" ")}
                  >
                    {seat}
                  </button>
                );
              })}
            </div>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {takenSeats.size} of {selectedTrip.total_seats} seats booked
          </p>
        </SectionCard>
      )}

      <SectionCard title="Passenger">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Passenger name</Label>
            <Input value={passengerName} onChange={(e) => setPassengerName(e.target.value)} placeholder="Passenger name" />
          </div>
          <div className="space-y-2">
            <Label>Phone number</Label>
            <Input value={passengerPhone} onChange={(e) => setPassengerPhone(e.target.value)} placeholder="Phone number" />
          </div>
          <div className="space-y-2">
            <Label>ID number</Label>
            <Input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="ID number (optional)" />
          </div>
          <div className="space-y-2">
            <Label>Seat number</Label>
            <Input value={selectedSeat} readOnly placeholder="Select a seat above" />
          </div>
          <div className="space-y-2">
            <Label>Fare (KES)</Label>
            <Input value={fare} onChange={(e) => setFare(e.target.value)} placeholder="Fare (KES)" type="number" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting || !selectedTripId || !selectedSeat}>
              {submitting ? "Creating…" : "Create booking"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </Page>
  );
}
