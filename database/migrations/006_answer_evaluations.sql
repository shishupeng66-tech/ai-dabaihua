CREATE TABLE IF NOT EXISTS answer_evaluations (
  id VARCHAR(128) PRIMARY KEY,
  keyword VARCHAR(256),
  mode VARCHAR(32) NOT NULL DEFAULT 'normal',
  score NUMERIC(3, 1) NOT NULL DEFAULT 0,
  clarity_score NUMERIC(3, 1) NOT NULL DEFAULT 0,
  analogy_score NUMERIC(3, 1) NOT NULL DEFAULT 0,
  scenario_score NUMERIC(3, 1) NOT NULL DEFAULT 0,
  accuracy_score NUMERIC(3, 1) NOT NULL DEFAULT 0,
  simplicity_score NUMERIC(3, 1) NOT NULL DEFAULT 0,
  usefulness_score NUMERIC(3, 1) NOT NULL DEFAULT 0,
  human_score NUMERIC(3, 1) NOT NULL DEFAULT 0,
  prompt_name VARCHAR(128),
  prompt_version VARCHAR(64),
  source VARCHAR(32),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_answer_evaluations_keyword ON answer_evaluations(keyword);
CREATE INDEX IF NOT EXISTS idx_answer_evaluations_score ON answer_evaluations(score);
CREATE INDEX IF NOT EXISTS idx_answer_evaluations_prompt ON answer_evaluations(prompt_name, prompt_version);
