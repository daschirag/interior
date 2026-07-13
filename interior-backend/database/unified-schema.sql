-- Vinayak Interiors — unified production schema (CMS + analytics)
-- Run once in Supabase SQL Editor on your single project.

-- ========== CMS ==========

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  location VARCHAR(255),
  year INTEGER,
  area_sqft INTEGER,
  description TEXT,
  material_tags TEXT[],
  images TEXT[],
  before_image_url TEXT,
  after_image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  journey_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disciplines (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  display_order INTEGER DEFAULT 0,
  budget_range VARCHAR(255),
  timeline VARCHAR(255),
  scope TEXT,
  tags TEXT[],
  image_url TEXT,
  images TEXT[],
  cta_projects_link TEXT,
  cta_consult_link TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS districts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  hero_title TEXT,
  hero_description TEXT,
  seo_title TEXT,
  seo_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  whatsapp VARCHAR(50),
  instagram_url TEXT,
  facebook_url TEXT,
  youtube_url TEXT,
  business_hours TEXT,
  catalog_pdf_url TEXT,
  studio_locations JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== Analytics ==========

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

CREATE TABLE IF NOT EXISTS content_blocks (
  id SERIAL PRIMARY KEY,
  page VARCHAR(50) NOT NULL,
  section_key VARCHAR(100) UNIQUE NOT NULL,
  section_label VARCHAR(150) NOT NULL,
  fields JSONB DEFAULT '{}',
  images JSONB DEFAULT '[]',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_block_history (
  id SERIAL PRIMARY KEY,
  section_key VARCHAR(100) NOT NULL,
  fields JSONB NOT NULL,
  images JSONB NOT NULL,
  edited_by VARCHAR(150),
  edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_block_history_section_key
  ON content_block_history (section_key, edited_at DESC);

CREATE TABLE IF NOT EXISTS entity_history (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  edited_by VARCHAR(150),
  edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_entity_history_entity
  ON entity_history (entity_type, entity_id, edited_at DESC);
