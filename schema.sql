-- ─────────────────────────────────────────────────────────────────────────────
-- Task Tracker — PostgreSQL schema
-- The server auto-runs this on boot via db.js, but you can also apply it
-- manually: psql -U postgres -d task_tracker -f schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Create databases (run as superuser before connecting):
-- CREATE DATABASE task_tracker;
-- CREATE DATABASE task_tracker_test;  -- used exclusively by the test suite

CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL        PRIMARY KEY,
  title       VARCHAR(255)  NOT NULL,
  description TEXT          NOT NULL DEFAULT '',
  status      VARCHAR(20)   NOT NULL DEFAULT 'todo'
                CHECK (status IN ('todo', 'in-progress', 'done')),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Optional: seed sample data
-- INSERT INTO tasks (title, description, status) VALUES
--   ('Set up CI pipeline',   'Configure GitHub Actions',       'todo'),
--   ('Write API tests',      'Cover all four CRUD endpoints',  'in-progress'),
--   ('Deploy to Render',     'Push both services live',        'done');
