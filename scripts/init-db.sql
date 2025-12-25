-- Initialize databases for n8n and Chatwoot
-- This script runs automatically when PostgreSQL container starts for the first time

-- Create n8n database
SELECT 'CREATE DATABASE n8n'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'n8n')\gexec

-- Create chatwoot database
SELECT 'CREATE DATABASE chatwoot_production'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'chatwoot_production')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE n8n TO postgres;
GRANT ALL PRIVILEGES ON DATABASE chatwoot_production TO postgres;

-- Switch to n8n database and create engagement tracking table
\c n8n;

-- Create engagement_tracking table
CREATE TABLE IF NOT EXISTS engagement_tracking (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    inbox_id INTEGER,
    inbox_name TEXT,
    sender_name TEXT,
    intent TEXT NOT NULL,
    menu_option TEXT,
    original_message TEXT,
    is_urgent BOOLEAN DEFAULT FALSE,
    is_negative BOOLEAN DEFAULT FALSE,
    needs_human BOOLEAN DEFAULT FALSE,
    business_hours BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_engagement_conversation ON engagement_tracking(conversation_id);
CREATE INDEX IF NOT EXISTS idx_engagement_inbox ON engagement_tracking(inbox_id);
CREATE INDEX IF NOT EXISTS idx_engagement_intent ON engagement_tracking(intent);
CREATE INDEX IF NOT EXISTS idx_engagement_timestamp ON engagement_tracking(timestamp DESC);