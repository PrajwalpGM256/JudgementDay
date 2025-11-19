# JudgmentDay - Fantasy Football Platform

## Project Presentation Document

---

## 📖 What is JudgmentDay?

**JudgmentDay** is a fantasy football web application where users build fantasy teams using real NFL players and compete against each other. Think of it like a game where you're a team manager - you pick players from different NFL teams, and you earn points based on how well those players perform in real games.

### The Basic Concept

- **Real NFL Games**: The platform uses real NFL match schedules and game results
- **Fantasy Teams**: Users create their own teams by selecting real NFL players
- **Points System**: Your players' real-game performance earns you fantasy points
- **Competition**: Compete with friends in leagues and see who has the best team

---

## 🔐 How the Login System Works

### Registration (Sign Up)

1. **Go to the Register Page**: New users visit the registration page
2. **Provide Information**:
   - **Username**: A unique name (3-20 characters)
   - **Email**: Your email address (must be unique)
   - **Password**: At least 6 characters long
3. **Account Creation**:
   - The system checks if the email or username is already taken
   - Your password is securely encrypted (hashed) before storing
   - You automatically receive **75 credits** to start building teams
   - Your account is created with the role "USER" by default

### Login (Sign In)

1. **Enter Credentials**: Provide your email and password
2. **Authentication**:
   - The system finds your account by email
   - Compares your entered password with the stored encrypted password
   - If they match, you're logged in
3. **Session Management**:
   - Once logged in, you get a secure session token
   - This token keeps you logged in as you navigate the site
   - The session expires when you log out or after a period of inactivity

### Security Features

- **Password Encryption**: Passwords are never stored in plain text - they're hashed using bcrypt
- **Session Tokens**: Uses JWT (JSON Web Tokens) for secure session management
- **Protected Routes**: You must be logged in to access the dashboard and team-building features

### User Roles

- **USER**: Regular users who can build teams and join leagues
- **COMMISSIONER**: League owners who can manage their leagues
- **ADMIN**: Platform administrators with full access

---

## 🏈 How Team Selection Works

### Step 1: Browse Matches

- Go to the **Matches** page to see upcoming NFL games
- Each match shows:
  - Two teams playing (home team vs away team)
  - Game date and time
  - Game status (Scheduled, Live, or Final)
  - Week number and season

### Step 2: Choose a Match

- Click **"Build Team"** on any scheduled match
- You can only build teams for games that haven't started yet

### Step 3: Build Your Fantasy Team

You need to select exactly **8 players** with specific positions:

| Position               | Required | What They Do                                      |
| ---------------------- | -------- | ------------------------------------------------- |
| **QB** (Quarterback)   | 1        | Throws the ball, scores passing touchdowns        |
| **RB** (Running Back)  | 2        | Runs with the ball, scores rushing touchdowns     |
| **WR** (Wide Receiver) | 2        | Catches passes, scores receiving touchdowns       |
| **TE** (Tight End)     | 1        | Catches passes, blocks                            |
| **K** (Kicker)         | 1        | Kicks field goals and extra points                |
| **DEF** (Defense)      | 1        | Team defense that gets sacks, interceptions, etc. |

### Step 4: Budget Management

- **Budget**: You have **75 credits** to spend per team
- **Player Prices**: Each player has a price (based on their skill/performance)
- **Budget Constraint**: Your team's total cost must be 75 credits or less
- The system shows you:
  - How much you've spent
  - How much you have left
  - Warnings if you exceed the budget

### Step 5: Team Rules

There are important rules you must follow:

1. **Position Requirements**: You must have exactly the right number of each position
2. **Budget Limit**: Total cost cannot exceed 75 credits
3. **Team Diversity**: You can't have more than **4 players from the same NFL team**
   - Example: If you pick 4 Kansas City Chiefs players, you can't pick a 5th one
   - This makes team-building more strategic and interesting

### Step 6: Select Players

- **Browse Available Players**: See all players available for the match
- **Filter by Position**: Click on a position to see only those players
- **See Player Info**: Each player shows:
  - Name and team
  - Position
  - Price (in credits)
  - Average points (how well they usually perform)
