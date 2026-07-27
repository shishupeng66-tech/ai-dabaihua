CREATE TABLE IF NOT EXISTS knowledge_terms (
  id VARCHAR(128) PRIMARY KEY,
  term VARCHAR(256) UNIQUE NOT NULL,
  aliases TEXT[] NOT NULL DEFAULT '{}',
  category VARCHAR(128),
  level VARCHAR(64),
  difficulty_level VARCHAR(32),
  source_type VARCHAR(32),
  target_audience VARCHAR(32),
  version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
  summary TEXT,
  analogy TEXT,
  examples JSONB NOT NULL DEFAULT '[]'::jsonb,
  usage TEXT,
  related_terms TEXT[] NOT NULL DEFAULT '{}',
  search_count INTEGER NOT NULL DEFAULT 0,
  author VARCHAR(32),
  review_status VARCHAR(32) NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_terms_term ON knowledge_terms(term);
CREATE INDEX IF NOT EXISTS idx_knowledge_terms_category ON knowledge_terms(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_terms_review_status ON knowledge_terms(review_status);
