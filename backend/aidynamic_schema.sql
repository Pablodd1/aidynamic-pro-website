-- AIDynamic.pro — Supabase Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/uakiregrnzcwuwqjkaxr)

-- ═══════════════════════════════════════════════════════════
-- 1. PROFILES TABLE (extends auth.users)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.aidynamic_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  company_name TEXT,
  preferred_contact TEXT DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'both')),
  newsletter_opt_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS: Enable row level security
ALTER TABLE public.aidynamic_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" 
  ON public.aidynamic_profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.aidynamic_profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile" 
  ON public.aidynamic_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policy: Admin can read all profiles
CREATE POLICY "Admin can read all profiles" 
  ON public.aidynamic_profiles 
  FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM public.aidynamic_profiles WHERE role = 'admin'));

-- ═══════════════════════════════════════════════════════════
-- 2. LEADS TABLE (consultation bookings, contact forms)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.aidynamic_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  service_interest TEXT[],
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  source TEXT DEFAULT 'website' CHECK (source IN ('website', 'consultation', 'contact_form', 'referral')),
  user_id UUID REFERENCES public.aidynamic_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.aidynamic_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can read all leads
CREATE POLICY "Admin can read all leads" 
  ON public.aidynamic_leads 
  FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM public.aidynamic_profiles WHERE role = 'admin'));

-- Policy: Admin can update leads
CREATE POLICY "Admin can update leads" 
  ON public.aidynamic_leads 
  FOR UPDATE 
  USING (auth.uid() IN (SELECT id FROM public.aidynamic_profiles WHERE role = 'admin'));

-- Policy: Users can read their own leads
CREATE POLICY "Users can read own leads" 
  ON public.aidynamic_leads 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Policy: Anyone can create leads (contact forms, bookings)
CREATE POLICY "Anyone can create leads" 
  ON public.aidynamic_leads 
  FOR INSERT 
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- 3. PROJECTS TABLE (client projects)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.aidynamic_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.aidynamic_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'on_hold', 'cancelled')),
  service_type TEXT,
  budget TEXT,
  timeline TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.aidynamic_projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own projects
CREATE POLICY "Users can read own projects" 
  ON public.aidynamic_projects 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Policy: Admin can read all projects
CREATE POLICY "Admin can read all projects" 
  ON public.aidynamic_projects 
  FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM public.aidynamic_profiles WHERE role = 'admin'));

-- ═══════════════════════════════════════════════════════════
-- 4. BOOKINGS TABLE (consultation appointments)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.aidynamic_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.aidynamic_profiles(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  consultation_type TEXT DEFAULT 'free_ai_consultation',
  preferred_date TEXT,
  preferred_time TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.aidynamic_bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own bookings
CREATE POLICY "Users can read own bookings" 
  ON public.aidynamic_bookings 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Policy: Admin can read all bookings
CREATE POLICY "Admin can read all bookings" 
  ON public.aidynamic_bookings 
  FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM public.aidynamic_profiles WHERE role = 'admin'));

-- Policy: Anyone can create bookings
CREATE POLICY "Anyone can create bookings" 
  ON public.aidynamic_bookings 
  FOR INSERT 
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- 5. INDEXES
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.aidynamic_leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.aidynamic_leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.aidynamic_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.aidynamic_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.aidynamic_projects(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.aidynamic_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.aidynamic_bookings(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.aidynamic_profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.aidynamic_profiles(email);

-- ═══════════════════════════════════════════════════════════
-- 6. TRIGGERS (auto-update updated_at)
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.aidynamic_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at 
  BEFORE UPDATE ON public.aidynamic_leads 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON public.aidynamic_projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON public.aidynamic_bookings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════
-- 7. ENABLE REALTIME (for live updates)
-- ═══════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE public.aidynamic_leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aidynamic_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aidynamic_bookings;

-- ═══════════════════════════════════════════════════════════
-- 8. SEED DATA (Admin user — Jasmel)
-- ═══════════════════════════════════════════════════════════

-- Note: After Jasmel signs up via magic link, run this to make him admin:
-- UPDATE public.aidynamic_profiles SET role = 'admin' WHERE email = 'jasmelacosta@gmail.com';