- **Add to Team**: Click to add a player to your team
- **Remove Players**: Click the X button to remove a player

### Step 7: Submit Your Team

- Once you've filled all positions and stayed within budget:
  - Give your team a name (optional)
  - Click **"Create Team"**
  - The system validates your team (checks all rules)
  - If valid, your team is saved and locked in for that match

### Important Notes

- **One Team Per Match**: You can only create one team per NFL game
- **Lock Time**: Once a game starts, you can't change your team
- **Team Name**: You can name your team (e.g., "Week 5 Champions")

---

## 📊 How Points Work

### How Points Are Earned

Your fantasy team earns points based on how your selected players perform in the real NFL game. Points are calculated automatically after the game ends.

### Scoring Rules

#### **Passing (Quarterbacks)**

- **25 passing yards** = 1 point
- **Passing touchdown** = 4 points
- **Interception** = -2 points (loses points!)

#### **Rushing (Running Backs)**

- **10 rushing yards** = 1 point
- **Rushing touchdown** = 6 points
- **Fumble lost** = -2 points

#### **Receiving (Wide Receivers & Tight Ends)**

- **10 receiving yards** = 1 point
- **Receiving touchdown** = 6 points
- **Fumble lost** = -2 points

#### **Kicking (Kickers)**

- **Field goal (0-39 yards)** = 3 points
- **Field goal (40-49 yards)** = 4 points
- **Field goal (50+ yards)** = 5 points
- **Extra point** = 1 point

#### **Defense**

- **Sack** = 1 point
- **Interception** = 2 points
- **Defensive touchdown** = 6 points

### Example Point Calculation

Let's say you picked:

- **QB**: Threw for 250 yards, 2 touchdowns, 1 interception

  - Points: (250 ÷ 25) + (2 × 4) - (1 × 2) = 10 + 8 - 2 = **16 points**

- **RB**: Ran for 80 yards, 1 touchdown

  - Points: (80 ÷ 10) + (1 × 6) = 8 + 6 = **14 points**

- **WR**: Caught passes for 100 yards, 1 touchdown

  - Points: (100 ÷ 10) + (1 × 6) = 10 + 6 = **16 points**

- **K**: Made 2 field goals (one 35-yard, one 45-yard)

  - Points: 3 + 4 = **7 points**

- **DEF**: Got 3 sacks, 1 interception
  - Points: (3 × 1) + (1 × 2) = 3 + 2 = **5 points**

**Total Team Points**: 16 + 14 + 16 + 7 + 5 = **58 points**

### When Points Are Calculated

1. **During the Game**: Real-time stats are collected (if API is connected)
2. **After the Game**: Once the game status is "FINAL", the system:
   - Calculates fantasy points for each player's performance
   - Adds up all your players' points to get your team total
   - Updates your overall score
   - Updates the leaderboard rankings

### Your Total Score

- **Team Points**: Points earned by a single team for one match
- **Total Points**: Sum of all points from all your teams across all matches
- **Rank**: Your position on the global leaderboard based on total points

---

## 🏆 Leagues and Competition

### What Are Leagues?

Leagues are private groups where you compete with friends or other users. Think of them as mini-competitions within the platform.

### Joining a League

1. **Get an Invite Code**: Someone who created a league shares an invite code
2. **Enter the Code**: Go to the Leagues page and enter the code
3. **You're In!**: You're now a member and can see league standings

### Creating a League

1. **Go to Leagues Page**: Click "Create League"
2. **Set Details**:
   - League name
   - Description (optional)
   - Maximum members (default: 20)
3. **Get Invite Code**: The system generates a unique code
4. **Share the Code**: Give it to friends to join

### League Standings

- Shows all members ranked by their total points
- Updates automatically as games finish
- See who's winning and how you compare

---

## 📈 Leaderboard

### Global Leaderboard

- Shows all users ranked by total points
- Updates automatically
- See the top players across the entire platform

### Your Ranking

