
-- Paths table
CREATE TABLE public.paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  intention TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own paths" ON public.paths
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Patterns table
CREATE TABLE public.patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path_id UUID NOT NULL REFERENCES public.paths(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  success_count INTEGER NOT NULL DEFAULT 0,
  practice_set_count INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own patterns" ON public.patterns
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Problems table
CREATE TABLE public.problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_id UUID NOT NULL REFERENCES public.patterns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own problems" ON public.problems
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Practice events table
CREATE TABLE public.practice_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_id UUID NOT NULL REFERENCES public.patterns(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  fixation_level TEXT NOT NULL CHECK (fixation_level IN ('light', 'medium', 'heavy')),
  problem_name TEXT
);

ALTER TABLE public.practice_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own events" ON public.practice_events
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Scheduled occurrences table
CREATE TABLE public.scheduled_occurrences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_id UUID NOT NULL REFERENCES public.patterns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  auto_generated BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.scheduled_occurrences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own schedule" ON public.scheduled_occurrences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Pace preference table (simple key-value per user)
CREATE TABLE public.user_preferences (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  pace TEXT NOT NULL DEFAULT 'standard' CHECK (pace IN ('gentle', 'standard', 'intensive'))
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
