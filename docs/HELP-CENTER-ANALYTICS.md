# Help Center & Analytics Setup Guide

## Overview

This guide covers the new Help Center and Analytics tracking features added to the Vitrinnea Customer Service Bot.

## 🎯 Features Added

### 1. Help Center (Option 0)
- New menu option to access tutorials and help resources
- Embedded YouTube videos from @shopvitrinnea channel
- FAQ section with common questions
- Direct links to support channels

### 2. Engagement Tracking
- Tracks all user interactions with menu options
- Saves data to Supabase for analytics
- Monitors intent patterns, escalations, sentiment
- Real-time data collection

### 3. Analytics Dashboard
- Visual charts showing engagement metrics
- Menu option popularity tracking
- Hourly interaction patterns
- Inbox performance comparison
- Sentiment and escalation analysis

## 📋 Setup Instructions

### Step 1: Set Up Supabase

1. **Create a Supabase Account**
   - Go to https://supabase.com
   - Create a new project

2. **Run the Database Schema**
   - Open your Supabase SQL Editor
   - Copy and paste the contents of `scripts/supabase-schema.sql`
   - Execute the script
   - This creates the `engagement_tracking` table and views

3. **Get Your Credentials**
   - In Supabase, go to Settings > API
   - Copy your Project URL
   - Copy your anon/public key

### Step 2: Configure n8n Environment Variables

Add these variables to your n8n instance:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**In n8n:**
- Go to Settings > Environment Variables
- Add the two variables above with your actual values

### Step 3: Update Your n8n Workflow

1. **Message Handler Already Updated**
   - The `message-handler.js` file now includes tracking code
   - It detects menu options (0-9) automatically
   - Outputs tracking data when analytics is enabled

2. **Add Analytics Tracking Node** (Optional separate workflow)
   - Import `n8n/workflows/analytics-tracking-workflow.json`
   - Or add the nodes manually to your main workflow
   - Connects after the message handler code node

3. **Workflow Structure:**
   ```
   Webhook → Message Handler Code → Send Response to Chatwoot
                                  ↓
                            Track to Supabase (if enabled)
   ```

### Step 4: Deploy Help Center Page

1. **Host the Help Center HTML**
   - Upload `help-center.html` to your web server
   - Or use GitHub Pages, Netlify, Vercel, etc.

2. **Update Video IDs**
   - Open `help-center.html`
   - Replace `VIDEO_ID_1`, `VIDEO_ID_2`, etc. with actual YouTube video IDs
   - Get video IDs from https://www.youtube.com/@shopvitrinnea

3. **Link from Bot**
   - When users select option 0, they receive the help center URL
   - Update the message in `message-handler.js` to include your help center link

### Step 5: Deploy Analytics Dashboard

1. **Configure Dashboard**
   - Open `analytics-dashboard.html`
   - Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your credentials

2. **Host the Dashboard**
   - Upload to your web server
   - Access via browser to view analytics

3. **Secure the Dashboard** (Recommended)
   - Add HTTP authentication
   - Or deploy to a private URL
   - Only share with authorized team members

## 📊 Database Schema

### engagement_tracking Table

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| conversation_id | INTEGER | Chatwoot conversation ID |
| account_id | INTEGER | Chatwoot account ID |
| inbox_id | INTEGER | Inbox identifier |
| inbox_name | TEXT | Inbox display name |
| sender_name | TEXT | User's name |
| intent | TEXT | Detected user intent |
| menu_option | TEXT | Selected menu option (0-9) |
| original_message | TEXT | User's original message |
| is_urgent | BOOLEAN | Urgency flag |
| is_negative | BOOLEAN | Negative sentiment flag |
| needs_human | BOOLEAN | Escalation to human flag |
| business_hours | BOOLEAN | During business hours |
| order_number | TEXT | Extracted order number |
| timestamp | TIMESTAMPTZ | Interaction timestamp |

### Views Available

- **daily_engagement_stats**: Aggregated daily statistics
- **menu_option_stats**: Menu option usage and popularity
- **inbox_performance**: Performance metrics per inbox

## 🎨 Customization

