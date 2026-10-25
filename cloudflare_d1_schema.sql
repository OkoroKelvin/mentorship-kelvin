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
    target_outcome TEXT NOT NULL,
    bottleneck TEXT NOT NULL,
    has_laptop TEXT DEFAULT '',
    coding_level TEXT DEFAULT '',
    why_you TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    notes TEXT DEFAULT ''
);

-- High-performance indexes for search, filtering, and anti-duplicate lookups
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications (email);
CREATE INDEX IF NOT EXISTS idx_applications_phone ON applications (phone_number);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications (created_at DESC);

