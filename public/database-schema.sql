-- Legacy reference — use interior-backend/database/unified-schema.sql instead.

CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    event_type TEXT NOT NULL,
    page TEXT,
    referrer TEXT,
    visitor_id TEXT,
    city TEXT,
    meta JSONB
);

CREATE TABLE IF NOT EXISTS contact_submissions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT,
    email TEXT,
    phone TEXT,
    city TEXT,
    district TEXT,
    region TEXT,
    space_type TEXT,
    style TEXT,
    message TEXT
);
