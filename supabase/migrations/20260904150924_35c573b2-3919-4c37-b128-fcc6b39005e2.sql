DROP POLICY IF EXISTS clerk_branch_trips ON public.trips;
CREATE POLICY clerk_branch_trips ON public.trips
  FOR ALL TO authenticated
  USING (public.is_main_admin() OR branch_id = public.auth_branch())
  WITH CHECK (public.is_main_admin() OR branch_id = public.auth_branch());