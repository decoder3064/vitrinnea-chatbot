// Supabase Configuration for Analytics Tracking
// Add these to your .env file:
// SUPABASE_URL=your-supabase-url
// SUPABASE_ANON_KEY=your-supabase-anon-key

const supabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  enabled: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
};

// Supabase Client Helper (for use in n8n HTTP Request nodes)
const getSupabaseHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'apikey': supabaseConfig.anonKey,
    'Authorization': `Bearer ${supabaseConfig.anonKey}`
  };
};

// Track user engagement with menu options
const trackEngagement = async (data) => {
  if (!supabaseConfig.enabled) {
    console.log('Supabase not configured - skipping analytics');
    return null;
  }

  const engagementData = {
    conversation_id: data.conversation_id,
    account_id: data.account_id,
    inbox_id: data.inbox_id,
    inbox_name: data.inbox_name,
    sender_name: data.sender_name,
    intent: data.intent,
    menu_option: data.menu_option || null,
    original_message: data.original_message,
    is_urgent: data.is_urgent || false,
    is_negative: data.is_negative || false,
    needs_human: data.needs_human || false,
    business_hours: data.business_hours || false,
    order_number: data.order_number || null,
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(`${supabaseConfig.url}/rest/v1/engagement_tracking`, {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify(engagementData)
    });

    if (!response.ok) {
      console.error('Failed to track engagement:', await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error tracking engagement:', error);
    return null;
  }
};

module.exports = {
  supabaseConfig,
  getSupabaseHeaders,
  trackEngagement
};
