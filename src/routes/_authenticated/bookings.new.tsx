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

    const { data: userData } = await supabase.au
