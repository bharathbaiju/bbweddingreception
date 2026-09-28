-- Storage bucket for guest-uploaded wedding photos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'guest-photos',
  'guest-photos',
  true,
  10485760, -- 10MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

create policy "Anyone can upload a guest photo"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'guest-photos');

create policy "Anyone can view guest photos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'guest-photos');

-- Metadata (uploader name, caption-free for now) for each guest photo, so
-- the gallery can list/order them without depending on Storage's own
-- listing API.
CREATE TABLE public.guest_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.guest_photos TO anon, authenticated;
GRANT ALL ON public.guest_photos TO service_role;
ALTER TABLE public.guest_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read approved guest photos" ON public.guest_photos FOR SELECT TO anon, authenticated USING (approved = true);
CREATE POLICY "Anyone can add a guest photo" ON public.guest_photos FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE INDEX guest_photos_created_at_idx ON public.guest_photos (created_at DESC);