- Your position on the leaderboard
- Your total points
- How many teams you've created
- Your win/loss record (if implemented)

---

## 🎮 User Dashboard

When you log in, you see your **Dashboard** with:

### Statistics Cards

- **Total Points**: Sum of all points from all your teams
- **Teams Created**: How many fantasy teams you've built
- **Leagues Joined**: How many leagues you're in
- **Wallet Balance**: How many credits you have (starts at 75)

### Quick Sections

- **My Leagues**: List of leagues you've joined
- **My Teams**: Your recent teams with their points
- **Quick Actions**: Links to browse matches, view leaderboard, join leagues

### Navigation

- **Dashboard**: Your home page
- **Matches**: Browse and select games
- **Leagues**: Join or create leagues
- **Leaderboard**: See rankings
- **Team Builder**: Build teams for specific matches

---

## 🔄 How Everything Works Together

### The Complete Flow

1. **Sign Up / Log In**

   - Create account or log in with existing credentials
   - Get 75 credits to start

2. **Browse Matches**

   - See upcoming NFL games
   - Choose a game you want to build a team for

3. **Build Your Team**

   - Select 8 players (1 QB, 2 RB, 2 WR, 1 TE, 1 K, 1 DEF)
   - Stay within 75 credit budget
   - Follow team diversity rules (max 4 from same NFL team)
   - Submit your team

4. **Wait for the Game**

   - The real NFL game happens
   - Your players' real performance is tracked

5. **Points Are Calculated**

   - After the game ends, the system calculates points
   - Your team's total points are updated
   - Your overall score increases

6. **Check Results**

   - See your team's points on the dashboard
   - Check the leaderboard to see your ranking
   - Compare with friends in leagues

7. **Repeat**
   - Build teams for more matches
   - Compete throughout the season
   - Try to climb the leaderboard!

---

## 💡 Key Features Summary

✅ **Secure Authentication**: Safe login and registration system  
✅ **Team Building**: Create fantasy teams with real NFL players  
✅ **Budget System**: Manage credits to build balanced teams  
✅ **Automatic Scoring**: Points calculated from real game stats  
✅ **Leagues**: Compete with friends in private groups  
✅ **Leaderboard**: See rankings and compete globally  
✅ **Real-Time Updates**: See game status and live scores  
✅ **User-Friendly**: Clean, modern interface that's easy to use

---

## 🎯 For New Users - Quick Start Guide

1. **Register**: Create an account with email, username, and password
2. **Explore**: Check out the dashboard to see what's available
3. **Browse Matches**: Go to Matches page and see upcoming games
4. **Build Your First Team**:
   - Click "Build Team" on a scheduled match
   - Select players for each position
   - Stay within budget
   - Submit your team
5. **Join a League**: Get an invite code from a friend or create your own
6. **Check Back**: After games finish, see your points and ranking!

---

## 📝 Technical Details (Simplified)

- **Frontend**: Next.js 15 with React and TypeScript
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with secure password hashing
- **Styling**: Tailwind CSS for modern, responsive design
- **Sports Data**: Can integrate with sports APIs for real-time stats

---

## ❓ Common Questions

**Q: Can I change my team after submitting it?**  
A: Only if the game hasn't started yet. Once a game begins, your team is locked.

**Q: How do I get more credits?**  
A: Currently, you start with 75 credits per team. This is a design choice to make team-building strategic.

**Q: What happens if a player I picked doesn't play?**  
A: They earn 0 points. That's why it's important to pick active, healthy players!

**Q: Can I see other people's teams?**  
A: You can see league standings and leaderboard rankings, but individual team compositions are private.

**Q: How often are points updated?**  
A: Points are calculated automatically after games finish. The system updates leaderboards in real-time.

---

## 🎉 Conclusion

JudgmentDay is a fun, competitive fantasy football platform where you can:

- Build strategic fantasy teams
- Compete with friends
- Track real NFL player performance
- Climb the leaderboard
- Enjoy the excitement of fantasy sports!

The system is designed to be simple to use but strategic to master. Good luck building your winning teams!

---

_Last Updated: 2025_
