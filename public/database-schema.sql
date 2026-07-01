-- ==========================================
-- Vinayak Interiors Database Schema
-- ==========================================

CREATE TABLE analytics_events (
    id BIGSERIAL PRIMARY KEY,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    event_type TEXT NOT NULL,

    page TEXT,

    referrer TEXT,

    visitor_id TEXT,

    city TEXT,

    meta JSONB
);

CREATE TABLE contact_submissions (
    id BIGSERIAL PRIMARY KEY,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    name TEXT,

    email TEXT,

    phone TEXT,

    message TEXT
);