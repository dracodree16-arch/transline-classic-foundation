-- ROLES
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('super_admin','administrator','manager','booking_agent','dispatcher','parcel_staff','finance_staff','branch_staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','administrator'));
$$;

CREATE POLICY user_roles_read_own ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff_admin(auth.uid()));

-- BUSES
CREATE TABLE IF NOT EXISTS public.buses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_number text NOT NULL UNIQUE,
  model text,
  capacity integer NOT NULL DEFAULT 44,
  status text NOT NULL DEFAULT 'active',
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buses TO authenticated;
GRANT ALL ON public.buses TO service_role;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
CREATE POLICY buses_read ON public.buses FOR SELECT TO authenticated USING (true);
CREATE POLICY buses_write ON public.buses FOR ALL TO authenticated USING (public.is_staff_admin(auth.uid())) WITH CHECK (public.is_staff_admin(auth.uid()));

-- PASSENGERS
CREATE TABLE IF NOT EXISTS public.passengers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  id_number text,
  seat_number text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.passengers TO authenticated;
GRANT ALL ON public.passengers TO service_role;
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
CREATE POLICY passengers_read ON public.passengers FOR SELECT TO authenticated USING (true);
CREATE POLICY passengers_write ON public.passengers FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_own ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_admin_read ON public.audit_logs FOR SELECT TO authenticated USING (public.is_staff_admin(auth.uid()));
CREATE POLICY audit_logs_insert ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- STAFF SIGNUP: profile + default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'branch_staff')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Signed-in staff read access on core tables
CREATE POLICY staff_read_branches ON public.branches FOR SELECT TO authenticated USING (true);
CREATE POLICY staff_read_routes ON public.routes FOR SELECT TO authenticated USING (true);
CREATE POLICY staff_read_trips ON public.trips FOR SELECT TO authenticated USING (true);
CREATE POLICY staff_read_bookings ON public.bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY staff_read_parcels ON public.parcels FOR SELECT TO authenticated USING (true);
CREATE POLICY staff_read_expenses ON public.expenses FOR SELECT TO authenticated USING (true);

