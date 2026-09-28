CREATE TABLE public.rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  attending BOOLEAN NOT NULL DEFAULT true,
  guests INTEGER NOT NULL DEFAULT 1,
  events TEXT[] NOT NULL DEFAULT '{}',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT INSERT ON public.rsvps TO anon, authenticated;
GRANT ALL ON public.rsvps TO service_role;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit an rsvp" ON public.rsvps FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.wishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.wishes TO anon, authenticated;
GRANT ALL ON public.wishes TO service_role;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read approved wishes" ON public.wishes FOR SELECT TO anon, authenticated USING (approved = true);
CREATE POLICY "Anyone can leave a wish" ON public.wishes FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX wishes_created_at_idx ON public.wishes (created_at DESC);