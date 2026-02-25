# HotBot Studios — n8n + AISensy Integration Architecture

## Complete System Overview

```
┌──────────────────────────────────────────────────────────┐
│                    USER (Website Chat)                     │
│                    Opens chat widget                       │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│              EXPRESS BACKEND (server.js)                   │
│              POST /api/chat                                │
│              POST /api/escalate                            │
│                                                           │
│   Checks: Is N8N_AI_WEBHOOK set?                          │
│   ┌──── YES ────┐         ┌──── NO ─────┐                │
│   ▼              │         ▼              │                │
│   Route to n8n   │         Direct OpenAI  │                │
└───┬──────────────┘─────────┬──────────────┘────────────────┘
    │                        │
    ▼                        ▼
┌──────────────────┐  ┌───────────────┐
│   n8n WORKFLOW 1  │  │  OpenAI API   │
│   AI Chat + RAG   │  │  (Fallback)   │
│                   │  └───────────────┘
│  ┌─────────────┐ │
│  │  Webhook     │ │
│  │  Trigger     │ │
│  └──────┬──────┘ │
│         ▼        │
│  ┌─────────────┐ │
│  │  Google      │ │
│  │  Drive       │──── Retrieves docs, pricing, FAQs
│  │  Tool Node   │ │
│  └──────┬──────┘ │
│         ▼        │
│  ┌─────────────┐ │
│  │  Vector      │ │
│  │  Store       │──── Semantic search across all documents
│  │  (Pinecone/  │ │
│  │   Qdrant)    │ │
│  └──────┬──────┘ │
│         ▼        │
│  ┌─────────────┐ │
│  │  AI Agent    │ │
│  │  Node        │──── OpenAI + retrieved context = RAG response
│  │  (GPT-4o)    │ │
│  └──────┬──────┘ │
│         ▼        │
│  ┌─────────────┐ │
│  │  Respond to  │ │
│  │  Webhook     │──── Returns { reply: "..." } to backend
│  └─────────────┘ │
└──────────────────┘

    ┌───── On Escalation ─────┐
    ▼                          ▼
┌──────────────────┐  ┌──────────────────┐
│  n8n WORKFLOW 2   │  │  AISensy API     │
│  Escalation Flow  │  │  (Direct Call)   │
│                   │  │                  │
│  Webhook Trigger  │  │  POST .../api/v2 │
│       ▼           │  │  Template msg →  │
│  Format message   │  │  Agent WhatsApp  │
│       ▼           │  └──────────────────┘
│  Log to Google    │
│  Sheets           │
│       ▼           │
│  Notify Slack     │
│       ▼           │
│  Create CRM entry │
└──────────────────┘
```


## Workflow 1: AI Chat with RAG (Knowledge Base)

### Purpose
Routes user messages through n8n so the AI can access your Google Drive
documents, stored knowledge, and vector embeddings before generating a response.

### n8n Node Configuration (Step by Step)

```
Node 1: Webhook
├── Method: POST
├── Path: /hotbot-ai-chat
├── Response Mode: "Last Node"
├── Authentication: None (internal network) or Header Auth
│
Node 2: Set Node (Format Input)
├── Extract: session_id, messages, last_message
├── Set: current_timestamp
│
Node 3: Google Drive (Search Files)
├── Operation: Search Files
├── Query: Use last_message keywords
├── Folder ID: Your HotBot knowledge base folder
├── Returns: Matching document IDs
│
Node 4: Google Drive (Download File)
├── Operation: Download File
├── File ID: From Node 3 results
├── Returns: Document content (text)
│   NOTE: For PDFs, use Google Docs export or a
│   separate PDF-to-text node
│
Node 5: AI Agent Node
├── Model: gpt-4o or gpt-4o-mini
├── System Prompt:
│     "You are HotBot Studios AI assistant.
│      You help businesses with automation, AI agents, growth systems.
│      Be strategic. Be concise. Qualify leads.
│      Push toward booking a call.
│
│      USE THE FOLLOWING CONTEXT TO ANSWER:
│      {{$node["Google Drive"].json.content}}
│
│      If the context doesn't contain relevant info,
│      use your general knowledge but stay on-brand."
│
├── Tools (connected sub-nodes):
│     ├── Google Drive Tool
│     │     └── Search and retrieve specific documents on demand
│     ├── Vector Store Tool (optional)
│     │     └── Semantic search across embedded documents
│     └── Calculator Tool (optional)
│           └── For pricing/ROI calculations
│
├── Chat History: Wire in the messages array
├── Max Tokens: 400
├── Temperature: 0.7
│
Node 6: Respond to Webhook
├── Response Body:
│     {
│       "reply": "{{ $json.output }}",
│       "sources": "{{ $json.sources || [] }}"
│     }
├── Status Code: 200
```

