CREATE TABLE public.stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  town text,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stations TO authenticated;
GRANT SELECT ON public.stations TO anon;
GRANT ALL ON public.stations TO service_role;

ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;

CREATE POLICY stations_admin_all ON public.stations FOR ALL TO authenticated
  USING (is_main_admin()) WITH CHECK (is_main_admin());
CREATE POLICY stations_staff_read ON public.stations FOR SELECT TO authenticated USING (true);
CREATE POLICY stations_public_read ON public.stations FOR SELECT TO anon USING (is_active);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_stations_updated_at BEFORE UPDATE ON public.stations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS station_id uuid REFERENCES public.stations(id) ON DELETE SET NULL;

INSERT INTO public.stations (name, code, town, branch_id)
SELECT b.name || ' Station',
       upper(left(regexp_replace(b.name, '[^a-zA-Z]', '', 'g'), 3)) || '-' || upper(substr(replace(b.id::text,'-',''), 1, 6)),
       b.town, b.id
FROM public.branches b
ON CONFLICT (code) DO NOTHING;