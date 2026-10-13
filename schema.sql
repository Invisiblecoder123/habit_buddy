-- ==============================================================================
-- HABIT BUDDY: PRODUCTION-GRADE DATABASE SCHEMA & RLS POLICIES
-- Target: Supabase (PostgreSQL 15+)
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  discipline_score INT DEFAULT 0,
  current_daily_streak INT DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habits Table
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  scheduled_days INT[] NOT NULL, -- 0=Sun, 1=Mon, ..., 6=Sat
  created_at DATE DEFAULT CURRENT_DATE
);

-- 4. Habit Logs Table
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  CONSTRAINT unique_habit_date UNIQUE(habit_id, log_date)
);

-- ==============================================================================
-- INDEX OPTIMIZATIONS (Fast lookups for streaks, daily logs, and categories)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_category_id ON public.habits(category_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON public.habit_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON public.habit_logs(habit_id, log_date);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) ACTIVATION
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- STRICT RLS POLICIES (Enforce auth.uid() & Prevent user_id spoofing)
-- ==============================================================================

-- Profiles: Users can view and update only their own profile
DROP POLICY IF EXISTS "Users access own profile" ON public.profiles;
CREATE POLICY "Users access own profile"
  ON public.profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Categories: Users can CRUD only their own categories
DROP POLICY IF EXISTS "Users access own categories" ON public.categories;
CREATE POLICY "Users access own categories"
  ON public.categories
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Habits: Users can CRUD only their own habits
DROP POLICY IF EXISTS "Users access own habits" ON public.habits;
CREATE POLICY "Users access own habits"
  ON public.habits
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Habit Logs: Users can CRUD only their own logs
DROP POLICY IF EXISTS "Users access own logs" ON public.habit_logs;
CREATE POLICY "Users access own logs"
  ON public.habit_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- PROFILE & DEFAULT CATEGORIES AUTO-CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Auto-create profile record
  INSERT INTO public.profiles (id, username, discipline_score, current_daily_streak)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    0,
    0
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert default starter categories with calibrated theme colors
  INSERT INTO public.categories (user_id, name, color, points) VALUES
    (new.id, 'Health', '#10B981', 0),
    (new.id, 'Intelligence', '#6366F1', 0),
    (new.id, 'Strength', '#EF4444', 0),
    (new.id, 'Relations', '#EC4899', 0),
    (new.id, 'Mindfulness', '#06B6D4', 0)
  ON CONFLICT DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if already exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- ATOMIC HABIT COMPLETION & DISCIPLINE SCORING RPC (Optional but recommended)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.toggle_habit_log(
  p_habit_id UUID,
  p_log_date DATE,
  p_completed BOOLEAN
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_category_id UUID;
  v_points_delta INT := 10;
  v_new_discipline INT;
  v_streak INT;
BEGIN
  -- Authenticate caller
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate habit ownership
  SELECT category_id INTO v_category_id
  FROM public.habits
  WHERE id = p_habit_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Habit not found or unauthorized';
  END IF;

  -- Upsert habit log
  INSERT INTO public.habit_logs (habit_id, user_id, log_date, completed)
  VALUES (p_habit_id, v_user_id, p_log_date, p_completed)
  ON CONFLICT (habit_id, log_date)
  DO UPDATE SET completed = EXCLUDED.completed;

  -- Calculate points delta (+10 on completion, -10 on uncheck)
  IF NOT p_completed THEN
    v_points_delta := -10;
  END IF;

  -- Update category points
  UPDATE public.categories
  SET points = GREATEST(0, points + v_points_delta)
  WHERE id = v_category_id AND user_id = v_user_id;

  -- Update profile discipline score
  UPDATE public.profiles
  SET discipline_score = GREATEST(0, discipline_score + v_points_delta),
      last_active_date = CURRENT_DATE
  WHERE id = v_user_id
  RETURNING discipline_score, current_daily_streak INTO v_new_discipline, v_streak;

  RETURN jsonb_build_object(
    'success', true,
    'discipline_score', v_new_discipline,
    'current_daily_streak', v_streak
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
