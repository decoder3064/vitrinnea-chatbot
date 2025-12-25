-- Supabase Database Schema for Engagement Tracking - SECURE VERSION
-- Run this in your Supabase SQL Editor

-- Create engagement_tracking table
CREATE TABLE IF NOT EXISTS public.engagement_tracking (
    id BIGSERIAL PRIMARY KEY,
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
    order_number TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_engagement_conversation ON public.engagement_tracking(conversation_id);
CREATE INDEX IF NOT EXISTS idx_engagement_inbox ON public.engagement_tracking(inbox_id);
CREATE INDEX IF NOT EXISTS idx_engagement_intent ON public.engagement_tracking(intent);
CREATE INDEX IF NOT EXISTS idx_engagement_timestamp ON public.engagement_tracking(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_menu_option ON public.engagement_tracking(menu_option);

-- Enable Row Level Security (RLS)
ALTER TABLE public.engagement_tracking ENABLE ROW LEVEL SECURITY;

-- 🔒 SECURE: Only service_role can write (used by n8n backend)
CREATE POLICY "Service role can insert" 
ON public.engagement_tracking 
FOR INSERT 
TO service_role  -- ✅ Only the service_role key
WITH CHECK (true);

-- 🔒 SECURE: Only service_role can read (prevents anon key abuse)
CREATE POLICY "Service role can read" 
ON public.engagement_tracking 
FOR SELECT 
TO service_role  -- ✅ Only the service_role key
USING (true);

-- 📊 Optional: Allow anon to read ONLY through views (for dashboard)
-- This way dashboard can read aggregated data but not raw data
CREATE POLICY "Anon can read aggregated views only" 
ON public.engagement_tracking 
FOR SELECT 
TO anon
USING (false);  -- ✅ Blocks direct table access for anon

-- Create a view for daily statistics
CREATE OR REPLACE VIEW public.daily_engagement_stats AS
SELECT 
    DATE(timestamp) as date,
    inbox_name,
    intent,
    menu_option,
    COUNT(*) as interaction_count,
    COUNT(DISTINCT conversation_id) as unique_conversations,
    SUM(CASE WHEN needs_human THEN 1 ELSE 0 END) as escalations_to_human,
    SUM(CASE WHEN is_urgent THEN 1 ELSE 0 END) as urgent_count,
    SUM(CASE WHEN is_negative THEN 1 ELSE 0 END) as negative_sentiment_count,
    AVG(CASE WHEN business_hours THEN 1 ELSE 0 END) * 100 as business_hours_percentage
FROM public.engagement_tracking
GROUP BY DATE(timestamp), inbox_name, intent, menu_option
ORDER BY date DESC, interaction_count DESC;

-- Grant view access to anon for dashboard
GRANT SELECT ON public.daily_engagement_stats TO anon;

-- Create a view for menu option popularity
CREATE OR REPLACE VIEW public.menu_option_stats AS
SELECT 
    menu_option,
    intent,
    inbox_name,
    COUNT(*) as total_uses,
    COUNT(DISTINCT conversation_id) as unique_users,
    AVG(CASE WHEN needs_human THEN 1 ELSE 0 END) * 100 as escalation_rate,
    DATE_TRUNC('hour', timestamp) as hour_bucket
FROM public.engagement_tracking
WHERE menu_option IS NOT NULL
GROUP BY menu_option, intent, inbox_name, DATE_TRUNC('hour', timestamp)
ORDER BY total_uses DESC;

GRANT SELECT ON public.menu_option_stats TO anon;

-- Create a view for inbox performance
CREATE OR REPLACE VIEW public.inbox_performance AS
SELECT 
    inbox_id,
    inbox_name,
    COUNT(*) as total_interactions,
    COUNT(DISTINCT conversation_id) as unique_conversations,
    COUNT(DISTINCT sender_name) as unique_users,
    AVG(CASE WHEN needs_human THEN 1 ELSE 0 END) * 100 as escalation_rate,
    AVG(CASE WHEN is_urgent THEN 1 ELSE 0 END) * 100 as urgent_rate,
    AVG(CASE WHEN is_negative THEN 1 ELSE 0 END) * 100 as negative_sentiment_rate
FROM public.engagement_tracking
GROUP BY inbox_id, inbox_name
ORDER BY total_interactions DESC;

GRANT SELECT ON public.inbox_performance TO anon;

COMMENT ON TABLE public.engagement_tracking IS 'Tracks all user interactions with the chatbot for analytics';
COMMENT ON VIEW public.daily_engagement_stats IS 'Daily aggregated statistics of user engagement';
COMMENT ON VIEW public.menu_option_stats IS 'Statistics on menu option usage and popularity';
COMMENT ON VIEW public.inbox_performance IS 'Performance metrics for each inbox';
