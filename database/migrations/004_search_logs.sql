CREATE TABLE IF NOT EXISTS search_logs (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(64),
  keyword VARCHAR(256) NOT NULL,
  source VARCHAR(32),
  match_type VARCHAR(32),
  score INTEGER NOT NULL DEFAULT 0,
  hit_knowledge BOOLEAN NOT NULL DEFAULT FALSE,
  hit_term_id VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_keyword ON search_logs(keyword);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_search_logs_hit_knowledge ON search_logs(hit_knowledge);
