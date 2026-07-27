CREATE TABLE IF NOT EXISTS knowledge_versions (
  id VARCHAR(128) PRIMARY KEY,
  term VARCHAR(256) NOT NULL,
  version VARCHAR(32) NOT NULL,
  change_log TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_versions_term ON knowledge_versions(term);
CREATE INDEX IF NOT EXISTS idx_knowledge_versions_created_at ON knowledge_versions(created_at);
