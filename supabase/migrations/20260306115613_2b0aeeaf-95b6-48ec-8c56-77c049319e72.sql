
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  favorite_genres TEXT[] DEFAULT '{}',
  background_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Books table
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled',
  description TEXT,
  genre TEXT,
  cover_image_url TEXT,
  background_style TEXT DEFAULT 'default',
  page_color TEXT DEFAULT '#ffffff',
  font_family TEXT DEFAULT 'serif',
  theme TEXT DEFAULT 'classic',
  is_published BOOLEAN DEFAULT false,
  is_draft BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published books are viewable by everyone" ON public.books
  FOR SELECT USING (is_published = true OR auth.uid() = author_id);

CREATE POLICY "Authors can insert own books" ON public.books
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own books" ON public.books
  FOR UPDATE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own books" ON public.books
  FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Chapters table
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Chapter 1',
  content TEXT DEFAULT '',
  chapter_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chapters viewable if book is viewable" ON public.chapters
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.books WHERE books.id = chapters.book_id AND (books.is_published = true OR books.author_id = auth.uid()))
  );

CREATE POLICY "Authors can manage chapters" ON public.chapters
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.books WHERE books.id = chapters.book_id AND books.author_id = auth.uid())
  );

CREATE POLICY "Authors can update chapters" ON public.chapters
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.books WHERE books.id = chapters.book_id AND books.author_id = auth.uid())
  );

CREATE POLICY "Authors can delete chapters" ON public.chapters
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.books WHERE books.id = chapters.book_id AND books.author_id = auth.uid())
  );

-- Follows table
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- Likes table
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON public.likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Bookmarks table
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  page_number INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can bookmark" ON public.bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove bookmarks" ON public.bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own received messages" ON public.messages FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Anyone can view uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Users can update own uploads" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own uploads" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
