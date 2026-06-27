-- Bridge MVP database schema for Neon/Vercel Postgres.
-- Run in the SQL editor of your free Neon project, then set POSTGRES_URL in Vercel.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE bridge_visibility AS ENUM ('private', 'shared_person', 'shared_group', 'main_context');
CREATE TYPE source_status AS ENUM ('live', 'synced', 'changed', 'in_progress', 'needs_analysis', 'analyzing', 'added_to_context', 'not_in_context', 'private', 'shared');
CREATE TYPE task_status AS ENUM ('to_do', 'in_progress', 'waiting', 'blocked', 'needs_review', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE job_status AS ENUM ('queued', 'running', 'succeeded', 'failed');

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bridges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft',
  map_template text NOT NULL DEFAULT 'Understanding Map',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_id uuid NOT NULL REFERENCES bridges(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  provider text NOT NULL DEFAULT 'upload',
  uri text,
  owner_label text,
  status source_status NOT NULL DEFAULT 'needs_analysis',
  visibility bridge_visibility NOT NULL DEFAULT 'private',
  last_updated_at timestamptz,
  last_analyzed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS source_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  version_label text,
  content_hash text,
  diff_summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS source_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  source_version_id uuid REFERENCES source_versions(id) ON DELETE SET NULL,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  locator jsonb NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1536),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS canvas_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_id uuid NOT NULL REFERENCES bridges(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  ref_table text,
  ref_id uuid,
  x numeric NOT NULL DEFAULT 0,
  y numeric NOT NULL DEFAULT 0,
  width numeric NOT NULL DEFAULT 280,
  height numeric NOT NULL DEFAULT 180,
  visibility bridge_visibility NOT NULL DEFAULT 'private',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS context_frames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_id uuid NOT NULL REFERENCES bridges(id) ON DELETE CASCADE,
  title text NOT NULL,
  purpose text,
  visibility bridge_visibility NOT NULL DEFAULT 'private',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS map_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_id uuid NOT NULL REFERENCES bridges(id) ON DELETE CASCADE,
  card_type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  confidence text NOT NULL DEFAULT 'inferred',
  status text NOT NULL DEFAULT 'active',
  position integer NOT NULL DEFAULT 0,
  visibility bridge_visibility NOT NULL DEFAULT 'main_context',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evidence_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_card_id uuid REFERENCES map_cards(id) ON DELETE CASCADE,
  source_id uuid REFERENCES sources(id) ON DELETE CASCADE,
  source_chunk_id uuid REFERENCES source_chunks(id) ON DELETE SET NULL,
  quote text,
  locator jsonb NOT NULL DEFAULT '{}'::jsonb,
  evidence_kind text NOT NULL DEFAULT 'source_quote',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_id uuid NOT NULL REFERENCES bridges(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  title text,
  body text NOT NULL,
  visibility bridge_visibility NOT NULL DEFAULT 'private',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_id uuid NOT NULL REFERENCES bridges(id) ON DELETE CASCADE,
  task_key text NOT NULL,
  title text NOT NULL,
  description text,
  assignee_id uuid REFERENCES users(id) ON DELETE SET NULL,
  assignee_label text,
  status task_status NOT NULL DEFAULT 'to_do',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date date,
  linked_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  visibility bridge_visibility NOT NULL DEFAULT 'shared_person',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(bridge_id, task_key)
);

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_id uuid NOT NULL REFERENCES bridges(id) ON DELETE CASCADE,
  title text NOT NULL,
  why_it_matters text,
  suggested_owner text,
  confidence text NOT NULL DEFAULT 'low',
  status text NOT NULL DEFAULT 'open',
  linked_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_id uuid NOT NULL REFERENCES bridges(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  body text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  visibility bridge_visibility NOT NULL DEFAULT 'shared_person',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS generated_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_id uuid NOT NULL REFERENCES bridges(id) ON DELETE CASCADE,
  output_type text NOT NULL,
  title text NOT NULL,
  status job_status NOT NULL DEFAULT 'queued',
  source_scope jsonb NOT NULL DEFAULT '{}'::jsonb,
  artifact_uri text,
  transcript text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_id uuid REFERENCES bridges(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  summary text NOT NULL,
  target_type text,
  target_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sources_bridge ON sources(bridge_id);
CREATE INDEX IF NOT EXISTS idx_tasks_bridge_status ON tasks(bridge_id, status);
CREATE INDEX IF NOT EXISTS idx_questions_bridge_status ON questions(bridge_id, status);
CREATE INDEX IF NOT EXISTS idx_activity_bridge_created ON activity_events(bridge_id, created_at DESC);
