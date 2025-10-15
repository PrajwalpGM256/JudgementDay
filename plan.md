# JudgmentDay – Plan

## Team

- **Team Lead**: Prajwal
- **Team Members**: Prajwal, Tharanitharan, Reemaa

## Project Goal

We are building a competitive sports prediction platform that combines weekly pick'em contests with real-time game-day social features. Unlike traditional blogging functionality, JudgmentDay focuses on interactive data visualization through live standings, real-time scoring updates, and dynamic game threads where users' predictions are publicly displayed. The platform gamifies sports predictions by introducing confidence points (1-16) and creates accountability by showing everyone's picks during live game discussions. This is not e-commerce or purely gaming - it's a data-driven social platform that processes real-time sports information and user interactions to create an engaging competitive experience.

## Goals

### v0.1 – Static UI and Wireframes

**Goal**: Make the base version of the app with working pages and basic design. This version will not have backend yet. It will just show the flow of the app.

**Tasks for v0.1**
- Design wireframes for all main pages using Figma.
- Create static pages with Next.js and Tailwind CSS.
- Make navigation between pages work.
- Add sample data for games, picks, and standings just for testing.

This version helps us finalize layout, routes, and color theme.

### v0.2 – Functional Prototype

**Goal**: Connect frontend with backend and make picks and leagues work.

**Tasks for v0.2**
- Setup PostgreSQL and Prisma schema.
- Add authentication using NextAuth.js.
- Create API endpoints for users, leagues, and picks.
- Allow users to register, login, create or join leagues.
- Enable pick submission and store them in the database.

This version will be our semi-working prototype where users can log in and use the basic system.

### v0.3 – Real-Time and Scoring

**Goal**: Add real-time features and external sports API integration.

**Tasks for v0.3**
- Connect to sports API (like The Odds API or SportdataAPI).
- Sync real scores and update standings automatically.
- Add scoring logic and leaderboard.
- Build live updates using WebSockets.
- Polish UI, test everything, and deploy.

This version will be our final working version with full data flow, scoring, and real matches.

## Key Tasks / Roles and Responsibilities

### v0.1
- Create Figma mockups and basic page layout – Reemaa
- Make wireframes and static pages with Tailwind CSS – Tharanitharan
- Setup Next.js project, routing, and navigation – Prajwal

### v0.2
- Setup database schema with Prisma and Postgres – Prajwal
- Create backend API routes and auth flow – Prajwal
- Connect UI forms to backend routes and test flow – Tharanitharan
- Work on form validation and display league/picks data – Reemaa

### v0.3
- Integrate external Sports API and build data sync logic – Prajwal
- Add scoring system, leaderboard, and live updates – Tharanitharan
- Work on UI polish, deployment, and documentation – Reemaa

## Testing and Version Control

- Each version (v0.1, v0.2, v0.3) will be tagged in GitHub.
- Each member will create small commits for their part under their own branch.
- Prajwal will handle main merges and pull requests.
- After each version is done, we will run manual testing for login, picks, and scoring flow.

## User Stories

### As a Sports Fan ( User)
- I want to create an account so that I can join prediction leagues with my friends
- I want to join multiple leagues using invite codes so I can compete with different groups
- I want to submit my weekly picks with confidence points so I can strategically maximize my scoring potential
- I want to edit my picks before game time so I can adjust based on new information
- I want to participate in live game threads so I can discuss games while my predictions are at stake
- I want to view real-time standings so I can track my performance as games progress
- I want to see my prediction history and statistics so I can improve my picking strategy

### As a League Commissioner
- I want to create private leagues so I can manage competitions for my specific group
- I want to customize league settings so I can tailor the experience to my group's preferences
- I want to view league analytics so I can see participation and engagement metrics
- I want to manage league members so I can remove inactive users if needed
- I want to export league data so I can share season results with members

### As a Site Administrator
- I want to moderate game threads so I can maintain a positive community environment
- I want to view platform metrics so I can monitor system health and user engagement
- I want to manage reported content so I can quickly address user concerns
- I want to sync game data from external sources so users have accurate, current information
- I want to manually adjust scores/games if external API issues occur

## Technology Stack

- **Frontend**: Next.js 14 with React
- **Backend**: Node.js (via Next.js API Routes)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Real-time**: Socket.io
- **External APIs**: The Odds API for sports data
- **Styling**: Tailwind CSS
- **Deployment**: Vercel or local dev server
- **Version Control**: Git with GitHub

## Why This Approach

This project demonstrates mastery of full-stack web development by combining multiple complex systems: real-time communications, external API integration, sophisticated database relationships, and role-based access control. The confidence point system and live game threads showcase algorithm implementation and state management skills that go well beyond basic CRUD operations.