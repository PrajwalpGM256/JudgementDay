# JudgmentDay - Fantasy Football Platform

A modern, full-stack fantasy football web application built with Next.js 15, TypeScript, Prisma, and PostgreSQL. Build your fantasy teams, compete with friends in leagues, track real-time scores, and climb the leaderboard!

## 🏈 Overview

JudgmentDay is a comprehensive fantasy football platform where users can:

- Build fantasy teams for NFL matches with a $75 budget
- Compete in private or public leagues
- Track real-time player statistics and scores
- Earn points based on NFL standard fantasy scoring rules
- Participate in prediction games with confidence points
- Win prizes in competitive leagues

## ✨ Features

### Core Features

- **User Authentication & Authorization**

  - Secure registration and login with NextAuth.js
  - Role-based access control (User, Commissioner, Admin)
  - Password hashing with bcryptjs

- **Fantasy Team Building**

  - Build teams for specific NFL matches
  - $75 budget constraint per team
  - Position requirements: 1 QB, 2 RB, 2 WR, 1 TE, 1 K, 1 DEF
  - Maximum 4 players per NFL team
  - Real-time budget tracking and validation

- **League System**

  - Create private or public leagues
  - Join leagues with invite codes
  - Set entry fees and prize pools
  - Customizable prize distribution
  - League-specific leaderboards
  - Commissioner controls

- **Scoring System**

  - NFL Standard Fantasy Scoring:
    - Passing: 25 yards = 1 pt, TD = 4 pts, INT = -2 pts
    - Rushing/Receiving: 10 yards = 1 pt, TD = 6 pts
    - Kicking: FG = 3-5 pts (based on distance)
    - Defense: Sacks = 1 pt, INT = 2 pts, TD = 6 pts
  - Automatic point calculation and updates
  - Real-time leaderboard rankings

- **Match Management**

  - View upcoming NFL matches
  - Match status tracking (Scheduled, Live, Halftime, Final)
  - Real-time score updates
  - Player statistics per match

- **Leaderboards**

  - Global leaderboard
  - League-specific leaderboards
  - User rankings and statistics
  - Points tracking across all teams

- **Admin Panel**

  - User management
  - Match synchronization
  - Statistics dashboard
  - League management
  - Data synchronization tools

- **Credits & Wallet System**
  - Starting credits: 1000
  - Wallet balance: $75 (for team building)
  - Prize distribution in credits
  - Transaction tracking

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **React Hot Toast** - User notifications
- **Lucide React** - Icon library

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js** - Authentication & session management
- **Prisma** - ORM for database operations
- **PostgreSQL** - Relational database

### Development Tools

- **ESLint** - Code linting
- **Turbopack** - Fast bundler
- **Prisma Studio** - Database GUI
- **tsx** - TypeScript execution

## 📋 Prerequisites

- **Node.js** 18+ (or use Miniconda with Node.js 18)
- **PostgreSQL** database (local or cloud)
- **Git** for version control
- **WSL2** (if using Windows)

## 🚀 Quick Start

### Option 1: Standard Setup (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/[USERNAME]/project-fall25-PrajwalpGM256.git
   cd project-fall25-PrajwalpGM256/judgmentday
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the `judgmentday` directory:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/judgmentday"

   # Authentication
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
   NEXTAUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Optional: Sports API Integration
   SPORTSDATA_API_KEY="your-api-key"
   SPORTSDATA_BASE_URL="https://api.sportsdata.io/v3/nfl"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # Seed with demo data (optional)
   npx prisma db seed
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

### Option 2: Miniconda Setup (For Team Members)

If you're using Miniconda as specified by your team:

1. **Install Miniconda** (if not already installed)

   ```bash
   wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
   bash Miniconda3-latest-Linux-x86_64.sh -b
   ~/miniconda3/bin/conda init bash
   source ~/.bashrc
   ```

2. **Create and activate environment**

   ```bash
   conda create -n judgmentday nodejs=18 -y
   conda activate judgmentday
   ```

3. **Get environment files**
   Contact your team lead for `.env` and `.env.local` files and place them in the `judgmentday` directory.

4. **Follow steps 2-6 from Option 1**

## 📁 Project Structure

