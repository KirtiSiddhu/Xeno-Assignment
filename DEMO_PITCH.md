# 🎤 Xeno CRM — Demo Pitch Script
> **Target Duration:** ~5 minutes | **Audience:** Engineering Interviewers / Product Evaluators

---

## 🔧 Pre-Demo Setup (Run BEFORE the call)
```bash
# Terminal 1 – Channel Service
cd channel-service && npm start

# Terminal 2 – Backend
cd crm-backend && npx pnpm run dev

# Terminal 3 – Frontend
cd crm-frontend && npx pnpm run dev

# Terminal 4 – Pre-populate with data
cd crm-backend && node simulate_demo.js
```
Open **http://localhost:3000** in a full-screen browser window. You're ready.

---

## 🎬 Script

### [00:00 – 00:30] The Hook
> *Point to the Dashboard*

"This is Lumière's Marketing Command Center — built on an AI-native CRM I designed from scratch.

Most CRMs are passive tools: they store data and wait for you to act on it. **This one acts for you.**

Under the hood you have three independent services: the CRM backend, a completely separate async channel delivery simulator, and the Next.js frontend — all communicating through an event-driven callback architecture. Let me show you how it all comes together."

---

### [00:30 – 01:30] The AI Copilot (Core Differentiator)
> *Click on "AI Copilot" in the sidebar, type the following prompt:*

**Type:** `"Find customers in Bangalore who spent more than ₹5,000 and haven't bought in 60 days. Draft a WhatsApp win-back message and launch a campaign."`

> *While it processes:*

"What's happening behind the scenes is a Gemini-powered function-calling agent. It's not just generating text — it's invoking real tool calls: `preview_segment`, `create_segment`, `draft_message`, `create_campaign`, and `launch_campaign` — each one modifying the actual database in sequence. This is true agentic behavior, not a chatbot wrapper."

> *Once it responds, point to the tool call trace in the UI.*

"You can see the full execution trace here. Every action it took is logged and auditable."

---

### [01:30 – 02:30] The Campaign Canvas with Predictive Revenue
> *Click on "Campaigns" → "New Campaign"*

"Before launching any campaign, marketers usually have zero idea what the impact will be. I built a **Predictive Revenue Engine** directly into the creation flow."

> *Select a Segment from the dropdown*

"Watch what happens when I select the 'VIP Loyalists' segment and choose WhatsApp as the channel…"

> *The AI Pre-launch Prediction widget animates in*

"Instantly, the system estimates reach, expected delivery rate, conversion rate, and projected revenue — all calculated using historical channel performance data. This is the 'Predict-Before-You-Send' feature."

---

### [02:30 – 03:30] Async Delivery & Real-Time Analytics
> *Click on a completed campaign → View Details*

"Now let's look at how campaigns actually execute. When I hit Launch, the message dispatch job is published to an async queue. The **Channel Simulator Service** — running on port 4001 as a completely independent process — picks up the job and simulates realistic delivery behavior: send, delivered, opened, clicked, converted, with some intentional failures."

> *Point to the delivery funnel chart*

"Each state change fires a callback webhook back to the CRM. The callbacks have **exponential backoff retry logic** — 1s, 2s, 4s — to handle real-world network failures. The funnel you see updating here is driven by those async receipts, not by the main send request."

---

### [03:30 – 04:15] Customer Intelligence
> *Click on "Customers"*

"Every customer in this table now has a **Churn Risk Score** — Low, Medium, or High — calculated using an RFM-based model: Recency of last purchase, Frequency of orders, and Monetary value. This runs server-side on every request, simulating what in production would be a dedicated ML microservice running XGBoost."

> *Point to the color-coded badges*

"High-risk customers are flagged in red. Click on any one of them and you get a **Next Best Action** recommendation — 'Send Win-back Email Sequence' or 'Invite to VIP Program' — depending on their spend level."

---

### [04:15 – 05:00] Architecture & Scale
> *Share screen with ARCHITECTURE.md or a whiteboard*

"Let me quickly walk through the system design choices:

- **SQLite in dev, Postgres in production** — zero infra for evaluation, swap for scale
- **Campaign dispatch is fully async** — the API returns immediately, workers process in background  
- **Channel service is a completely isolated process** — in production this maps to a real provider like Twilio or Kaleyra
- **ClickHouse** would replace the analytics queries at scale — the communications table partitioned by month for sub-second funnel queries
- **The AI agent uses function calling**, not free-form SQL — so it can never execute a destructive query. Every action maps to a pre-validated API endpoint.

This is production-grade thinking applied to an MVP."

---

## 💡 Key Talking Points (If Asked)

| Question | Answer Highlight |
|---|---|
| Why SQLite? | Zero infra for evaluation. Schema is Postgres-compatible; swap is one env var. |
| How is the AI safe? | It uses Gemini Function Calling — never raw SQL. It invokes our validated API tools. |
| How do you handle provider failure? | Exponential backoff retry queue in the channel service. Messages don't get lost. |
| How does churn work? | RFM velocity model — days since last order, order frequency, total spend — scored 0–100. |
| How would you scale this? | Replace SQLite with RDS Postgres, Redis + BullMQ for queue, ClickHouse for analytics, deploy on ECS/K8s. |
| Unique feature? | Predict-Before-You-Send — revenue forecasting before campaign launch. No competitor does this inline. |
