
-- Create statuses table for stories/status updates
CREATE TABLE IF NOT EXISTS public.statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'statuses' AND policyname = 'Statuses viewable by everyone') THEN
    CREATE POLICY "Statuses viewable by everyone" ON public.statuses FOR SELECT TO public USING (expires_at > now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'statuses' AND policyname = 'Users can post statuses') THEN
    CREATE POLICY "Users can post statuses" ON public.statuses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'statuses' AND policyname = 'Users can delete own statuses') THEN
    CREATE POLICY "Users can delete own statuses" ON public.statuses FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add media support to messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_type TEXT;

-- Enable realtime for statuses
ALTER PUBLICATION supabase_realtime ADD TABLE public.statuses;