### Setting Up Google Drive as Knowledge Base

1. **Create a dedicated folder** in Google Drive: `HotBot Knowledge Base`
2. **Upload your documents:**
   - `pricing.pdf` — Service pricing and packages
   - `case-studies.pdf` — Client success stories with metrics
   - `faq.md` — Frequently asked questions
   - `services-overview.md` — Detailed service descriptions
   - `onboarding-process.md` — How you onboard new clients
   - `competitor-comparison.md` — How you differ from competitors
3. **Connect Google Drive** in n8n:
   - Settings → Credentials → Google Drive OAuth2
   - Grant read access to the folder
4. **For better search**: Use n8n's vector store integration
   - Embed all documents into Pinecone/Qdrant/Supabase
   - AI Agent uses vector search tool for semantic retrieval


## Workflow 2: Escalation Handler

### Purpose
When a user clicks "Talk to Human", this workflow:
- Logs the escalation
- Notifies the team via Slack/email
- Creates a CRM entry
- (AISensy sends the WhatsApp message directly from backend)

### n8n Node Configuration

```
Node 1: Webhook
├── Method: POST
├── Path: /hotbot-escalation
├── Response Mode: "Immediately"
│
Node 2: Set Node (Enrich Data)
├── session_id, priority, messages, escalated_at
├── Calculate: conversation_duration, message_count
├── Extract: key_topics from messages
│
Node 3: Google Sheets (Log Escalation)
├── Operation: Append Row
├── Spreadsheet: "HotBot Escalation Log"
├── Columns: Date, Session ID, Priority, Summary,
│            Message Count, Status
│
Node 4: Slack (Notify Team)  [Optional]
├── Channel: #hotbot-escalations
├── Message:
│     "🔥 New escalation (Priority: {{priority}}/10)
│      Session: {{session_id}}
│      Messages: {{message_count}}
│      Last message: {{last_user_message}}
│      Dashboard: https://hotbotstudios.com/dashboard"
│
Node 5: HTTP Request (CRM Entry)  [Optional]
├── If using HubSpot/Salesforce/Pipedrive
├── Create contact or deal from conversation data
│
Node 6: Respond to Webhook
├── { "success": true }
```


## Workflow 3: WhatsApp Inbound Reply Handler

### Purpose
When your agent replies to the AISensy escalation message on WhatsApp,
route that reply back into the HotBot live chat.

### Architecture

```
Agent replies on WhatsApp
        │
        ▼
AISensy Webhook Callback ──→ n8n Webhook
                                   │
                                   ▼
                             Parse message
                                   │
                                   ▼
                         HTTP Request Node
                         POST /api/agent/message
                         {
                           session_id: (from AISensy attributes),
                           message: agent's reply text,
                           agent_name: "Agent Name"
                         }
                                   │
                                   ▼
                         Backend pushes to Socket.io
                         User sees reply in chat widget
```

### n8n Node Configuration

```
Node 1: Webhook
├── Method: POST
├── Path: /hotbot-whatsapp-inbound
├── Note: Set this URL as your AISensy inbound webhook
│
Node 2: IF Node (Filter)
├── Condition: Check if message contains session_id reference
├── Or: Match by phone number to active escalation
│
Node 3: HTTP Request
├── Method: POST
├── URL: https://hotbotstudios.com/api/agent/message
├── Body:
│     {
│       "session_id": "{{ extracted_session_id }}",
│       "message": "{{ $json.message.text }}",
│       "agent_name": "{{ $json.sender.name }}"
│     }
│
Node 4: Respond to Webhook
├── { "status": "delivered" }
```


## AISensy Template Setup

### Step 1: Create Template in AISensy Dashboard

Go to **AISensy Dashboard → Templates → Create Template**

```
Template Name: hotbot_escalation_alert
Category: UTILITY
Language: English

Header: 🔥 New Chat Escalation

Body:
New lead needs attention!
Session: {{1}}
Priority: {{2}}/10
Last message: "{{3}}"
Total messages: {{4}}

Reply to this message to respond in the live chat.

Footer: HotBot Studios
```

Wait for Meta approval (usually 10 min – 3 hours).

### Step 2: Create API Campaign

Go to **Campaigns → +Launch → API Campaign**
- Campaign Name: `hotbot_escalation_alert` (this must match AISENSY_CAMPAIGN_NAME in .env)
- Template: Select your approved template
- Set campaign **LIVE**

### Step 3: Get Your API Key

Go to **Manage → API Key → Copy**
Paste into your `.env` as `AISENSY_API_KEY`


## Environment Variables Summary

