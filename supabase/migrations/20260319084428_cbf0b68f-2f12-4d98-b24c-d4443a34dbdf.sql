
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'worker' CHECK (role IN ('worker', 'lender')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Gig profiles table
CREATE TABLE public.gig_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  orders INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  tenure INTEGER NOT NULL DEFAULT 0,
  income NUMERIC NOT NULL DEFAULT 0,
  upi_transactions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gig_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gig profiles" ON public.gig_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gig profiles" ON public.gig_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gig profiles" ON public.gig_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own gig profiles" ON public.gig_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_gig_profiles_updated_at BEFORE UPDATE ON public.gig_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Score history table
CREATE TABLE public.score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gig_profile_id UUID REFERENCES public.gig_profiles(id) ON DELETE SET NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 300 AND 900),
  grade TEXT NOT NULL,
  breakdown JSONB NOT NULL DEFAULT '{}',
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scores" ON public.score_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.score_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Lenders can view all scores" ON public.score_history FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'lender')
);

-- Lender decisions table
CREATE TABLE public.lender_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score_history_id UUID NOT NULL REFERENCES public.score_history(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  amount_requested NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lender_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lenders can view own decisions" ON public.lender_decisions FOR SELECT TO authenticated USING (auth.uid() = lender_id);
CREATE POLICY "Lenders can insert decisions" ON public.lender_decisions FOR INSERT TO authenticated WITH CHECK (auth.uid() = lender_id);
CREATE POLICY "Lenders can update own decisions" ON public.lender_decisions FOR UPDATE TO authenticated USING (auth.uid() = lender_id);

CREATE TRIGGER update_lender_decisions_updated_at BEFORE UPDATE ON public.lender_decisions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
