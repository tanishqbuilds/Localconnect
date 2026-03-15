-- Add photo_url to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Refresh schema
NOTIFY pgrst, 'reload schema';
