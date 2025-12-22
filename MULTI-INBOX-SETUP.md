# Multi-Inbox Setup Guide

## ✅ Features Implemented

1. **📋 Interactive Menu** - Options 1-9 + keyword "MENU"
2. **🙋 Agent Assignment** - Option 9 or keywords: "agente", "humano", "persona"
3. **📥 Multi-Inbox Support** - Automatically detects and responds based on inbox

---

## 🚀 How It Works with Multiple Inboxes

### Automatic Inbox Detection

The bot automatically detects which inbox the message came from using `inbox_id` from the webhook payload:

```javascript
const inboxId = body.inbox?.id || body.conversation?.inbox_id;
```

### Inbox-Specific Configurations

In `message-handler.js`, configure each inbox:

```javascript
const inboxConfig = {
  17: { // WhatsApp El Salvador
    name: 'WhatsApp SV',
    greeting: 'WhatsApp',
    supportEmail: 'soporte-sv@vitrinnea.com',
    phone: '+503 XXXX-XXXX'
  },
  23: { // WhatsApp (default)
    name: 'WhatsApp',
    greeting: 'WhatsApp',
    supportEmail: 'soporte@vitrinnea.com',
    phone: '+506 XXXX-XXXX'
  },
  default: { // Fallback for web chat, etc.
    name: 'Chat',
    greeting: 'Vitrinnea',
    supportEmail: 'soporte@vitrinnea.com',
    phone: '+506 XXXX-XXXX'
  }
};
```

###Adding a New Inbox

1. **Get the Inbox ID** from Chatwoot:
   - Go to Chatwoot → Settings → Inboxes
   - Click on the inbox
   - The URL will be: `https://your-chatwoot.com/app/accounts/2/settings/inboxes/[ID]`

2. **Add to configuration**:
```javascript
const inboxConfig = {
  // ... existing inboxes
  25: { // NEW INBOX
    name: 'WhatsApp Guatemala',
    greeting: 'WhatsApp',
    supportEmail: 'soporte-gt@vitrinnea.com',
    phone: '+502 XXXX-XXXX'
  }
};
```

3. **Update n8n workflow**:
   - Copy the updated code from `message-handler.js`
   - Paste into the "Process Message & Generate Response" Code node in n8n
   - Save the workflow

---

## 📋 Menu System

### How to Trigger Menu

Users can access the menu by typing:
- `MENU` or `menu`
- `1` (number one)
- `menú` (with accent)
- `opciones`

### Menu Options

| Number | Intent | Description |
|--------|--------|-------------|
| 1️⃣ | menu | Show full menu again |
| 2️⃣ | shipping | Shipping information |
| 3️⃣ | returns | Returns and exchanges |
| 4️⃣ | pricing | Product prices |
| 5️⃣ | account | Account assistance |
| 6️⃣ | billing | Billing and payments |
| 7️⃣ | availability | Product availability |
| 8️⃣ | contact | Contact information |
| 9️⃣ | **request_agent** | **Connect with human agent** |

---

## 🙋 Agent Assignment (Option 9)

### How It Works

When a user types `9` or agent-related keywords, the bot:

1. Sets `needs_human: true` flag
2. Sends appropriate response based on business hours
3. **Ready for agent assignment** (you need to add the assignment node)

### Keywords that Trigger Agent Request

- Number: `9`
- Spanish: `agente`, `humano`, `persona`, `asesor`
- Automatic: Complaints (`queja`, `reclamo`, `problema`)
- Automatic: Urgent + business hours

### Adding Actual Agent Assignment

**To make it actually assign an agent**, add these nodes after "Send Response to Chatwoot":

#### 1. Add IF Node: "Needs Human?"
```
Condition: {{ $json.needs_human }} equals true
```

#### 2. Add HTTP Request Node: "Assign to Agent"
**When needs_human = true:**

