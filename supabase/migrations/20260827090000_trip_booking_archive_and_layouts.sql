ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS seat_layout jsonb;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS deletion_reason text;

CREATE INDEX IF NOT EXISTS trips_active_departure_idx ON public.trips (departure_time) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS bookings_active_created_idx ON public.bookings (created_at) WHERE deleted_at IS NULL;

CREATE OR REPLACE FUNCTION public.archive_trip(_trip_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  UPDATE public.trips
  SET deleted_at = now(), deleted_by = auth.uid()
  WHERE id = _trip_id AND deleted_at IS NULL;
  UPDATE public.bookings
  SET deleted_at = now(), deleted_by = auth.uid(), deletion_reason = 'Trip archived'
  WHERE trip_id = _trip_id AND deleted_at IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_trip(_trip_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  UPDATE public.trips SET deleted_at = NULL, deleted_by = NULL WHERE id = _trip_id;
  UPDATE public.bookings SET deleted_at = NULL, deleted_by = NULL, deletion_reason = NULL WHERE trip_id = _trip_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.archive_trip(uuid), public.restore_trip(uuid) TO authenticated;

DROP POLICY IF EXISTS clerk_read_branches ON public.branches;
CREATE POLICY clerk_read_branches ON public.branches FOR SELECT TO authenticated
  USING (id = public.auth_branch() OR public.is_main_admin());
DROP POLICY IF EXISTS clerk_read_routes ON public.routes;
CREATE POLICY clerk_read_routes ON public.routes FOR SELECT TO authenticated
  USING (branch_id = public.auth_branch() OR public.is_main_admin());
DROP POLICY IF EXISTS clerk_read_buses ON public.buses;
CREATE POLICY clerk_read_buses ON public.buses FOR SELECT TO authenticated
  USING (public.is_main_admin() OR EXISTS (SELECT 1 FROM public.trips t WHERE t.bus_plate = buses.plate_number AND t.branch_id = public.auth_branch()));

CREATE OR REPLACE FUNCTION public.is_main_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' AND is_active);
$$;
REVOKE EXECUTE ON FUNCTION public.is_main_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_main_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.archive_booking(_booking_id uuid, _reason text DEFAULT NULL)
RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path = public AS $$
  UPDATE public.bookings SET deleted_at = now(), deleted_by = auth.uid(), deletion_reason = _reason
  WHERE id = _booking_id AND deleted_at IS NULL;
$$;
GRANT EXECUTE ON FUNCTION public.archive_booking(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.restore_booking(_booking_id uuid)
RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path = public AS $$
  UPDATE public.bookings SET deleted_at = NULL, deleted_by = NULL, deletion_reason = NULL WHERE id = _booking_id;
$$;
GRANT EXECUTE ON FUNCTION public.restore_booking(uuid) TO authenticated;

UPDATE public.trips SET seat_layout = jsonb_build_object('columns', 4, 'aisle_after', 2, 'seats', (
  SELECT jsonb_agg(jsonb_build_object('id', s::text, 'row', ((s - 1) / 4) + 1, 'column', ((s - 1) % 4) + 1, 'active', true))
  FROM generate_series(1, total_seats) s
)) WHERE seat_layout IS NULL;

