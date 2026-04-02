ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;