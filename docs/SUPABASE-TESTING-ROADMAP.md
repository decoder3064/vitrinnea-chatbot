# 🗺️ Supabase Testing & Analytics Roadmap

## Phase 1: Setup Supabase Database ⚙️

### Step 1.1: Create the Table
1. **Go to Supabase Dashboard:**
   - Open: https://bebpurrhicckptmsvvdg.supabase.co
   - Login with your credentials

2. **Navigate to SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Schema:**
   - Copy the entire content from `scripts/supabase-schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" or press Cmd+Enter

4. **Verify Table Creation:**
   - Click "Table Editor" in sidebar
   - Look for `engagement_tracking` table
   - You should see columns: id, conversation_id, account_id, inbox_id, inbox_name, sender_name, intent, menu_option, etc.

### Step 1.2: Test Connection
1. **Import Test Workflow to n8n:**
   - Go to http://localhost:5678
   - Click "Workflows" → "Import from File"
   - Select `n8n/workflows/supabase-test-workflow.json`
   - Click "Activate workflow"

2. **Get the Test Webhook URL:**
   - Open the workflow in n8n
   - Click on the "Manual Trigger" webhook node
   - Copy the test URL (should be: `https://deedee-unascertainable-giuliana.ngrok-free.dev/webhook-test/test-supabase`)

3. **Send a Test Request:**
   ```bash
   curl -X POST https://deedee-unascertainable-giuliana.ngrok-free.dev/webhook-test/test-supabase
   ```

4. **Check Results:**
   - ✅ If successful: You'll see a JSON response with "success": true
   - ❌ If failed: Check the n8n execution logs for errors
   - Go to Supabase Table Editor → engagement_tracking
   - You should see a new row with test data

---

## Phase 2: Test Tutorial Videos Flow 🎥

### Step 2.1: Test Tutorial Keywords
Send these messages to your WhatsApp test chat:

1. **Test number menu:**
   - Send: `0`
   - Expected: Tutorial menu with options

2. **Test keyword variations:**
   - Send: `tutorial`
   - Send: `video`
   - Send: `ayuda visual`
   - Send: `como usar`
   - Send: `como publicar`
   - All should show the tutorial menu

3. **Test menu navigation:**
   - Send: `menu` or `1`
   - Should show main menu with tutorial option (0️⃣)

### Step 2.2: Verify Responses
Check that responses include:
- 📚 Tutorials header
- Tutorial options (1-4)
- Help center link: https://chat-sv.service.vitrinnea.com/hc/servicio-al-cliente
- YouTube channel link
- "Escribe MENU para más opciones"

---

## Phase 3: View Engagement Metrics 📊

### Step 3.1: Raw Data View
1. **In Supabase Dashboard:**
   - Go to "Table Editor"
   - Click on `engagement_tracking`
   - Filter by:
     - `inbox_id = 23` (WhatsApp)
     - `intent = 'help_center'` (tutorial requests)
   - Sort by `timestamp DESC` to see latest

### Step 3.2: Daily Stats View
1. **Run SQL Query:**
   ```sql
   SELECT * FROM daily_engagement_stats
   ORDER BY date DESC
   LIMIT 30;
   ```

2. **Metrics to watch:**
   - `interaction_count` - Total interactions per day
   - `unique_conversations` - Unique users
   - `escalations_to_human` - How many needed human help
   - `urgent_count` - Urgent requests
   - `negative_sentiment_count` - Complaints

### Step 3.3: Menu Option Analytics
```sql
SELECT 
  menu_option,
  intent,
  COUNT(*) as uses,
  COUNT(DISTINCT conversation_id) as unique_users
FROM engagement_tracking
WHERE menu_option IS NOT NULL
GROUP BY menu_option, intent
ORDER BY uses DESC;
```

### Step 3.4: Tutorial Performance
```sql
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as tutorial_requests,
  COUNT(DISTINCT sender_name) as unique_users,
  COUNT(CASE WHEN needs_human THEN 1 END) as still_needed_human
FROM engagement_tracking
WHERE intent = 'help_center'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

---

## Phase 4: Enable Tracking in Main Bot 🤖

### Step 4.1: Add Supabase Back to Main Workflow
Once testing confirms Supabase works:

1. **Update workflow connections** to include Supabase:
   ```
   Send to Chatwoot → Success (immediate)
                    → Track to Supabase (parallel, non-blocking)
   ```

2. **Re-import updated workflow**
3. **Test with real message**
4. **Verify data appears in Supabase**

---

## Phase 5: Create Dashboard (Optional) 📈

### Option A: Supabase Built-in
- Use Supabase SQL Editor for quick queries
- Export to CSV for Excel/Google Sheets

### Option B: Connect to `analytics-dashboard.html`
- Modify the existing dashboard in the repo
- Use the `anon_key` to query the public views
- Views are safe because they only show aggregated data

### Option C: External Tools
- Connect Metabase, Grafana, or Google Data Studio
- Use Supabase connection string
- Build visual dashboards

---

## Quick Reference Commands

### Test Supabase Connection
```bash
curl -X POST https://deedee-unascertainable-giuliana.ngrok-free.dev/webhook-test/test-supabase
```

### Check n8n Logs
```bash
docker-compose logs -f n8n
```

### Restart n8n
```bash
docker-compose restart n8n
```

### View Recent Engagements
```sql
SELECT 
  sender_name,
  intent,
  menu_option,
  original_message,
  timestamp
FROM engagement_tracking
ORDER BY timestamp DESC
LIMIT 20;
```

---

## Success Checklist ✅

- [ ] Supabase table created successfully
- [ ] Test workflow inserts data successfully
- [ ] Tutorial flow (message "0") works in WhatsApp
- [ ] Data appears in Supabase after test messages
- [ ] Can query and view analytics in Supabase
- [ ] Main bot responds to all tutorial keywords
- [ ] No errors in n8n execution logs
- [ ] Analytics views accessible in Supabase

---

## Troubleshooting 🔧

**Problem:** Table doesn't exist error
- **Solution:** Run the schema SQL again in Supabase SQL Editor

**Problem:** Permission denied when inserting
- **Solution:** Check you're using `service_role_key`, not `anon_key`

**Problem:** Test workflow fails
- **Solution:** Check ngrok is running and n8n is accessible

**Problem:** Data not appearing in table
- **Solution:** Check n8n execution logs for HTTP errors
- Verify the Supabase URL is correct
- Check Row Level Security policies in Supabase

**Problem:** Can't see views
- **Solution:** Make sure you ran the full schema including the view creation
