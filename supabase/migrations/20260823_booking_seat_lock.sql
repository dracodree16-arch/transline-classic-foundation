-- Prevent two active bookings from claiming the same seat on the same trip.
-- "Cancelled" bookings don't block the seat from being rebooked.
create unique index if not exists bookings_trip_seat_active_unique
  on public.bookings (trip_id, seat_number)
  where payment_status is distinct from 'cancelled' and seat_number is not null;

-- Keep trips.seats_booked in sync automatically whenever bookings change.
create or replace function public.sync_trip_seats_booked()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_trip_id uuid;
begin
  affected_trip_id := coalesce(new.trip_id, old.trip_id);

  update public.trips
  set seats_booked = (
    select count(*)
    from public.bookings
    where trip_id = affected_trip_id
      and payment_status is distinct from 'cancelled'
      and seat_number is not null
  )
  where id = affected_trip_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_sync_trip_seats_booked on public.bookings;
create trigger trg_sync_trip_seats_booked
after insert or update or delete on public.bookings
for each row execute function public.sync_trip_seats_booked();
