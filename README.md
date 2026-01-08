# JudgmentDay

Fantasy football platform where you build teams, join leagues, and compete for bragging rights.

## What is this?

JudgmentDay lets you draft fantasy teams for NFL games with a salary cap, compete against friends in private leagues, and track how your picks perform in real-time. Standard fantasy scoring, leaderboards, the whole deal.

## Tech

- **Next.js 15** (App Router) + TypeScript
- **Prisma** + PostgreSQL
- **NextAuth.js** for auth
- **Tailwind CSS** for styling
- **SportsData.io** for live NFL stats (optional)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local or hosted - Supabase/Neon work great)

### Setup

```bash
# Clone and install
git clone https://github.com/neu-cs4530/project-fall25-PrajwalpGM256.git
cd project-fall25-PrajwalpGM256/judgmentday
npm install
```

Create `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/judgmentday"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional - for live NFL data
SPORTSDATA_API_KEY="your-key"
```

```bash
# Setup database
npx prisma generate
npx prisma db push
npx prisma db seed   # loads demo data

# Run it
npm run dev
```

Open [localhost:3000](http://localhost:3000).

### Miniconda Users

If your team uses conda:

```bash
conda create -n judgmentday nodejs=18 -y
conda activate judgmentday
# then follow the steps above
```

## Project Layout

```
src/
├── app/
│   ├── api/              # REST endpoints
│   ├── auth/             # login/register pages
│   ├── dashboard/        # main app (matches, teams, leagues, leaderboard)
│   └── admin/            # admin panel
├── components/           # React components
├── lib/                  # auth config, db client, scoring logic, API clients
└── types/                # TypeScript definitions

prisma/
├── schema.prisma         # data models
└── seed.ts               # demo data

scripts/                  # utility scripts for populating data
```

## Database Models

The main entities:

| Model | Purpose |
|-------|---------|
| User | Accounts, roles (user/commissioner/admin), credits, wallet |
| Team | NFL teams (all 32) |
| Player | NFL players with position, price, avg fantasy points |
| Match | Games with status, scores, scheduling |
| UserTeam | Your fantasy roster for a specific match |
| League | Private/public leagues with entry fees and prizes |
| PlayerStat | Per-game stats for scoring |

Full schema in `prisma/schema.prisma`.

## How It Works

### Building a Team

- Pick a match, draft players within **$75 budget**
- Roster: 1 QB, 2 RB, 2 WR, 1 TE, 1 K, 1 DEF
- Max 4 players from any single NFL team

### Scoring

Standard fantasy rules:
- Passing: 1pt per 25 yds, 4pts/TD, -2pts/INT
- Rushing/Receiving: 1pt per 10 yds, 6pts/TD
- Kicking: 3-5pts per FG (distance-based)
- Defense: 1pt/sack, 2pts/INT, 6pts/TD

### Leagues

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
- [Figma Designs](https://www.figma.com/design/qwO4AwCitaWPWiEMeJCT2G/JudgementDay?node-id=0-1&t=ubbroK396GKiGLhV-1)

---

Built for INFO 6150 Web Design & User Experience Engineering @ Northeastern