### Update Menu Options

Edit `message-handler.js` to modify menu options:

```javascript
// Add new option 10
} else if (message === '10') {
  intent = 'new_feature';
  menuOption = '10';
  response = 'Your custom message here';
```

### Customize Help Center

Edit `help-center.html`:
- Update branding colors in CSS
- Add/remove FAQ items
- Change contact information
- Embed your specific YouTube videos

### Modify Dashboard Charts

Edit `analytics-dashboard.html`:
- Change chart types (bar, line, pie, doughnut)
- Add new metrics
- Customize colors and styling
- Add additional filters

## 🔍 Using the Analytics

### Key Metrics to Monitor

1. **Bot Resolution Rate**: % of conversations resolved without human
2. **Popular Options**: Which menu options users click most
3. **Escalation Patterns**: When/why users request human agents
4. **Peak Hours**: Busiest times for customer interactions
5. **Inbox Performance**: Compare different communication channels

### Sample Queries

**Most Popular Menu Options (Last 7 Days):**
```sql
SELECT menu_option, COUNT(*) as uses
FROM engagement_tracking
WHERE timestamp > NOW() - INTERVAL '7 days'
  AND menu_option IS NOT NULL
GROUP BY menu_option
ORDER BY uses DESC;
```

**Escalation Rate by Inbox:**
```sql
SELECT inbox_name,
  COUNT(*) as total,
  SUM(CASE WHEN needs_human THEN 1 ELSE 0 END) as escalations,
  ROUND(SUM(CASE WHEN needs_human THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as escalation_rate
FROM engagement_tracking
GROUP BY inbox_name;
```

## 🎥 YouTube Integration

### Embed Videos in Help Center

1. Get video IDs from your @shopvitrinnea channel
2. Update iframe sources in `help-center.html`:
   ```html
   <iframe src="https://www.youtube.com/embed/YOUR_VIDEO_ID"></iframe>
   ```

### Recommended Tutorial Topics

- ✅ How to place your first order
- ✅ Tracking your shipment
- ✅ Processing returns and exchanges
- ✅ Account setup and management
- ✅ Payment methods explained
- ✅ Frequently asked questions

## 🔐 Security Considerations

1. **Supabase Row Level Security (RLS)**
   - Already enabled in schema
   - Only authenticated requests can read/write

2. **Environment Variables**
   - Never commit keys to Git
   - Use n8n's environment variable system
   - Rotate keys periodically

3. **Dashboard Access**
   - Add HTTP authentication
   - Use VPN or private network
   - Don't expose publicly without auth

## 📈 Next Steps

1. Monitor analytics for 1 week
2. Identify most requested features
3. Create more targeted YouTube tutorials
4. Optimize bot responses based on data
5. Add more menu options as needed

## 🐛 Troubleshooting

### Analytics Not Saving

- Check n8n environment variables are set
- Verify Supabase schema was created
- Check Supabase API logs for errors
- Ensure `track_analytics` is true in message handler output

### Dashboard Not Loading

- Confirm Supabase credentials in HTML file
- Check browser console for errors
- Verify CORS settings in Supabase
- Ensure RLS policies allow reads

### Help Center Videos Not Showing

- Replace placeholder VIDEO_IDs with actual IDs
- Check video privacy settings (must be Public or Unlisted)
- Verify YouTube embed is enabled for videos

## 📞 Support

For issues with:
- **Supabase**: Check https://supabase.com/docs
- **n8n**: Visit https://docs.n8n.io
- **Chatwoot**: See https://www.chatwoot.com/docs
- **This Bot**: Review code comments in `message-handler.js`

## 📝 File Reference

- `message-handler.js` - Main bot logic with analytics tracking
- `config/supabase.js` - Supabase configuration helper
- `scripts/supabase-schema.sql` - Database schema
- `help-center.html` - Help center with YouTube videos
- `analytics-dashboard.html` - Visual analytics dashboard
- `n8n/workflows/analytics-tracking-workflow.json` - n8n workflow template

---

**Created**: December 2025  
**Version**: 1.0.0  
**Author**: Vitrinnea Development Team