```env
# n8n Webhooks
N8N_AI_WEBHOOK=https://n8n.harshpreetbhasin.com/webhook/hotbot-ai-chat
N8N_ESCALATION_WEBHOOK=https://n8n.harshpreetbhasin.com/webhook/hotbot-escalation

# AISensy WhatsApp API
AISENSY_API_KEY=your-key-from-dashboard
AISENSY_CAMPAIGN_NAME=hotbot_escalation_alert
AGENT_WHATSAPP_NUMBER=+919876543210
AGENT_NAME=Harshpreet

# OpenAI (used as fallback if n8n is down, or direct mode)
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o-mini

# MongoDB
MONGO_URI=mongodb://localhost:27017/hotbot
```


## Complete Message Flow

### AI Chat Flow
```
1. User types message in chat widget
2. Frontend POST /api/chat { session_id, message }
3. Backend saves to MongoDB
4. Backend checks N8N_AI_WEBHOOK env var
5. If set → POST to n8n webhook with last 10 messages
   └─ n8n searches Google Drive for relevant docs
   └─ n8n passes docs + messages to AI Agent node
   └─ AI Agent generates context-aware response
   └─ n8n returns { reply: "..." } to backend
6. If not set → Direct OpenAI call (no document context)
7. Backend saves AI response to MongoDB
8. Backend emits response via Socket.io
9. User sees response in chat widget
```

### Escalation Flow
```
1. User clicks "Talk to Human"
2. Frontend POST /api/escalate { session_id }
3. Backend updates conversation: mode=human, status=escalated
4. Backend calls AISensy API directly
   └─ POST https://backend.aisensy.com/campaign/t1/api/v2
   └─ Sends approved template to agent's WhatsApp
5. Backend calls N8N_ESCALATION_WEBHOOK (if set)
   └─ n8n logs to Google Sheets
   └─ n8n notifies Slack
   └─ n8n creates CRM entry
6. Backend emits escalation_event via Socket.io
7. User sees "Agent connected via WhatsApp" banner
8. Agent sees WhatsApp notification with conversation summary
```

### Agent Reply Flow (WhatsApp → Live Chat)
```
1. Agent replies to WhatsApp message
2. AISensy sends inbound webhook to n8n
3. n8n extracts session_id from message/attributes
4. n8n POST /api/agent/message to backend
5. Backend saves agent message to MongoDB
6. Backend emits via Socket.io to user's session
7. User sees agent reply in chat widget (tagged "HUMAN")
```


## Google Drive Knowledge Base Structure

```
📁 HotBot Knowledge Base (Google Drive Folder)
├── 📄 services/
│   ├── ai-automation-overview.md
│   ├── ai-agents-capabilities.md
│   ├── growth-systems-details.md
│   └── integration-list.md
├── 📄 pricing/
│   ├── pricing-tiers-2026.pdf
│   ├── enterprise-custom-pricing.md
│   └── roi-calculator-assumptions.md
├── 📄 case-studies/
│   ├── scaleforce-312-pipeline-growth.md
│   ├── novatech-847k-revenue.md
│   └── apex-digital-4x-multiplier.md
├── 📄 sales/
│   ├── objection-handling.md
│   ├── competitor-comparison.md
│   ├── qualification-criteria.md
│   └── booking-call-scripts.md
├── 📄 support/
│   ├── faq.md
│   ├── onboarding-process.md
│   └── sla-details.md
└── 📄 company/
    ├── about-hotbot.md
    ├── team-bios.md
    └── privacy-policy.md
```

The AI Agent in n8n searches this folder dynamically. When a user asks
"What does your automation service cost?", the agent retrieves
`pricing-tiers-2026.pdf` and uses it to give an accurate, grounded answer.


## Testing Checklist

### AISensy Integration
- [ ] API key is valid (test with Postman first)
- [ ] Template message is approved by Meta
- [ ] API campaign is set to LIVE status
- [ ] Agent phone number receives test escalation
- [ ] Template params count matches template variables

### n8n AI Workflow
- [ ] Webhook URL is accessible from backend server
- [ ] Google Drive credentials connected and authorized
- [ ] Test document retrieval from knowledge base folder
- [ ] AI Agent returns coherent responses with document context
- [ ] Fallback to direct OpenAI works when n8n is down
- [ ] Response time is under 10 seconds

### n8n Escalation Workflow
- [ ] Webhook receives escalation payload
- [ ] Google Sheets logging works
- [ ] Slack notification fires (if configured)
- [ ] CRM entry created (if configured)

### End-to-End
- [ ] User sends message → AI responds with document context
- [ ] User escalates → Agent gets WhatsApp notification
- [ ] Agent replies on WhatsApp → User sees reply in chat
- [ ] Dashboard shows live conversation stream
- [ ] Multiple concurrent sessions work independently
