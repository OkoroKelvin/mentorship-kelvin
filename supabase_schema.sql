-- ==============================================================================
-- 1-Month Mentorship with Kelvin: Supabase PostgreSQL Schema
-- Table: applications
-- ==============================================================================

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT DEFAULT '',
    profile_url TEXT DEFAULT '',
    years_of_experience TEXT DEFAULT '',
    current_role TEXT DEFAULT '',
    primary_stack TEXT NOT NULL,
    target_outcome TEXT NOT NULL,
    bottleneck TEXT NOT NULL,
    weekly_hours TEXT NOT NULL,
    why_you TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'shortlisted', 'selected', 'rejected')),
    notes TEXT DEFAULT '',
    CONSTRAINT unique_application_email UNIQUE (email)
);

-- ==============================================================================
-- High-Performance Indexes for Concurrency & Dashboard Filtering
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_phone ON public.applications (phone_number);
CREATE INDEX IF NOT EXISTS idx_applications_composite_filter ON public.applications (status, created_at DESC);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 1. Allow anonymous public submissions (inserts only)
CREATE POLICY "Allow public insert of applications"
    ON public.applications
    FOR INSERT
    TO public
    WITH CHECK (true);

-- 2. Allow service role (server API & admin portal) full read/write access
CREATE POLICY "Allow service role full access"
    ON public.applications
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Optional comment documentation
COMMENT ON TABLE public.applications IS 'Stores applicant submissions for Kelvin 1-Month Engineering Mentorship cohort';
COMMENT ON COLUMN public.applications.status IS 'Pipeline stage: pending, shortlisted, selected, or rejected';