```
judgmentday/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── admin/          # Admin endpoints
│   │   │   ├── auth/           # Authentication
│   │   │   ├── leagues/        # League management
│   │   │   ├── matches/        # Match data
│   │   │   ├── players/         # Player data
│   │   │   ├── scoring/         # Scoring updates
│   │   │   └── user-teams/      # User team management
│   │   ├── auth/               # Auth pages (login, register)
│   │   ├── dashboard/          # Main app pages
│   │   │   ├── leagues/        # League pages
│   │   │   ├── matches/        # Match listings
│   │   │   ├── team-builder/   # Team building interface
│   │   │   └── team-results/   # Team results
│   │   ├── admin/              # Admin panel
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/             # React components
│   │   ├── layout/            # Layout components (Navbar)
│   │   ├── providers/         # Context providers
│   │   └── ui/                # UI components
│   ├── lib/                    # Utility libraries
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── db/                # Database client
│   │   ├── scoring.ts         # Fantasy scoring logic
│   │   ├── sports-api.ts      # Sports API integration
│   │   └── sportsdata-api.ts  # SportsData.io client
│   └── types/                  # TypeScript types
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data script
├── scripts/                    # Utility scripts
│   ├── populate-teams.ts
│   ├── populate-players.ts
│   ├── populate-matches.ts
│   └── sync-player-stats.ts
├── public/                     # Static assets
├── package.json
├── tsconfig.json
└── next.config.ts
```

## 🗄️ Database Schema

### Key Models

- **User** - User accounts with roles, points, credits, and wallet balance
- **Team** - NFL teams with conference and division info
- **Player** - NFL players with positions, prices, and stats
- **Match** - NFL games with teams, scores, and status
- **UserTeam** - Fantasy teams created by users for matches
- **UserTeamPlayer** - Players selected in fantasy teams
- **PlayerStat** - Player statistics per match
- **League** - Private/public leagues with prize pools
- **LeagueMember** - Users participating in leagues
- **Pick** - User predictions for match outcomes

See `prisma/schema.prisma` for complete schema definition.

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Matches

- `GET /api/matches` - List all matches
- `GET /api/matches/[id]` - Get match details

### Players

- `GET /api/players` - List players
- `GET /api/teams/[id]/players` - Get players for a team

### User Teams

- `GET /api/user-teams` - Get user's teams
- `POST /api/user-teams` - Create a new team
- `GET /api/user-teams/[id]` - Get team details

### Leagues

- `GET /api/leagues` - List user's leagues
- `POST /api/leagues` - Create a league
- `GET /api/leagues/[id]` - Get league details
- `POST /api/leagues/view` - Join league with invite code

### Leaderboard

- `GET /api/leaderboard` - Get global leaderboard

### Admin

- `GET /api/admin/stats` - Get admin statistics
- `POST /api/admin/sync-matches` - Sync matches from API
- `POST /api/scoring/update` - Update scoring for a match

## 🎮 Usage Guide

### For Users

1. **Register/Login**

   - Create an account or login with existing credentials

2. **Build a Team**

   - Navigate to `/dashboard/matches`
   - Select a match and click "Build Team"
   - Select players within your $75 budget
   - Ensure all position requirements are met
   - Save your team

3. **Join a League**

   - Go to `/dashboard/leagues`
   - Create a new league or join with an invite code
   - Set entry fees and prize distribution
   - Compete with other members

4. **View Results**
   - Check `/dashboard/team-results/[id]` for team performance
   - View leaderboard at `/dashboard/leaderboard`
   - Track your points and rankings

### For Admins

1. **Access Admin Panel**

   - Login as admin user
   - Navigate to `/admin`

2. **Sync Matches**

   - Use the sync button to fetch latest matches from API
   - Update match scores and player statistics

3. **Update Scoring**
   - After matches complete, update scoring via admin panel
   - This recalculates all fantasy points and rankings

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:seed      # Seed database with demo data
npm run db:migrate   # Create and run migrations
```

## 🔧 Configuration

### Environment Variables

Required:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Base URL for authentication callbacks
- `NEXT_PUBLIC_APP_URL` - Public app URL

Optional:

- `SPORTSDATA_API_KEY` - API key for SportsData.io integration
- `SPORTSDATA_BASE_URL` - Base URL for SportsData.io API

### Database Setup

**Local PostgreSQL:**

```bash
createdb judgmentday
```

**Cloud (Supabase/Neon):**

1. Create a new project
2. Copy the connection string
3. Add to `.env` as `DATABASE_URL`

## 🧪 Testing

Demo accounts are available after seeding:

- **Regular User**: `john@example.com` / `password123`
- **Admin User**: `admin@example.com` / `password123`

## 🎨 Design & Wireframes

- **Figma Design**: [View Wireframes](https://www.figma.com/design/qwO4AwCitaWPWiEMeJCT2G/JudgementDay?node-id=0-1&t=ubbroK396GKiGLhV-1)