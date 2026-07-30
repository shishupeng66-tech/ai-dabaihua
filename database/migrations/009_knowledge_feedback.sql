CREATE TABLE IF NOT EXISTS knowledge_feedback (
  id VARCHAR(128) PRIMARY KEY,
  term VARCHAR(256) NOT NULL,
  section VARCHAR(64) NOT NULL,
  example_index INTEGER NOT NULL DEFAULT 0,
  feedback_type VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_feedback_term ON knowledge_feedback(term);
CREATE INDEX IF NOT EXISTS idx_knowledge_feedback_section ON knowledge_feedback(section);
CREATE INDEX IF NOT EXISTS idx_knowledge_feedback_type ON knowledge_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_feedback_created_at ON knowledge_feedback(created_at);