-- DEMO DATA (clearly demo)
INSERT INTO public.branches (id, name, town, phone) VALUES
 ('11111111-1111-1111-1111-111111111101','Nairobi CBD','Nairobi','+254700100101'),
 ('11111111-1111-1111-1111-111111111102','Kisii Town','Kisii','+254700100102'),
 ('11111111-1111-1111-1111-111111111103','Oyugis','Oyugis','+254700100103'),
 ('11111111-1111-1111-1111-111111111104','Kisumu','Kisumu','+254700100104'),
 ('11111111-1111-1111-1111-111111111105','Kericho','Kericho','+254700100105'),
 ('11111111-1111-1111-1111-111111111106','Nakuru','Nakuru','+254700100106')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.routes (id, origin_branch_id, destination, base_fare) VALUES
 ('22222222-2222-2222-2222-222222222201','11111111-1111-1111-1111-111111111101','Kisii',1500),
 ('22222222-2222-2222-2222-222222222202','11111111-1111-1111-1111-111111111101','Kisumu',1400),
 ('22222222-2222-2222-2222-222222222203','11111111-1111-1111-1111-111111111102','Nairobi',1500),
 ('22222222-2222-2222-2222-222222222204','11111111-1111-1111-1111-111111111106','Kisii',1200),
 ('22222222-2222-2222-2222-222222222205','11111111-1111-1111-1111-111111111105','Nairobi',1100),
 ('22222222-2222-2222-2222-222222222206','11111111-1111-1111-1111-111111111103','Nairobi',1600)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.buses (id, plate_number, model, capacity, status, branch_id) VALUES
 ('33333333-3333-3333-3333-333333333301','KDU 995Y','Isuzu Master',49,'active','11111111-1111-1111-1111-111111111101'),
 ('33333333-3333-3333-3333-333333333302','KDT 567A','Scania Marcopolo',51,'active','11111111-1111-1111-1111-111111111102'),
 ('33333333-3333-3333-3333-333333333303','KDA 220X','Isuzu FRR',44,'maintenance','11111111-1111-1111-1111-111111111104'),
 ('33333333-3333-3333-3333-333333333304','KCX 781B','Yutong ZK',53,'active','11111111-1111-1111-1111-111111111106'),
 ('33333333-3333-3333-3333-333333333305','KDD 410M','Isuzu Master',49,'active','11111111-1111-1111-1111-111111111105')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.trips (id, route_id, branch_id, bus_plate, departure_time, total_seats, seats_booked, status) VALUES
 ('44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222201','11111111-1111-1111-1111-111111111101','KDU 995Y', now() + interval '6 hours',49,32,'scheduled'),
 ('44444444-4444-4444-4444-444444444402','22222222-2222-2222-2222-222222222202','11111111-1111-1111-1111-111111111101','KCX 781B', now() + interval '9 hours',53,18,'scheduled'),
 ('44444444-4444-4444-4444-444444444403','22222222-2222-2222-2222-222222222203','11111111-1111-1111-1111-111111111102','KDT 567A', now() + interval '12 hours',51,44,'scheduled'),
 ('44444444-4444-4444-4444-444444444404','22222222-2222-2222-2222-222222222205','11111111-1111-1111-1111-111111111105','KDD 410M', now() + interval '20 hours',49,9,'scheduled')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.bookings (id, trip_id, branch_id, passenger_name, passenger_phone, seat_number, fare_amount, payment_status, mpesa_receipt, booking_ref) VALUES
 ('55555555-5555-5555-5555-555555555501','44444444-4444-4444-4444-444444444401','11111111-1111-1111-1111-111111111101','Wanjiru Kamau','+254712345601','12',1500,'paid','SGH4K2LMN1','TC-DEMO-0001'),
 ('55555555-5555-5555-5555-555555555502','44444444-4444-4444-4444-444444444401','11111111-1111-1111-1111-111111111101','Otieno Ochieng','+254712345602','13',1500,'paid','SGH4K2LMN2','TC-DEMO-0002'),
 ('55555555-5555-5555-5555-555555555503','44444444-4444-4444-4444-444444444402','11111111-1111-1111-1111-111111111101','Chepkoech Rono','+254712345603','07',1400,'pending',NULL,'TC-DEMO-0003'),
 ('55555555-5555-5555-5555-555555555504','44444444-4444-4444-4444-444444444403','11111111-1111-1111-1111-111111111102','Mercy Nyaboke','+254712345604','21',1500,'paid','SGH4K2LMN4','TC-DEMO-0004'),
 ('55555555-5555-5555-5555-555555555505','44444444-4444-4444-4444-444444444404','11111111-1111-1111-1111-111111111105','Brian Kiplagat','+254712345605','03',1100,'paid','SGH4K2LMN5','TC-DEMO-0005')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.passengers (booking_id, full_name, phone, id_number, seat_number) VALUES
 ('55555555-5555-5555-5555-555555555501','Wanjiru Kamau','+254712345601','28114567','12'),
 ('55555555-5555-5555-5555-555555555502','Otieno Ochieng','+254712345602','30225678','13')
ON CONFLICT DO NOTHING;

INSERT INTO public.parcels (id, tracking_code, access_password, origin_branch_id, destination_branch_id, sender_name, sender_phone, receiver_name, receiver_phone, description, weight_kg, fare_amount, payment_status, status) VALUES
 ('66666666-6666-6666-6666-666666666601','TCP-DEMO-1001','demo1001','11111111-1111-1111-1111-111111111101','11111111-1111-1111-1111-111111111102','Peter Mwangi','+254722000101','Jane Moraa','+254722000201','Documents envelope',1.5,300,'paid','in_transit'),
 ('66666666-6666-6666-6666-666666666602','TCP-DEMO-1002','demo1002','11111111-1111-1111-1111-111111111104','11111111-1111-1111-1111-111111111101','Alice Atieno','+254722000102','Samuel Kariuki','+254722000202','Electronics box',8.0,1200,'pending','booked'),
 ('66666666-6666-6666-6666-666666666603','TCP-DEMO-1003','demo1003','11111111-1111-1111-1111-111111111106','11111111-1111-1111-1111-111111111103','Grace Wairimu','+254722000103','Dennis Omondi','+254722000203','Farm produce sack',25.0,900,'paid','delivered')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.expenses (branch_id, category, description, amount, spent_at) VALUES
 ('11111111-1111-1111-1111-111111111101','Fuel','Diesel top-up KDU 995Y',18500,CURRENT_DATE),
 ('11111111-1111-1111-1111-111111111102','Maintenance','Brake pads replacement',7400,CURRENT_DATE - 1),
 ('11111111-1111-1111-1111-111111111104','Office','Branch airtime and stationery',2300,CURRENT_DATE - 2);