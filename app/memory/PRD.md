"# SignalDeck - Client-Side WiFi Analysis (PRD)

## Original Problem Statement
> \"i want you to build a n app for client side wifi analysis (a fullstack app) that can solve client side wifi network issues i will give you the image of it give me both frontend and backend for it i have seen you creating errors while coding please test and give i dont have time to check\"

User provided a mobile design reference (WiFi Health Score gauge, What's Wrong Now, Smart Recommendations, Problem Timeline, Fix My WiFi, Zone Map, Prediction Alert).

## User Choices
- Data source: **Simulated demo data** (realistic, time-varying)
- AI for recommendations + prediction: **Claude Sonnet 4.5** via Emergent Universal Key (default)
- Auth: **None** (default)
- Scope: **All 7 screens** (default)

## Architecture
- **Frontend**: React 19 + React Router 7 + Shadcn + Tailwind + Sonner + Phosphor Icons
- **Backend**: FastAPI + Motor (MongoDB async) + emergentintegrations (Claude Sonnet 4.5)
- **DB**: MongoDB (collection: `timeline`, auto-seeded with 6 sample events)
- **Design**: Swiss Brutalist Dark Mode (Chivo / IBM Plex Mono / IBM Plex Sans), no rounded corners, monochrome palette with functional color accents (#00FF66, #FFEA00, #FF3333, #3366FF).

## Core Requirements (static)
- Live simulated network metrics (signal, latency, throughput, devices, congestion)
- Compute health score 0-100 from weighted metrics
- Detect WiFi issues with severity (critical/warning/info/success)
- Animated diagnostic scanner (8 steps, ~8-10s)
- AI-generated smart recommendations with \"Apply Fix\" actions
- AI network slowdown prediction with confidence %
- Zone heatmap visualisation
- Historical timeline (persisted in MongoDB)
- Connected devices list
- Mobile-responsive (bottom nav) + desktop sidebar

## Implemented (Feb 2026)
- Backend endpoints (all under /api/network/*):
  - `GET /status`, `GET /issues`, `GET /devices`, `GET /heatmap`, `GET /timeline`, `GET /prediction`
  - `POST /recommendations`, `POST /diagnose`, `GET /diagnose/{id}`, `POST /band`, `POST /restart-router`
- Frontend routes: `/`, `/diagnose`, `/recommendations`, `/heatmap`, `/devices`, `/timeline`, `/prediction`
- Tested: 13/13 backend + 7/7 frontend (iteration_1.json)

## Prioritized Backlog
- **P1**: Persist diagnostic sessions in Mongo (currently in-memory)
- **P1**: Split `server.py` into routers/modules as it grows
- **P2**: Real browser Network API hooks (navigator.connection) as optional live augmentation
- **P2**: Per-device throttling / QoS simulation UI
- **P2**: Export diagnostic report as PDF
- **P3**: PWA + push notifications for prediction alerts
- **P3**: Multi-network profile support
"
