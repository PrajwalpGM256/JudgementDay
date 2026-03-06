# JudgmentDay 🏈

A full-stack fantasy football platform built with Next.js 15. Draft your dream team, compete in leagues, and dominate the leaderboards.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Game Mechanics](#game-mechanics)
- [Scripts](#scripts)
- [Deployment](#deployment)

---

## Overview

JudgmentDay is a salary-cap fantasy football application where users draft NFL players for specific matchups, compete against friends in private or public leagues, and track their performance in real-time. The platform features a robust team builder with budget constraints, live scoring integration, and comprehensive leaderboard systems.

### Core Workflow

1. **Register/Login** → Users create an account with email and receive starting credits (1000) and wallet balance ($75)
2. **Browse Matches** → View upcoming NFL matchups available for fantasy play
3. **Build Team** → Draft 8 players (QB, 2 RB, 2 WR, TE, K, DEF) within the $75 salary cap
4. **Join League** → Enter private leagues via invite code or browse public leagues
5. **Compete** → Points are calculated based on real player performance
6. **Leaderboard** → Rankings update in real-time; top performers win prizes

---

## Features

### User Features
- **Salary Cap Team Builder** — Draft players within a $75 budget with position requirements
- **Multi-Roster Support** — Create different teams for different matches
- **Private & Public Leagues** — Create invite-only leagues or join open competitions
- **Real-time Leaderboards** — Global, per-match, and per-league rankings
- **Wallet & Credits System** — Track virtual currency for league entry fees

### Admin Features
- **Dashboard Analytics** — View total users, matches, players, and active teams
- **League Management** — Create/edit/delete leagues with custom prize distributions
- **Match Sync** — Pull live data from SportsData.io API
- **Player Stats Sync** — Update fantasy points based on real game stats

### Technical Features
- **JWT-based Authentication** — Secure sessions with NextAuth.js
- **Input Validation** — Zod schemas on all API endpoints
- **Optimistic UI Updates** — React state management with hot-toast notifications
- **Responsive Design** — Tailwind CSS with mobile-first approach
- **Type Safety** — Full TypeScript coverage across client and server

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router + Turbopack) | 16.x |
| Runtime | React | 19.x |
| Language | TypeScript | 5.x |
| Database | PostgreSQL | 14+ |
| ORM | Prisma | 6.x |
| Auth | NextAuth.js (Credentials Provider) | 4.x |
| Styling | Tailwind CSS | 4.x |
| Validation | Zod | 4.x |
| HTTP Client | Axios | 1.x |
| Notifications | react-hot-toast | 2.x |
| Icons | Lucide React | 0.5+ |
| External API | SportsData.io NFL API | v3 |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Pages     │  │ Components  │  │    Client Hooks         │ │
│  │  /dashboard │  │  Navbar     │  │    useSession           │ │
│  │  /auth      │  │  Card       │  │    useState/useEffect   │ │
│  │  /admin     │  │  LeagueCard │  │    react-hot-toast      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API ROUTES (Next.js)                         │
│  /api/auth/*        → NextAuth handlers                        │
│  /api/matches/*     → Match CRUD                               │
│  /api/leagues/*     → League CRUD + join/leave                 │
│  /api/user-teams/*  → Fantasy team management                  │
│  /api/leaderboard   → Rankings (global/match/league)           │
│  /api/admin/*       → Stats sync, management                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
│  ┌──────────────────┐    ┌────────────────────────────────┐    │
│  │  Prisma Client   │───▶│       PostgreSQL               │    │
│  │  (Type-safe ORM) │    │  Users, Teams, Players,        │    │
│  └──────────────────┘    │  Matches, Leagues, Stats       │    │
│                          └────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              SportsData.io API (Optional)                │  │
│  │       Live NFL scores, player stats, schedules          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **PostgreSQL** 14+ (local install, Docker, or cloud: Supabase/Neon/Railway)
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone git@github.com:PrajwalpGM256/JudgementDay.git
cd JudgementDay/judgmentday

# Install dependencies
npm install
```

---

## Database Setup

### Option 1: Local PostgreSQL

```bash
# Create database (macOS/Linux with Homebrew)
createdb judgmentday

# Or via psql
psql -c "CREATE DATABASE judgmentday;"
```

### Option 2: Docker

```bash
docker run --name judgmentday-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=judgmentday \
  -p 5432:5432 \
  -d postgres:14
```

### Option 3: Cloud (Supabase/Neon)

Create a new project and copy the connection string from the dashboard.

### Initialize Schema

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates all tables)
npx prisma db push

# Populate base data (teams, players, matches)
npx tsx scripts/populate-teams.ts
npx tsx scripts/populate-players.ts
npx tsx scripts/populate-matches.ts

# Seed demo users and leagues
npx prisma db seed
```

### Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Prisma Studio (GUI browser for data) |
| `npm run db:migrate` | Create and apply migrations |
| `npm run db:seed` | Seed demo users, teams, and leagues |

---

## Environment Variables

Create a `.env` file in the `judgmentday/` directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/judgmentday"

# NextAuth.js
NEXTAUTH_SECRET="your-32-char-secret"  # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# App URL (for CORS, callbacks)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# SportsData.io (optional - for live NFL stats)
SPORTSDATA_API_KEY="your-api-key"
SPORTSDATA_BASE_URL="https://api.sportsdata.io/v3/nfl"
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `NEXTAUTH_URL` | Yes | Base URL for NextAuth callbacks |
| `NEXT_PUBLIC_APP_URL` | Yes | Public-facing app URL |
| `SPORTSDATA_API_KEY` | No | API key for live NFL data |

---

## Project Structure

```
judgmentday/
├── prisma/
│   ├── schema.prisma        # Database schema (models, enums, relations)
│   └── seed.ts              # Demo data seeder
│
├── scripts/
│   ├── populate-teams.ts    # Seed all 32 NFL teams
│   ├── populate-players.ts  # Seed NFL players with pricing
│   ├── populate-matches.ts  # Create match fixtures
│   ├── create-admin.ts      # Create admin user
│   ├── sync-player-stats.ts # Sync stats from external API
│   └── generate-simulated-stats.ts  # Generate mock stats for testing
│
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with providers
│   │   ├── page.tsx         # Landing page
│   │   ├── globals.css      # Tailwind imports + custom styles
│   │   │
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts  # NextAuth handler
│   │   │   ├── auth/register/route.ts       # User registration
│   │   │   ├── matches/route.ts             # GET matches
│   │   │   ├── matches/[id]/route.ts        # GET single match
│   │   │   ├── teams/route.ts               # GET NFL teams
│   │   │   ├── teams/[id]/players/route.ts  # GET players by team
│   │   │   ├── players/route.ts             # GET all players
│   │   │   ├── user-teams/route.ts          # CRUD user fantasy teams
│   │   │   ├── leagues/route.ts             # CRUD leagues, join/leave
│   │   │   ├── leaderboard/route.ts         # Rankings endpoint
│   │   │   └── admin/                       # Admin-only endpoints
│   │   │
│   │   ├── auth/
│   │   │   ├── login/page.tsx               # Login form
│   │   │   └── register/page.tsx            # Registration form
│   │   │
│   │   ├── dashboard/
│   │   │   ├── page.tsx                     # Dashboard home
│   │   │   ├── matches/page.tsx             # Browse matches
│   │   │   ├── team-builder/[matchId]/page.tsx  # Draft players
│   │   │   ├── teams/page.tsx               # View my teams
│   │   │   ├── leagues/page.tsx             # My leagues
│   │   │   ├── leagues/[id]/page.tsx        # League details
│   │   │   ├── leaderboard/page.tsx         # Global rankings
│   │   │   └── team-results/[id]/page.tsx   # Team performance
│   │   │
│   │   └── admin/
│   │       └── page.tsx                     # Admin dashboard
│   │
│   ├── components/
│   │   ├── layout/Navbar.tsx                # Navigation bar
│   │   ├── providers/SessionProvider.tsx    # NextAuth provider
│   │   └── ui/                              # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── index.ts                     # Barrel exports
│   │
│   ├── lib/
│   │   ├── auth.ts                          # NextAuth configuration
│   │   ├── scoring.ts                       # Fantasy points calculator
│   │   ├── smart-simulation.ts              # Mock stats generator
│   │   ├── sportsdata-api.ts                # SportsData.io client
│   │   ├── espn-api.ts                      # ESPN API client
│   │   ├── db/prisma.ts                     # Prisma client singleton
│   │   └── utils/                           # Helper functions
│   │
│   └── types/
│       └── next-auth.d.ts                   # NextAuth type extensions
│
├── public/
│   └── images/teams/                        # Team logos
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── vercel.json                              # Vercel deployment config
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/auth/[...nextauth]` | NextAuth sign-in/sign-out |

### Matches

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches` | List all matches (with filters) |
| GET | `/api/matches/:id` | Get single match details |

### Teams & Players

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams` | List all NFL teams |
| GET | `/api/teams/:id/players` | Get players for a team |
| GET | `/api/players` | List all players |

### User Teams (Fantasy Rosters)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user-teams` | Get user's fantasy teams |
| POST | `/api/user-teams` | Create new fantasy team |
| GET | `/api/user-teams/:id` | Get specific team |
| DELETE | `/api/user-teams/:id` | Delete team |

### Leagues

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leagues` | Get user's leagues |
| GET | `/api/leagues?type=public` | Get public leagues |
| POST | `/api/leagues` | Create new league |
| POST | `/api/leagues` | Join league (with invite code) |
| GET | `/api/leagues/:id` | Get league details |
| PUT | `/api/leagues/:id` | Update league (commissioner) |
| DELETE | `/api/leagues/:id` | Delete league (commissioner) |

### Leaderboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Global leaderboard |
| GET | `/api/leaderboard?matchId=X` | Match-specific rankings |
| GET | `/api/leaderboard?leagueId=X` | League rankings |

---

## Game Mechanics

### Team Building Rules

| Rule | Value |
|------|-------|
| Salary Cap | **$75** |
| Roster Size | **8 players** |
| Max per NFL Team | **4 players** |

**Position Requirements:**

| Position | Slots | Description |
|----------|-------|-------------|
| QB | 1 | Quarterback |
| RB | 2 | Running Back |
| WR | 2 | Wide Receiver |
| TE | 1 | Tight End |
| K | 1 | Kicker |
| DEF | 1 | Team Defense |

### Fantasy Scoring System

**Passing:**
| Stat | Points |
|------|--------|
| 25 passing yards | +1 pt |
| Passing TD | +4 pts |
| Interception thrown | -2 pts |

**Rushing:**
| Stat | Points |
|------|--------|
| 10 rushing yards | +1 pt |
| Rushing TD | +6 pts |

**Receiving:**
| Stat | Points |
|------|--------|
| 10 receiving yards | +1 pt |
| Receiving TD | +6 pts |
| Reception | 0 pts (standard, not PPR) |

**Kicking:**
| Stat | Points |
|------|--------|
| FG (0-39 yards) | +3 pts |
| FG (40-49 yards) | +4 pts |
| FG (50+ yards) | +5 pts |
| PAT | +1 pt |

**Defense:**
| Stat | Points |
|------|--------|
| Sack | +1 pt |
| Interception | +2 pts |
| Defensive TD | +6 pts |

**Fumbles:**
| Stat | Points |
|------|--------|
| Fumble lost | -2 pts |

---

## Scripts

Utility scripts for populating and managing data:

```bash
# Populate NFL teams (all 32)
npx tsx scripts/populate-teams.ts

# Populate players with positions and pricing
npx tsx scripts/populate-players.ts

# Create match schedule
npx tsx scripts/populate-matches.ts

# Create admin user
npx tsx scripts/create-admin.ts

# Generate simulated stats for testing
npx tsx scripts/generate-simulated-stats.ts

# Sync player stats from SportsData.io
npx tsx scripts/sync-player-stats.ts

# Verify database integrity
npx tsx scripts/verify-database.ts
```

---

## Running the Application

### Development

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000) with hot reload (Turbopack).

### Production Build

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

---

## Deployment

### Vercel (Recommended)

1. Connect repo to Vercel
2. Set environment variables in dashboard
3. Deploy — Vercel handles build/runtime automatically

The `vercel.json` file is already configured.

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Demo Accounts

After running `npx prisma db seed`:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password123 | Admin |
| john@example.com | password123 | User |
| jane@example.com | password123 | User |
| mike@example.com | password123 | User |
| sarah@example.com | password123 | User |

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Reset database (caution: deletes all data)
npx prisma db push --force-reset
```

### Prisma Client Not Generated

```bash
npx prisma generate
```

### Port Already in Use

```bash
# Find process on port 3000
netstat -ano | findstr :3000
# Kill it
taskkill /PID <pid> /F
```

### SportsData.io Not Working

- Verify `SPORTSDATA_API_KEY` is set
- Check API key permissions (NFL scope)
- Test: `npx tsx scripts/test-sportsdata.ts`

---

## License

MIT

---

## Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m "Add amazing feature"`)
4. Push branch (`git push origin feature/amazing`)
5. Open Pull Request

---

Built with ☕ and Tailwind CSS

Create private leagues with invite codes, set entry fees, customize prize distribution. Each league ties to a specific match.

## API Reference

Main endpoints:

```
POST   /api/auth/register     # signup
GET    /api/matches           # list games
GET    /api/matches/:id       # game details
GET    /api/players           # player list (filterable)
GET    /api/user-teams        # your teams
POST   /api/user-teams        # create team
GET    /api/leagues           # your leagues
POST   /api/leagues           # create league
GET    /api/leaderboard       # rankings
```

Admin endpoints require admin role.

## Scripts

```bash
npm run dev           # dev server (turbopack)
npm run build         # production build
npm run lint          # eslint

npm run db:push       # sync schema to db
npm run db:studio     # prisma GUI
npm run db:seed       # load demo data
```

## Demo Accounts

After running seed:

| Email | Password | Role |
|-------|----------|------|
| john@example.com | password123 | user |
| admin@example.com | password123 | admin |

## Links

- [Live Demo](https://judgmentday.vercel.app/)
- [Figma Designs](https://www.figma.com/design/qwO4AwCitaWPWiEMeJCT2G/JudgementDay?node-id=0-1)
