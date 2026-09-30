-- Safe public parcel tracking endpoint.
-- This exposes tracking information only through a SECURITY DEFINER function,
-- without granting anonymous access to the parcels table.

CREATE OR REPLACE FUNCTION public.get_public_parcel_tracking(_tracking_code text)
RETURNS TABLE (
  tracking_code text,
  sender_name text,
  receiver_name text,
  status text,
  created_at timestamptz,
  origin_name text,
  destination_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.tracking_code,
    p.sender_name,
    p.receiver_name,
    p.status,
    p.created_at,
    ob.name AS origin_name,
    db.name AS destination_name
  FROM public.parcels p
  LEFT JOIN public.branches ob ON ob.id = p.origin_branch_id
  LEFT JOIN public.branches db ON db.id = p.destination_branch_id
  WHERE upper(p.tracking_code) = upper(trim(_tracking_code))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_parcel_tracking(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_parcel_tracking(text) TO anon, authenticated;
