CREATE TABLE IF NOT EXISTS pending_terms (
  id VARCHAR(128) PRIMARY KEY,
  keyword VARCHAR(256) NOT NULL,
  source VARCHAR(64) NOT NULL DEFAULT 'user_search',
  draft JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_id VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_pending_terms_keyword ON pending_terms(keyword);
CREATE INDEX IF NOT EXISTS idx_pending_terms_status ON pending_terms(status);
CREATE INDEX IF NOT EXISTS idx_pending_terms_reviewer_id ON pending_terms(reviewer_id);
