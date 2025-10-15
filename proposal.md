# JudgmentDay - Development Plan

## Team

• **Team lead**: Prajwal Gangadhar Melinamane
• **Team members**: Tharanitharan Muthuthirumaran, Reemaa Sajad Hyder
• **GitHub links**: [Tharanitharan Muthuthirumaran](https://github.com/Tharanitharan-M), [Reemaa Sajad Hyder](https://github.com/ReemaaSajad), [Prajwal Gangadhar Melinamane](https://github.com/PrajwalpGM256)

## Project goal

The goal is to build a web app called JudgmentDay, a sports prediction site.
Users can join leagues with friends, make weekly game picks, and earn points when their teams win.
It works like a small fantasy pick'em game. Each week users see real match data, make picks before the game starts, and see who is leading on the leaderboard.

So I am building an interactive sports site that connects to a real sports API, shows data, and lets people compete with each other.

## User stories

### As a new user
• I can sign up with email and log in.
• I can see a public landing page that explains how the website works.

### As a returning user
• I can create a league or join one using an invite code.
• I can see the list of games for the week.
• I can submit my picks and assign confidence points one to sixteen without repeats.
• I can edit my picks until the lock time.
• I can see my points after games finish and a small chart of my weekly progress.
• I can see league standings and my rank.

### As a league commissioner
• I can manage members of my league.
• I can set lock times and week settings.
• I can remove users who break rules.

### As an admin
• I can upsert/delete users and leagues
• I can seed data

## UI design

The app will have a simple clean design using Tailwind CSS and Next.js.
I will design the mockups in Figma first.
Main pages:

**Landing page**: shows app name and sign in button.
**Dashboard**: after login, shows leagues, picks, and standings.
**Pick page**: list of games with checkboxes or buttons to select winners.
**Standings page**: table with player names and points.
**Profile page**: shows user info and accuracy stats.

The style will be similar to a fantasy sports dashboard with a dark theme and responsive layout.

## Project requirements

### Back end

• We will make a Next.js app with API routes or a small Node Express server.
• Database is PostgreSQL using Prisma.
• Models: User, League, LeagueMember, Game, Pick, Week, Standing, Session, AuditLog.
• Cron or background job runs scoring after games finish.
• Role based access check for user, commissioner, admin.
• Input validation on all API routes.
• Basic rate limit on auth and pick routes.

### Web API

• We will read real game schedule and scores from a sports API like The Odds API or SportdataAPI.
• We will cache responses in the database to avoid hitting rate limits.
• A sync job saves teams, games, kickoff time, and final score.
• If the external API is down, we fall back to last saved data and show a small banner.

### Data

• **User data**: name, email, avatar, role.
• **League data**: name, code, owner, members.
• **Game data**: week, home team, away team, kickoff, status, final score.
• **Pick data**: user, league, game, selected team, confidence value, timestamp.
• **Scoring rules**: if pick correct, add the confidence value, otherwise zero.
• We will seed sample data so the site works in demo mode.

### User and admin views

• **User views**: landing, my leagues, week picks, my stats, standings.
• **Commissioner views**: manage members, invite code, league settings, lock times.
• **Admin views**: users list, leagues list, rerun scoring for a week.

## Answering the course questions

### Answering Key Questions

**Is this a full-stack app?**
Yes. It has frontend, backend, database, and API integration.

**How will it use data?**
It will store user picks, games, and scores in PostgreSQL and fetch real sports data from an API.

**Will it have authentication?**
Yes, using NextAuth.js for sign up, login, and sessions.

**Will it have a REST API?**
Yes, API routes under /api/* for CRUD operations on users, leagues, and picks.

**Will it consume external data?**
Yes, from a sports API that provides live scores and team info.

**Technologies used and why:**
• Next.js for frontend and server routes
• Prisma for database ORM
• PostgreSQL for relational data
• Tailwind CSS for styling
• NextAuth.js for authentication
• Sports API for live data
• Vercel or Render for deployment