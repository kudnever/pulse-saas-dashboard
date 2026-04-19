# Pulse — SaaS Analytics Platform

A full-stack B2B SaaS analytics dashboard built as a portfolio showcase. Pulse is a fictional analytics product for SaaS companies — think ChartMogul or Baremetrics.

![Dashboard Preview](https://img.shields.io/badge/stack-React%20%7C%20Node.js%20%7C%20PostgreSQL-6366f1)
![License](https://img.shields.io/badge/license-MIT-slate)

## Features

**Analytics**
- MRR / ARR / ARPU / LTV / LTV:CAC / NRR / CAC Payback — all on the overview
- Revenue breakdown: new, expansion, contraction, churn (stacked bar)
- MRR Waterfall chart — cumulative movement over 3 / 6 / 12 months
- Revenue forecast with ±15% widening confidence cone
- Retention cohort heatmap (12 × 12 months)
- Plan distribution donut chart

**Platform**
- JWT auth — 15-min access tokens + 7-day refresh tokens stored in DB
- RBAC — Admin / Manager / Viewer roles with granular permissions
- User invite — create team members directly from the admin panel
- Saved reports with chart preview (line / bar / area)
- CSV export for revenue data
- WebSocket real-time feed — live transactions and metric updates
- Command palette — ⌘K / Ctrl+K global search
- Dark mode — persists across sessions (respects `prefers-color-scheme` on first visit)

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18, TanStack Router, TanStack Query, Zustand |
| Charts | Chart.js v3 + react-chartjs-2 |
| Styling | Tailwind CSS v3, Inter font |
| Backend | Node.js, Express, Drizzle ORM |
| Database | PostgreSQL (Docker) |
| Auth | bcryptjs, jsonwebtoken |
| Validation | Zod |
| Monorepo | pnpm workspaces |

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- Docker (for PostgreSQL)

### Setup

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/saas-dashboard.git
cd saas-dashboard

# 2. Install dependencies
pnpm install

# 3. Start the database
docker compose up -d

# 4. Configure environment
cp packages/server/.env.example packages/server/.env
# Edit packages/server/.env if needed (defaults work out of the box)

# 5. Run database migrations and seed demo data
pnpm --filter server db:migrate
pnpm --filter server db:seed

# 6. Start dev servers (client + server in parallel)
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

### Demo Accounts

| Email | Password | Role |
|---|---|---|
| admin@demo.com | demo123 | Admin |
| manager@demo.com | demo123 | Manager |
| viewer@demo.com | demo123 | Viewer |

## Project Structure

```
saas-dashboard/
├── packages/
│   ├── client/          # React app (Vite)
│   │   └── src/
│   │       ├── components/   # Charts, layout, UI primitives
│   │       ├── pages/        # Route-level components
│   │       ├── hooks/        # TanStack Query hooks
│   │       └── stores/       # Zustand stores (auth, filter, palette)
│   ├── server/          # Express API
│   │   └── src/
│   │       ├── routes/       # Auth, metrics, users, reports
│   │       ├── services/     # Business logic + data generation
│   │       ├── db/           # Drizzle schema, migrations, seed
│   │       └── middleware/   # JWT auth, RBAC, validation
│   └── shared/          # Shared TypeScript types
├── docker-compose.yml
└── pnpm-workspace.yaml
```

## API Endpoints

```
POST   /api/auth/login              Public
POST   /api/auth/register           Public
POST   /api/auth/refresh            Public
POST   /api/auth/logout             Auth
POST   /api/auth/change-password    Auth
GET    /api/auth/me                 Auth

GET    /api/metrics/overview        Auth
GET    /api/metrics/revenue         Auth
GET    /api/metrics/plan-distribution Auth
GET    /api/metrics/country-distribution Auth
GET    /api/metrics/transactions    Auth

GET    /api/reports                 Auth
POST   /api/reports                 Auth
DELETE /api/reports/:id             Auth

GET    /api/admin/users             Admin
GET    /api/admin/roles             Admin
PATCH  /api/admin/users/:id/role    Admin
GET    /api/users/roles             Manager+
```

## License

MIT
