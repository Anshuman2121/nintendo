-- Gameplay Sessions Table
-- Tracks play time per game per user
-- Primary key is composite of email + game_name

CREATE TABLE IF NOT EXISTS gameplay_sessions (
    email TEXT NOT NULL,
    game_name TEXT NOT NULL,
    total_time_seconds INTEGER DEFAULT 0,
    last_played DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (email, game_name)
);

-- Index for faster lookups by email (for dashboard)
CREATE INDEX IF NOT EXISTS idx_sessions_email ON gameplay_sessions(email);

-- Index for sorting by last played
CREATE INDEX IF NOT EXISTS idx_sessions_last_played ON gameplay_sessions(last_played DESC);
