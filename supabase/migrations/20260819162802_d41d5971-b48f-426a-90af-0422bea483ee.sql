CREATE OR REPLACE FUNCTION public.auth_branch()
 RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $function$ select branch_id from profiles where id = auth.uid(); $function$;

CREATE OR REPLACE FUNCTION public.auth_role()
 RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $function$ select role from profiles where id = auth.uid(); $function$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_staff_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.expire_pending_bookings() FROM anon, authenticated;