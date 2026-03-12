-- ============================================================
-- Flatline — Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Monitors table
-- One row per automation being watched
CREATE TABLE monitors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,                        -- friendly name the user gives it
  token       TEXT NOT NULL UNIQUE,                 -- the secret in the ping URL
  threshold   INTEGER NOT NULL DEFAULT 1440,        -- alert if silent for this many minutes (default 24h)
  last_ping   TIMESTAMPTZ,                          -- last time a ping was received
  alerted_at  TIMESTAMPTZ,                          -- last time we sent an alert (to avoid spam)
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pings table
-- One row per heartbeat received — useful for history / Level 2 slowdown detection later
CREATE TABLE pings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id  UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE pings ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own monitors
CREATE POLICY "Users manage own monitors"
  ON monitors FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can see pings for their own monitors
CREATE POLICY "Users view own pings"
  ON pings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM monitors m
      WHERE m.id = pings.monitor_id
        AND m.user_id = auth.uid()
    )
  );

-- Service role can insert pings (used by the ping API route)
CREATE POLICY "Service role inserts pings"
  ON pings FOR INSERT
  WITH CHECK (true);

-- Index for fast cron lookups
CREATE INDEX monitors_user_id_idx ON monitors(user_id);
CREATE INDEX monitors_token_idx ON monitors(token);
CREATE INDEX pings_monitor_id_idx ON pings(monitor_id);
CREATE INDEX pings_received_at_idx ON pings(received_at DESC);
