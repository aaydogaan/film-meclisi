-- Mevcut tabloları ve politikaları temizle
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.movie_list_items CASCADE;
DROP TABLE IF EXISTS public.movie_lists CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.movie_recommendations CASCADE;
DROP TABLE IF EXISTS public.movie_comments CASCADE;
DROP TABLE IF EXISTS public.movie_watchers CASCADE;
DROP TABLE IF EXISTS public.movies CASCADE;

-- Movies tablosunu oluştur (global, herkes görebilir)
CREATE TABLE IF NOT EXISTS public.movies (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER,
  director TEXT,
  genre TEXT,
  poster_url TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Film izleme durumu tablosu
CREATE TABLE IF NOT EXISTS public.movie_watchers (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'watched',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  watched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(movie_id, user_id)
);

-- Film yorumları tablosu
CREATE TABLE IF NOT EXISTS public.movie_comments (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  comment TEXT NOT NULL,
  anonymous_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Film önerileri tablosu
CREATE TABLE IF NOT EXISTS public.movie_recommendations (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  recommended_by TEXT NOT NULL,
  recommended_to TEXT NOT NULL,
  watched BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(movie_id, recommended_to)
);

-- Kullanıcı profilleri tablosu
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Film listeleri tablosu
CREATE TABLE IF NOT EXISTS public.movie_lists (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  is_watchlist BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Film liste öğeleri tablosu
CREATE TABLE IF NOT EXISTS public.movie_list_items (
  id BIGSERIAL PRIMARY KEY,
  list_id BIGINT NOT NULL REFERENCES public.movie_lists(id) ON DELETE CASCADE,
  movie_id BIGINT NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, movie_id)
);

-- RLS - Movies
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view movies" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert movies" ON public.movies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Creator can update movies" ON public.movies FOR UPDATE USING (auth.uid()::text = created_by);
CREATE POLICY "Creator can delete movies" ON public.movies FOR DELETE USING (auth.uid()::text = created_by);

-- RLS - Movie Watchers
ALTER TABLE public.movie_watchers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view movie watchers" ON public.movie_watchers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert movie watchers" ON public.movie_watchers FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own movie watchers" ON public.movie_watchers FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own movie watchers" ON public.movie_watchers FOR DELETE USING (auth.uid()::text = user_id);

-- RLS - Movie Comments
ALTER TABLE public.movie_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view movie comments" ON public.movie_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert movie comments" ON public.movie_comments FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own movie comments" ON public.movie_comments FOR DELETE USING (auth.uid()::text = user_id);

-- RLS - Movie Recommendations
ALTER TABLE public.movie_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view movie recommendations" ON public.movie_recommendations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert movie recommendations" ON public.movie_recommendations FOR INSERT WITH CHECK (auth.uid()::text = recommended_by);
CREATE POLICY "Users can update own movie recommendations" ON public.movie_recommendations FOR UPDATE USING (auth.uid()::text = recommended_by);
CREATE POLICY "Users can delete own movie recommendations" ON public.movie_recommendations FOR DELETE USING (auth.uid()::text = recommended_by);
CREATE POLICY "Users can update recommendations for themselves" ON public.movie_recommendations FOR UPDATE USING (auth.uid()::text = recommended_to);

-- Index'ler
CREATE INDEX IF NOT EXISTS movies_created_at_idx ON public.movies(created_at DESC);
CREATE INDEX IF NOT EXISTS movie_watchers_movie_id_idx ON public.movie_watchers(movie_id);
CREATE INDEX IF NOT EXISTS movie_watchers_user_id_idx ON public.movie_watchers(user_id);
CREATE INDEX IF NOT EXISTS movie_comments_movie_id_idx ON public.movie_comments(movie_id);
CREATE INDEX IF NOT EXISTS movie_comments_created_at_idx ON public.movie_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS movie_recommendations_recommended_to_idx ON public.movie_recommendations(recommended_to);
CREATE INDEX IF NOT EXISTS movie_recommendations_recommended_by_idx ON public.movie_recommendations(recommended_by);
CREATE INDEX IF NOT EXISTS movie_recommendations_watched_idx ON public.movie_recommendations(watched);
CREATE INDEX IF NOT EXISTS movie_lists_user_id_idx ON public.movie_lists(user_id);
CREATE INDEX IF NOT EXISTS movie_lists_is_public_idx ON public.movie_lists(is_public);
CREATE INDEX IF NOT EXISTS movie_list_items_list_id_idx ON public.movie_list_items(list_id);
CREATE INDEX IF NOT EXISTS movie_list_items_movie_id_idx ON public.movie_list_items(movie_id);

-- RLS - Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS - Movie Lists
ALTER TABLE public.movie_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own lists" ON public.movie_lists FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view public lists" ON public.movie_lists FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert own lists" ON public.movie_lists FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own lists" ON public.movie_lists FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own lists" ON public.movie_lists FOR DELETE USING (auth.uid()::text = user_id);

-- RLS - Movie List Items
ALTER TABLE public.movie_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view list items" ON public.movie_list_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.movie_lists 
    WHERE movie_lists.id = movie_list_items.list_id 
    AND (movie_lists.user_id = auth.uid()::text OR movie_lists.is_public = true)
  )
);
CREATE POLICY "Users can insert to own lists" ON public.movie_list_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.movie_lists 
    WHERE movie_lists.id = movie_list_items.list_id 
    AND movie_lists.user_id = auth.uid()::text
  )
);
CREATE POLICY "Users can delete from own lists" ON public.movie_list_items FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.movie_lists 
    WHERE movie_lists.id = movie_list_items.list_id 
    AND movie_lists.user_id = auth.uid()::text
  )
);

-- Trigger: Kullanıcı kayıt olduğunda profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Mevcut kullanıcılar için profil oluştur (backfill)
INSERT INTO public.profiles (id, email, name)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);
