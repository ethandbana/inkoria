-- Add tags column to books table
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  from_user_id uuid
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;