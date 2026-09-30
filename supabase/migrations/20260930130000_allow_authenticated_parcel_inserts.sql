-- Allow authenticated staff to create parcel records they book themselves.
-- Keep row-level security enabled and bind the insert to the signed-in user.

ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can create parcels" ON public.parcels;

CREATE POLICY "Authenticated users can create parcels"
ON public.parcels
FOR INSERT
TO authenticated
WITH CHECK (booked_by = auth.uid());
