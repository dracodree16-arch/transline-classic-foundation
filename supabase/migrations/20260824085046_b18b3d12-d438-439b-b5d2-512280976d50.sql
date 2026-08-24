-- 1. Profile fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS email text;

UPDATE public.profiles p SET email = u.email FROM auth.users u WHERE u.id = p.id AND p.email IS NULL;

-- Promote the single existing staff account to Main Admin
UPDATE public.profiles SET role = 'admin' WHERE id = '633c0ec9-7a04-498a-ae36-8d837a6532a3';

-- 2. Trip dispatch fields
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS driver_name text,
  ADD COLUMN IF NOT EXISTS driver_phone text,
  ADD COLUMN IF NOT EXISTS dispatch_status text NOT NULL DEFAULT 'boarding';

-- 3. Helper
CREATE OR REPLACE FUNCTION public.is_main_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' AND is_active);
$$;
REVOKE EXECUTE ON FUNCTION public.is_main_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_main_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.auth_branch()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT branch_id FROM public.profiles WHERE id = auth.uid() AND is_active;
$$;

-- 4. Remove the permissive cross-branch read policies
DROP POLICY IF EXISTS staff_read_bookings ON public.bookings;
DROP POLICY IF EXISTS staff_read_parcels ON public.parcels;
DROP POLICY IF EXISTS staff_read_trips ON public.trips;
DROP POLICY IF EXISTS staff_read_expenses ON public.expenses;
DROP POLICY IF EXISTS passengers_read ON public.passengers;
DROP POLICY IF EXISTS passengers_write ON public.passengers;

-- 5. Bookings: admin everywhere, clerk own branch only
DROP POLICY IF EXISTS admin_full_bookings ON public.bookings;
DROP POLICY IF EXISTS clerk_branch_bookings ON public.bookings;
CREATE POLICY admin_full_bookings ON public.bookings FOR ALL TO authenticated
  USING (public.is_main_admin()) WITH CHECK (public.is_main_admin());
CREATE POLICY clerk_branch_bookings ON public.bookings FOR ALL TO authenticated
  USING (branch_id = public.auth_branch()) WITH CHECK (branch_id = public.auth_branch());

-- 6. Passengers: reachable only through a booking the user can see
CREATE POLICY passengers_branch_access ON public.passengers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = passengers.booking_id
                 AND (public.is_main_admin() OR b.branch_id = public.auth_branch())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = passengers.booking_id
                 AND (public.is_main_admin() OR b.branch_id = public.auth_branch())));

-- 7. Trips
DROP POLICY IF EXISTS admin_full_trips ON public.trips;
DROP POLICY IF EXISTS clerk_branch_trips ON public.trips;
CREATE POLICY admin_full_trips ON public.trips FOR ALL TO authenticated
  USING (public.is_main_admin()) WITH CHECK (public.is_main_admin());
CREATE POLICY clerk_branch_trips ON public.trips FOR ALL TO authenticated
  USING (branch_id = public.auth_branch()) WITH CHECK (branch_id = public.auth_branch());

-- 8. Parcels: clerk sees parcels sent from or arriving at their branch
DROP POLICY IF EXISTS admin_full_parcels ON public.parcels;
DROP POLICY IF EXISTS clerk_branch_parcels ON public.parcels;
CREATE POLICY admin_full_parcels ON public.parcels FOR ALL TO authenticated
  USING (public.is_main_admin()) WITH CHECK (public.is_main_admin());
CREATE POLICY clerk_branch_parcels ON public.parcels FOR ALL TO authenticated
  USING (origin_branch_id = public.auth_branch() OR destination_branch_id = public.auth_branch())
  WITH CHECK (origin_branch_id = public.auth_branch());

-- 9. Expenses (finance is admin-only for clerks' global view, but branch expenses stay branch-scoped)
DROP POLICY IF EXISTS admin_full_expenses ON public.expenses;
DROP POLICY IF EXISTS clerk_branch_expenses ON public.expenses;
CREATE POLICY admin_full_expenses ON public.expenses FOR ALL TO authenticated
  USING (public.is_main_admin()) WITH CHECK (public.is_main_admin());
CREATE POLICY clerk_branch_expenses ON public.expenses FOR ALL TO authenticated
  USING (branch_id = public.auth_branch()) WITH CHECK (branch_id = public.auth_branch());

-- 10. Reference data
DROP POLICY IF EXISTS admin_full_branches ON public.branches;
DROP POLICY IF EXISTS clerk_read_branches ON public.branches;
CREATE POLICY admin_full_branches ON public.branches FOR ALL TO authenticated
  USING (public.is_main_admin()) WITH CHECK (public.is_main_admin());

DROP POLICY IF EXISTS admin_full_routes ON public.routes;
DROP POLICY IF EXISTS clerk_read_routes ON public.routes;
CREATE POLICY admin_full_routes ON public.routes FOR ALL TO authenticated
  USING (public.is_main_admin()) WITH CHECK (public.is_main_admin());

DROP POLICY IF EXISTS buses_write ON public.buses;
CREATE POLICY buses_write ON public.buses FOR ALL TO authenticated
  USING (public.is_main_admin()) WITH CHECK (public.is_main_admin());

-- 11. Profiles: admin manages all, clerk reads self
DROP POLICY IF EXISTS admin_full_profiles ON public.profiles;
DROP POLICY IF EXISTS clerk_read_self ON public.profiles;
CREATE POLICY admin_full_profiles ON public.profiles FOR ALL TO authenticated
  USING (public.is_main_admin()) WITH CHECK (public.is_main_admin());
CREATE POLICY read_own_profile ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

-- 12. Payments + audit logs follow the same admin definition
DROP POLICY IF EXISTS admin_full_payments ON public.payments;
CREATE POLICY admin_full_payments ON public.payments FOR ALL TO authenticated
  USING (public.is_main_admin()) WITH CHECK (public.is_main_admin());

DROP POLICY IF EXISTS audit_logs_admin_read ON public.audit_logs;
CREATE POLICY audit_logs_admin_read ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_main_admin());

-- 13. Seat availability helper stays branch-agnostic but only for signed-in staff
REVOKE EXECUTE ON FUNCTION public.get_taken_seats(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_taken_seats(uuid) TO authenticated;