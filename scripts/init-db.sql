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