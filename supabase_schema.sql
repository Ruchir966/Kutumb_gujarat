-- Supabase Schema Setup for Kutumba Gujarat
-- Run this in the Supabase SQL Editor

-- 1. Families Table
CREATE TABLE IF NOT EXISTS public.families (
    family_id TEXT PRIMARY KEY,
    address TEXT NOT NULL,
    ration_card_number TEXT,
    status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Members Table
CREATE TABLE IF NOT EXISTS public.members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id TEXT REFERENCES public.families(family_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    national_id TEXT NOT NULL,
    relation_to_hof TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    income NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Schemes Table
CREATE TABLE IF NOT EXISTS public.schemes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    amount TEXT NOT NULL,
    description TEXT,
    applicable_for TEXT,
    tag TEXT,
    icon TEXT
);

-- 4. Scheme Applications Table
CREATE TABLE IF NOT EXISTS public.scheme_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id TEXT REFERENCES public.families(family_id) ON DELETE CASCADE,
    scheme_id UUID REFERENCES public.schemes(id) ON DELETE CASCADE,
    applicant_aadhaar TEXT,
    status TEXT DEFAULT 'Applied',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optional: Disable RLS for Hackathon Demo Speed (or enable and configure properly for prod)
ALTER TABLE public.families DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_applications DISABLE ROW LEVEL SECURITY;

-- Insert Mock Schemes
INSERT INTO public.schemes (title, amount, description, applicable_for, tag, icon) VALUES 
('Mukhyamantri Yuva Scholarship', '₹50,000', 'For higher education of dependent students based on merit and family income.', 'Rahul Patel', 'Individual', 'GraduationCap'),
('Ujjwala Gas Subsidy', 'Subsidized LPG', 'Financial support for clean cooking fuel to the household.', 'Entire Family', 'Household', 'Flame'),
('PM Awas Yojana', '₹2.67 Lakh', 'Credit linked subsidy scheme for affordable housing.', 'Entire Family', 'Housing', 'Home');