```
Method: POST
URL: https://chat-sv.service.vitrinnea.com/api/v1/accounts/{{$json.account_id}}/conversations/{{$json.conversation_id}}/assignments

Authentication: HTTP Header Auth (same as before)

Body (JSON):
{
  "assignee_id": 2  // Change to your agent's ID
}
```

**To find Agent ID:**
- Chatwoot → Settings → Agents
- Click on an agent
- URL shows: `/app/accounts/2/settings/agents/[AGENT_ID]`

#### Workflow Structure

```
Webhook → Process Message → Send Response → Needs Human? 
                                               ├─ YES → Assign Agent → Success
                                               └─ NO → Success
```

---

## 🧪 Testing Multi-Inbox

### Test with curl

```bash
# Test WhatsApp SV (inbox 17)
curl -X POST http://localhost:5678/webhook/chatwoot \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "account": {"id": 2},
      "conversation": {"id": 691},
      "inbox": {"id": 17},
      "content": "MENU",
      "message_type": "incoming",
      "sender": {"name": "Test User", "type": "contact"}
    }
  }'

# Test WhatsApp (inbox 23)
curl -X POST http://localhost:5678/webhook/chatwoot \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "account": {"id": 2},
      "conversation": {"id": 691},
      "inbox": {"id": 23},
      "content": "9",
      "message_type": "incoming",
      "sender": {"name": "David", "type": "contact"}
    }
  }'
```

### Expected Behavior

- **Inbox 17**: Shows "Menú de Opciones - WhatsApp SV"
- **Inbox 23**: Shows "Menú de Opciones - WhatsApp"
- **Unknown inbox**: Shows "Menú de Opciones - Chat" (default)
- **Option 9**: Shows agent connection message

---

## 📊 Data Output

The Code node now returns these fields:

```javascript
{
  conversation_id: 691,
  account_id: 2,
  inbox_id: 23,              // NEW: Which inbox
  inbox_name: "WhatsApp",    // NEW: Inbox display name
  sender_name: "David",
  original_message: "9",
  intent: "request_agent",   // NEW: Can be "menu", "request_agent", etc.
  response_text: "🙋 Perfecto...",
  is_urgent: false,
  is_negative: false,
  order_number: null,
  needs_human: true,          // NEW: Flag for agent assignment
  business_hours: false       // NEW: Whether in business hours
}
```

---

## 🎯 Next Steps

### To Complete Agent Assignment:

1. **Import updated workflow** into n8n
   - Copy code from `message-handler-code.js`
   - Paste into Code node
   - Save

2. **Add agent assignment nodes**:
   - IF node: Check `needs_human`
   - HTTP Request: Assign to agent (see above)

3. **Configure agent IDs** in Chatwoot:
   - Find agent IDs
   - Update assignment API call

### To Add More Inboxes:

1. Get inbox ID from Chatwoot URL
2. Add to `inboxConfig` object
3. Update Code node in n8n
4. Test with curl or real messages

---

## ❓ FAQ

**Q: Does it work with existing webhooks?**
A: Yes! The bot automatically detects `inbox_id` from any Chatwoot webhook.

**Q: What if inbox_id is missing?**
A: It uses the `default` configuration (Chat).

**Q: Can different inboxes have different menus?**
A: Yes! You can add inbox-specific logic. Example:

```javascript
if (inboxId === 17) {
  // Spanish only menu for El Salvador
} else {
  // Standard menu
}
```

**Q: How do I update responses for one inbox only?**
A: Check `inboxId` or `inbox.name` in the intent logic:

```javascript
if (intent === 'pricing' && inboxId === 17) {
  response = '💰 Precios especiales para El Salvador...';
}
```

---

## 📝 Summary

✅ **Menu system**: Type `MENU` or numbers 1-9
✅ **Agent option**: Type `9` or "agente" keywords  
✅ **Multi-inbox**: Automatically detects and responds per inbox
✅ **Easy to extend**: Add more inboxes in `inboxConfig`

**Next**: Add agent assignment HTTP node to complete the flow!
