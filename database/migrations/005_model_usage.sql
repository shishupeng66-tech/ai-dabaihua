CREATE TABLE IF NOT EXISTS model_usage_logs (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(64),
  model VARCHAR(128) NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  keyword VARCHAR(256),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_model_usage_user_id ON model_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_model_usage_model ON model_usage_logs(model);
CREATE INDEX IF NOT EXISTS idx_model_usage_created_at ON model_usage_logs(created_at);
