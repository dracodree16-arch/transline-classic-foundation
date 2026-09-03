-- 1. Guard: only admins may change role/branch/is_active; protect last active admin
CREATE OR REPLACE FUNCTION public.profiles_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_other_admins int;
BEGIN
  v_is_admin := public.is_main_admin();

  IF TG_OP = 'UPDATE' THEN
    IF (NEW.role IS DISTINCT FROM OLD.role
        OR NEW.branch_id IS DISTINCT FROM OLD.branch_id
        OR NEW.is_active IS DISTINCT FROM OLD.is_active)
       AND auth.uid() IS NOT NULL AND NOT v_is_admin THEN
      RAISE EXCEPTION 'FORBIDDEN: only administrators can change role, branch or status';
    END IF;
  END IF;

  IF OLD.role = 'admin' AND OLD.is_active
     AND (TG_OP = 'DELETE' OR NEW.role IS DISTINCT FROM 'admin'::user_role OR NEW.is_active = false) THEN
    SELECT count(*) INTO v_other_admins
    FROM public.profiles
    WHERE role = 'admin' AND is_active AND id <> OLD.id;
    IF v_other_admins = 0 THEN
      RAISE EXCEPTION 'LAST_ADMIN: cannot remove or deactivate the last active administrator';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_guard ON public.profiles;
CREATE TRIGGER trg_profiles_guard
BEFORE UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_guard();

-- 2. Audit role / branch / status changes
CREATE OR REPLACE FUNCTION public.profiles_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.branch_id IS DISTINCT FROM OLD.branch_id
     OR NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (
      auth.uid(),
      'profile_access_change',
      'profile',
      NEW.id,
      jsonb_build_object(
        'old', jsonb_build_object('role', OLD.role, 'branch_id', OLD.branch_id, 'is_active', OLD.is_active),
        'new', jsonb_build_object('role', NEW.role, 'branch_id', NEW.branch_id, 'is_active', NEW.is_active)
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_audit ON public.profiles;
CREATE TRIGGER trg_profiles_audit
AFTER UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_audit();

-- 3. Archive / restore bookings and trips (soft delete)
CREATE OR REPLACE FUNCTION public.archive_booking(_booking_id uuid, _reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE public.bookings SET deleted_at = now() WHERE id = _booking_id AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'BOOKING_NOT_FOUND_OR_ARCHIVED'; END IF;
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), 'archive_booking', 'booking', _booking_id, jsonb_build_object('reason', _reason));
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_booking(_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE public.bookings SET deleted_at = NULL WHERE id = _booking_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'BOOKING_NOT_FOUND'; END IF;
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id)
  VALUES (auth.uid(), 'restore_booking', 'booking', _booking_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.archive_trip(_trip_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE public.trips SET deleted_at = now() WHERE id = _trip_id AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'TRIP_NOT_FOUND_OR_ARCHIVED'; END IF;
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id)
  VALUES (auth.uid(), 'archive_trip', 'trip', _trip_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_trip(_trip_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE public.trips SET deleted_at = NULL WHERE id = _trip_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'TRIP_NOT_FOUND'; END IF;
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id)
  VALUES (auth.uid(), 'restore_trip', 'trip', _trip_id);
END;
$$;

REVOKE ALL ON FUNCTION public.archive_booking(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.restore_booking(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.archive_trip(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.restore_trip(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.archive_booking(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_booking(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_trip(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_trip(uuid) TO authenticated;