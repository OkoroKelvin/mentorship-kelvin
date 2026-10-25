-- ==============================================================================
-- 1-Month Java Mentorship with Kelvin: Cloudflare D1 SQL Schema
-- Table: applications
-- ==============================================================================

CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT DEFAULT '',
    profile_url TEXT DEFAULT '',
    years_of_experience TEXT DEFAULT '',
    current_role TEXT DEFAULT '',
    primary_stack TEXT NOT NULL,
    target_outcome TEXT NOT NULL,
    bottleneck TEXT NOT NULL,
    weekly_hours TEXT NOT NULL,
    why_you TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    notes TEXT DEFAULT ''
);

-- High-performance indexes for search, filtering, and anti-duplicate lookups
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications (email);
CREATE INDEX IF NOT EXISTS idx_applications_phone ON applications (phone_number);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications (created_at DESC);
