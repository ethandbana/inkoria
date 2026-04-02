
-- Drop the auth.users FK and add profiles FK so PostgREST can resolve the relationship
ALTER TABLE public.books DROP CONSTRAINT books_author_id_fkey;
ALTER TABLE public.books ADD CONSTRAINT books_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
