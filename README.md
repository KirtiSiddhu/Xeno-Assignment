# Xeno CRM — AI-Native Marketing Platform

> An AI-native Mini CRM for **Lumière**, a premium fashion brand. Built for the Xeno engineering challenge.

## Architecture

```
crm-frontend/     → Next.js 14 app (port 3000)
crm-backend/      → Express API + SQLite + Gemini AI agent (port 4000)
channel-service/  → Stub delivery service with async callbacks (port 4001)
```

## Quick Start

### 1. Channel Service
```bash
cd channel-service
npm install
cp .env.example .env
npm run dev
```

### 2. CRM Backend
```bash
cd crm-backend
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env (optional — works in mock mode without it)
npm run seed    # Seeds 500 customers + orders
npm run dev
```

### 3. Frontend
```bash
cd crm-frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000

## Features

- **AI Agent (Xena)** — Chat-first campaign orchestration powered by Gemini
- **Customer Explorer** — 500 seeded realistic Indian customers with order history
- **Segment Builder** — Rule-based segmentation (spend, recency, city, gender, age)
- **Campaign Manager** — Create, launch, and track campaigns across Email/SMS/WhatsApp/RCS
- **Delivery Simulation** — Full async delivery lifecycle with realistic probabilities
- **Analytics Dashboard** — Real-time campaign funnel and performance insights

## Environment Variables

### crm-backend/.env
```
PORT=4000
CHANNEL_SERVICE_URL=http://localhost:4001
GEMINI_API_KEY=your_key_here   # Optional — mock mode used if absent
DB_PATH=./data/crm.db
```

### channel-service/.env
```
PORT=4001
CRM_BACKEND_URL=http://localhost:4000
```

### crm-frontend/.env.local
```
NEXT_PUBLIC_CRM_API_URL=http://localhost:4000
```

## System Design Notes

- SQLite chosen for zero-infra portability — swap to Postgres for production
- Channel service is a completely separate process, simulating real provider isolation
- Receipt callbacks use exponential backoff retry (1s, 2s, 4s)
- Segment engine builds dynamic SQL from rules — extensible to 100+ rule types
- Gemini function calling enables true agentic behavior, not just text generation
