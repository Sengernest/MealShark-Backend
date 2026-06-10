CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS foods_name_trgm_idx
ON foods
USING GIN (name gin_trgm_ops);