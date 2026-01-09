import { PrismaClient, Position, MatchStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed script to populate user-generated data
 * 
 * External API data (Teams, Players, Matches, PlayerStats) should be 
 * populated via admin sync or scripts - NOT here.
 * 
 * This seeds:
 * - Demo users with realistic stats
 * - UserTeams (fantasy rosters)
 * - Leagues and LeagueMembers
 */

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Check if teams exist (should be populated via API/scripts)
  const teamCount = await prisma.team.count();
  if (teamCount === 0) {
    console.log('⚠️  No teams found! Run these first:');
    console.log('   npx tsx scripts/populate-teams.ts');
    console.log('   npx tsx scripts/populate-players.ts');
    console.log('   npx tsx scripts/populate-matches.ts');
    console.log('');
    console.log('Then run this seed again.');
    return;
  }

  const playerCount = await prisma.player.count();
  if (playerCount === 0) {
    console.log('⚠️  No players found! Run: npx tsx scripts/populate-players.ts');
    return;
  }

  const matchCount = await prisma.match.count();
  if (matchCount === 0) {
    console.log('⚠️  No matches found! Run: npx tsx scripts/populate-matches.ts');
    return;
  }

  console.log(`Found ${teamCount} teams, ${playerCount} players, ${matchCount} matches\n`);

  // Clear user-generated data only
  console.log('🧹 Clearing existing user data...');
  await prisma.leagueMember.deleteMany();
  await prisma.league.deleteMany();
  await prisma.userTeamPlayer.deleteMany();
  await prisma.userTeam.deleteMany();
  await prisma.pick.deleteMany();
  await prisma.playerStat.deleteMany(); // Clear old stats
  await prisma.user.deleteMany();

  // Create demo users
  console.log('👤 Creating demo users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const john = await prisma.user.create({
    data: {
      email: 'john@example.com',
      username: 'JohnDoe',
      password: hashedPassword,
      role: 'USER',
      walletBalance: 75,
      credits: 850,
      totalPoints: 342,
      rank: 1,
    },
  });

  const jane = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      username: 'JaneSmith',
      password: hashedPassword,
      role: 'USER',
      walletBalance: 75,
      credits: 920,
      totalPoints: 287,
      rank: 2,
    },
  });

  const mike = await prisma.user.create({
    data: {
      email: 'mike@example.com',
      username: 'MikeJohnson',
      password: hashedPassword,
      role: 'USER',
      walletBalance: 75,
      credits: 780,
      totalPoints: 265,
      rank: 3,
    },
  });

  const sarah = await prisma.user.create({
    data: {
      email: 'sarah@example.com',
      username: 'SarahWilliams',
      password: hashedPassword,
      role: 'USER',
      walletBalance: 75,
      credits: 1100,
      totalPoints: 198,
      rank: 4,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      walletBalance: 75,
      credits: 5000,
      totalPoints: 0,
    },
  });

  // Additional users for a richer leaderboard
  const alex = await prisma.user.create({
    data: {
      email: 'alex@example.com',
      username: 'AlexTD',
      password: hashedPassword,
      role: 'USER',
      walletBalance: 75,
      credits: 650,
      totalPoints: 178,
      rank: 5,
    },
  });

  const chris = await prisma.user.create({
    data: {
      email: 'chris@example.com',
      username: 'ChrisPicks',
      password: hashedPassword,
      role: 'USER',
      walletBalance: 75,
      credits: 890,
      totalPoints: 156,
      rank: 6,
    },
  });

  const emma = await prisma.user.create({
    data: {
      email: 'emma@example.com',
      username: 'EmmaWins',
      password: hashedPassword,
      role: 'USER',
      walletBalance: 75,
      credits: 720,
      totalPoints: 142,
      rank: 7,
    },
  });

  const david = await prisma.user.create({
    data: {
      email: 'david@example.com',
      username: 'DavidRush',
      password: hashedPassword,
      role: 'USER',
      walletBalance: 75,
      credits: 550,
      totalPoints: 128,
      rank: 8,
    },
  });

  const users = [john, jane, mike, sarah];
  const allUsers = [john, jane, mike, sarah, alex, chris, emma, david];
  console.log(`✅ Created ${allUsers.length + 1} users (including admin)\n`);

  // Get more matches to create teams for (enough for John's full demo experience)
  const matches = await prisma.match.findMany({
    take: 8,
    orderBy: { scheduledAt: 'asc' },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  });

  if (matches.length === 0) {
    console.log('⚠️  No matches available for creating teams');
    return;
  }

  console.log('🏈 Creating fantasy teams...');

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================
  
  // Helper to get players for a match (from both teams)
  async function getPlayersForMatch(match: typeof matches[0]) {
    return prisma.player.findMany({
      where: {
        teamId: { in: [match.homeTeamId, match.awayTeamId] },
        status: 'ACTIVE',
      },
      orderBy: { avgPoints: 'desc' },
    });
  }

  async function buildTeam(players: any[], budget: number = 75) {
    const roster: { playerId: string; position: Position }[] = [];
    let totalCost = 0;

    const needed = { QB: 1, RB: 2, WR: 2, TE: 1, K: 1, DEF: 1 };

    for (const [pos, count] of Object.entries(needed)) {
      const available = players.filter(
        p => p.position === pos && !roster.find(r => r.playerId === p.id)
      );
      
      // Shuffle for variety
      available.sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < count && i < available.length; i++) {
        const player = available[i];
        if (totalCost + player.price <= budget) {
          roster.push({ playerId: player.id, position: player.position });
          totalCost += player.price;
        }
      }
    }

    return { roster, totalCost };
  }

  // Helper to generate realistic player stats based on position
  function generatePlayerStats(position: Position) {
    const stats = {
      passingYards: 0,
      passingTDs: 0,
      interceptions: 0,
      rushingYards: 0,
      rushingTDs: 0,
      receptions: 0,
      receivingYards: 0,
      receivingTDs: 0,
      fumbles: 0,
      fgMade: 0,
      fgAttempted: 0,
      defSacks: 0,
      defInterceptions: 0,
      defTDs: 0,
      fantasyPoints: 0,
    };

    switch (position) {
      case 'QB':
        stats.passingYards = Math.floor(Math.random() * 200) + 150; // 150-350
        stats.passingTDs = Math.floor(Math.random() * 4); // 0-3
        stats.interceptions = Math.floor(Math.random() * 2); // 0-1
        stats.rushingYards = Math.floor(Math.random() * 30); // 0-30
        stats.rushingTDs = Math.random() > 0.85 ? 1 : 0;
        stats.fantasyPoints = (stats.passingYards * 0.04) + (stats.passingTDs * 4) - (stats.interceptions * 2) + (stats.rushingYards * 0.1) + (stats.rushingTDs * 6);
        break;
      case 'RB':
        stats.rushingYards = Math.floor(Math.random() * 100) + 20; // 20-120
        stats.rushingTDs = Math.floor(Math.random() * 2); // 0-1
        stats.receptions = Math.floor(Math.random() * 5); // 0-4
        stats.receivingYards = Math.floor(Math.random() * 40); // 0-40
        stats.receivingTDs = Math.random() > 0.9 ? 1 : 0;
        stats.fumbles = Math.random() > 0.9 ? 1 : 0;
        stats.fantasyPoints = (stats.rushingYards * 0.1) + (stats.rushingTDs * 6) + (stats.receptions * 0.5) + (stats.receivingYards * 0.1) + (stats.receivingTDs * 6) - (stats.fumbles * 2);
        break;
      case 'WR':
        stats.receptions = Math.floor(Math.random() * 8) + 2; // 2-10
        stats.receivingYards = Math.floor(Math.random() * 100) + 20; // 20-120
        stats.receivingTDs = Math.floor(Math.random() * 2); // 0-1
        stats.rushingYards = Math.floor(Math.random() * 10); // 0-10
        stats.fantasyPoints = (stats.receptions * 0.5) + (stats.receivingYards * 0.1) + (stats.receivingTDs * 6) + (stats.rushingYards * 0.1);
        break;
      case 'TE':
        stats.receptions = Math.floor(Math.random() * 6) + 1; // 1-7
        stats.receivingYards = Math.floor(Math.random() * 60) + 10; // 10-70
        stats.receivingTDs = Math.random() > 0.7 ? 1 : 0;
        stats.fantasyPoints = (stats.receptions * 0.5) + (stats.receivingYards * 0.1) + (stats.receivingTDs * 6);
        break;
      case 'K':
        stats.fgAttempted = Math.floor(Math.random() * 4) + 1; // 1-4
        stats.fgMade = Math.floor(Math.random() * stats.fgAttempted) + 1;
        stats.fantasyPoints = stats.fgMade * 3;
        break;
      case 'DEF':
        stats.defSacks = Math.floor(Math.random() * 4); // 0-3
        stats.defInterceptions = Math.floor(Math.random() * 2); // 0-1
        stats.defTDs = Math.random() > 0.9 ? 1 : 0;
        stats.fantasyPoints = (stats.defSacks * 1) + (stats.defInterceptions * 2) + (stats.defTDs * 6) + 5; // Base 5 points
        break;
    }

    stats.fantasyPoints = Math.round(stats.fantasyPoints * 10) / 10;
    return stats;
  }

  // ============================================================
  // CREATE PLAYER STATS FOR COMPLETED MATCHES
  // ============================================================
  console.log('\n📊 Generating player stats for completed matches...');
  
  const completedMatchesForStats = await prisma.match.findMany({
    where: { status: 'FINAL' },
    take: 5,
    include: { homeTeam: true, awayTeam: true },
  });

  for (const match of completedMatchesForStats) {
    const matchPlayers = await prisma.player.findMany({
      where: { teamId: { in: [match.homeTeamId, match.awayTeamId] } },
    });

    for (const player of matchPlayers) {
      const stats = generatePlayerStats(player.position);
      
      await prisma.playerStat.upsert({
        where: { playerId_matchId: { playerId: player.id, matchId: match.id } },
        update: stats,
        create: {
          playerId: player.id,
          matchId: match.id,
          ...stats,
        },
      });
    }
    console.log(`  ✓ Stats for ${match.homeTeam.abbreviation} vs ${match.awayTeam.abbreviation}: ${matchPlayers.length} players`);
  }

  // ============================================================
  // JOHN'S COMPREHENSIVE DEMO DATA
  // ============================================================
  console.log('\n🎯 Creating comprehensive data for John (demo user)...');

  // ============================================================
  // JOHN'S FANTASY TEAMS (Multiple matches)
  // ============================================================
  const johnsTeams: any[] = [];
  const johnsTeamNames = ['The Crushers', 'Victory Squad', 'Gridiron Kings', 'Sunday Warriors'];
  
  for (let i = 0; i < Math.min(4, matches.length); i++) {
    const match = matches[i];
    const players = await getPlayersForMatch(match);
    
    if (players.length < 8) continue;
    
    const { roster, totalCost } = await buildTeam(players);
    if (roster.length < 8) continue;
    
    const isCompleted = match.status === 'FINAL';
    const points = isCompleted 
      ? Math.floor(Math.random() * 60) + 90  // 90-150 points for completed
      : 0;
    
    const userTeam = await prisma.userTeam.create({
      data: {
        userId: john.id,
        matchId: match.id,
        teamName: johnsTeamNames[i],
        totalCost,
        totalPoints: points,
        rank: isCompleted ? Math.floor(Math.random() * 5) + 1 : null,
        players: {
          create: roster.map(r => ({
            playerId: r.playerId,
            position: r.position,
          })),
        },
      },
    });
    
    johnsTeams.push(userTeam);
    console.log(`  ✓ John's Team: "${johnsTeamNames[i]}" ($${totalCost.toFixed(1)}) for ${match.homeTeam.abbreviation} vs ${match.awayTeam.abbreviation}`);
  }

  // ============================================================
  // JOHN'S PICKS (Predictions)
  // ============================================================
  console.log('\n🎲 Creating John\'s match predictions...');
  const completedMatches = matches.filter(m => m.status === 'FINAL');
  const upcomingMatches = matches.filter(m => m.status === 'SCHEDULED');
  
  // Picks for completed matches (with results)
  for (let i = 0; i < Math.min(3, completedMatches.length); i++) {
    const match = completedMatches[i];
    const predictedWinner = Math.random() > 0.5 ? 'home' : 'away';
    const actualWinner = (match.homeScore || 0) > (match.awayScore || 0) ? 'home' : 'away';
    const isCorrect = predictedWinner === actualWinner;
    const confidencePoints = Math.floor(Math.random() * 10) + 6; // 6-15 points
    
    await prisma.pick.create({
      data: {
        userId: john.id,
        matchId: match.id,
        predictedWinner,
        confidencePoints,
        isCorrect,
        pointsEarned: isCorrect ? confidencePoints : 0,
      },
    });
    console.log(`  ✓ Pick: ${match.homeTeam.abbreviation} vs ${match.awayTeam.abbreviation} - ${isCorrect ? '✅ Correct' : '❌ Wrong'} (+${isCorrect ? confidencePoints : 0} pts)`);
  }
  
  // Picks for upcoming matches (pending)
  for (let i = 0; i < Math.min(2, upcomingMatches.length); i++) {
    const match = upcomingMatches[i];
    const predictedWinner = Math.random() > 0.5 ? 'home' : 'away';
    const confidencePoints = Math.floor(Math.random() * 10) + 6;
    
    await prisma.pick.create({
      data: {
        userId: john.id,
        matchId: match.id,
        predictedWinner,
        confidencePoints,
        isCorrect: null, // Pending
        pointsEarned: 0,
      },
    });
    console.log(`  ✓ Pick (Pending): ${match.homeTeam.abbreviation} vs ${match.awayTeam.abbreviation} - Confidence: ${confidencePoints}`);
  }

  // ============================================================
  // OTHER USERS' TEAMS (for competition)
  // ============================================================
  console.log('\n👥 Creating teams for other users...');
  const userTeams: any[] = [...johnsTeams];

  // Create teams for other users (Jane, Mike, Sarah) on shared matches
  const otherUsers = [jane, mike, sarah];
  for (let i = 0; i < otherUsers.length; i++) {
    const user = otherUsers[i];
    // Each user gets a team on the first match (to compete with John)
    const match = matches[0];
    const players = await getPlayersForMatch(match);

    if (players.length < 8) {
      console.log(`⚠️  Not enough players for match ${match.id}, skipping team for ${user.username}`);
      continue;
    }

    const { roster, totalCost } = await buildTeam(players);

    if (roster.length < 8) {
      console.log(`⚠️  Could not build full roster for ${user.username}`);
      continue;
    }

    const teamNames = ['Gridiron Gang', 'Fantasy Queens', 'TD Chasers'];
    
    const userTeam = await prisma.userTeam.create({
      data: {
        userId: user.id,
        matchId: match.id,
        teamName: teamNames[i],
        totalCost,
        totalPoints: Math.floor(Math.random() * 80) + 60, // 60-140 points
        rank: i + 2, // John is typically rank 1
        players: {
          create: roster.map(r => ({
            playerId: r.playerId,
            position: r.position,
          })),
        },
      },
    });

    userTeams.push(userTeam);
    console.log(`  ✓ ${user.username}: "${teamNames[i]}" ($${totalCost.toFixed(1)}) for ${match.homeTeam.abbreviation} vs ${match.awayTeam.abbreviation}`);
  }

  // ============================================================
  // PICKS FOR OTHER USERS (to populate leaderboard)
  // ============================================================
  console.log('\n🎲 Creating picks for other users (leaderboard)...');
  
  for (const user of otherUsers) {
    let userPicksCreated = 0;
    
    // Completed match picks
    for (let i = 0; i < Math.min(3, completedMatches.length); i++) {
      const match = completedMatches[i];
      const predictedWinner = Math.random() > 0.5 ? 'home' : 'away';
      const actualWinner = (match.homeScore || 0) > (match.awayScore || 0) ? 'home' : 'away';
      const isCorrect = predictedWinner === actualWinner;
      const confidencePoints = Math.floor(Math.random() * 10) + 6;
      
      try {
        await prisma.pick.create({
          data: {
            userId: user.id,
            matchId: match.id,
            predictedWinner,
            confidencePoints,
            isCorrect,
            pointsEarned: isCorrect ? confidencePoints : 0,
          },
        });
        userPicksCreated++;
      } catch (e) {
        // Skip if duplicate
      }
    }
    
    // Upcoming match picks
    for (let i = 0; i < Math.min(2, upcomingMatches.length); i++) {
      const match = upcomingMatches[i];
      const predictedWinner = Math.random() > 0.5 ? 'home' : 'away';
      const confidencePoints = Math.floor(Math.random() * 10) + 6;
      
      try {
        await prisma.pick.create({
          data: {
            userId: user.id,
            matchId: match.id,
            predictedWinner,
            confidencePoints,
            isCorrect: null,
            pointsEarned: 0,
          },
        });
        userPicksCreated++;
      } catch (e) {
        // Skip if duplicate
      }
    }
    
    console.log(`  ✓ ${user.username}: ${userPicksCreated} picks created`);
  }

  console.log(`\n✅ Created ${userTeams.length} fantasy teams total\n`);

  // ============================================================
  // LEAGUES (with John as commissioner/member)
  // ============================================================
  console.log('🏆 Creating leagues...');

  if (johnsTeams.length >= 1 && matches.length > 0) {
    // John's first team for leagues
    const johnsFirstTeam = johnsTeams[0];
    
    // Public league - John is commissioner
    const publicLeague = await prisma.league.create({
      data: {
        name: 'Sunday Showdown',
        description: 'Weekly public league - compete against the best! Open to everyone.',
        commissionerId: john.id,
        matchId: matches[0].id,
        inviteCode: 'SUNDAY2025',
        isPrivate: false,
        maxMembers: 50,
        entryFee: 50,
        basePrizePool: 500,
        prizeDistribution: [
          { rank: 1, amount: 300 },
          { rank: 2, amount: 150 },
          { rank: 3, amount: 50 },
        ],
      },
    });

    // Add John as member (commissioner auto-joins)
    await prisma.leagueMember.create({
      data: {
        leagueId: publicLeague.id,
        userId: john.id,
        userTeamId: johnsFirstTeam.id,
        points: johnsFirstTeam.totalPoints,
        rank: 1,
        prizesWon: 300, // First place prize
      },
    });

    // Add other members to public league
    const otherTeamsForMatch = userTeams.filter(ut => ut.matchId === matches[0].id && ut.userId !== john.id);
    const prizeAmounts = [150, 50, 0]; // 2nd, 3rd, 4th place
    for (let i = 0; i < otherTeamsForMatch.length; i++) {
      const ut = otherTeamsForMatch[i];
      await prisma.leagueMember.create({
        data: {
          leagueId: publicLeague.id,
          userId: ut.userId,
          userTeamId: ut.id,
          points: ut.totalPoints,
          rank: i + 2,
          prizesWon: prizeAmounts[i] || 0,
        },
      });
    }
    console.log(`  ✓ "${publicLeague.name}" (Public) - ${otherTeamsForMatch.length + 1} members - John is Commissioner`);

    // Private league - Jane is commissioner, John is member
    const privateLeague = await prisma.league.create({
      data: {
        name: 'Office Champions',
        description: 'Private league for office colleagues only. Invite your coworkers!',
        commissionerId: jane.id,
        matchId: matches[0].id,
        inviteCode: 'OFFICE2025',
        isPrivate: true,
        maxMembers: 12,
        entryFee: 100,
        basePrizePool: 0,
        prizeDistribution: [
          { rank: 1, amount: 250 },
          { rank: 2, amount: 100 },
        ],
      },
    });

    // Jane joins her own league
    const janesTeam = userTeams.find(ut => ut.userId === jane.id && ut.matchId === matches[0].id);
    if (janesTeam) {
      await prisma.leagueMember.create({
        data: {
          leagueId: privateLeague.id,
          userId: jane.id,
          userTeamId: janesTeam.id,
          points: janesTeam.totalPoints,
          rank: 2,
        },
      });
    }

    // John joins the private league
    await prisma.leagueMember.create({
      data: {
        leagueId: privateLeague.id,
        userId: john.id,
        userTeamId: johnsFirstTeam.id,
        points: johnsFirstTeam.totalPoints,
        rank: 1,
      },
    });
    console.log(`  ✓ "${privateLeague.name}" (Private) - Code: OFFICE2025 - John is Member`);

    // Another league John created for a different match
    if (johnsTeams.length > 1 && matches.length > 1) {
      const weekendWarriors = await prisma.league.create({
        data: {
          name: 'Weekend Warriors',
          description: 'Casual league for weekend games. All skill levels welcome!',
          commissionerId: john.id,
          matchId: matches[1].id,
          inviteCode: 'WEEKEND25',
          isPrivate: false,
          maxMembers: 30,
          entryFee: 25,
          basePrizePool: 250,
          prizeDistribution: [
            { rank: 1, amount: 150 },
            { rank: 2, amount: 75 },
            { rank: 3, amount: 25 },
          ],
        },
      });

      const johnsSecondTeam = johnsTeams.find(t => t.matchId === matches[1].id);
      if (johnsSecondTeam) {
        await prisma.leagueMember.create({
          data: {
            leagueId: weekendWarriors.id,
            userId: john.id,
            userTeamId: johnsSecondTeam.id,
            points: johnsSecondTeam.totalPoints,
            rank: 1,
          },
        });
      }
      console.log(`  ✓ "${weekendWarriors.name}" (Public) - Code: WEEKEND25 - John is Commissioner`);
    }

    // High stakes league (John is NOT in this one - for variety)
    const highStakes = await prisma.league.create({
      data: {
        name: 'High Rollers',
        description: 'High stakes competition for serious players. Big risks, big rewards!',
        commissionerId: mike.id,
        matchId: matches.length > 1 ? matches[1].id : matches[0].id,
        inviteCode: 'HIGHROLL',
        isPrivate: true,
        maxMembers: 10,
        entryFee: 500,
        basePrizePool: 1000,
      },
    });
    console.log(`  ✓ "${highStakes.name}" (Private) - Code: HIGHROLL`);
  }

  console.log('\n✨ Seed completed!\n');
  console.log('═'.repeat(60));
  console.log('📊 SEED SUMMARY');
  console.log('═'.repeat(60));
  console.log('');
  console.log('   🎯 PRIMARY DEMO ACCOUNT:');
  console.log('   ────────────────────────────────────');
  console.log('   Email: john@example.com');
  console.log('   Password: password123');
  console.log('   ');
  console.log('   Stats:');
  console.log('   • Total Points: 342 | Rank: #1 | Credits: 850');
  console.log(`   • Fantasy Teams: ${johnsTeams.length} teams across multiple matches`);
  console.log('   • Match Predictions: 5 picks (3 completed, 2 pending)');
  console.log('   • Leagues: 3 (2 as Commissioner, 1 as Member)');
  console.log('   • Prizes Won: $300 (1st place in Sunday Showdown)');
  console.log('');
  console.log('   👥 OTHER DEMO ACCOUNTS (password: password123):');
  console.log('   ────────────────────────────────────');
  console.log('   • jane@example.com    - 287 pts, Rank #2, Credits: 920');
  console.log('   • mike@example.com    - 265 pts, Rank #3, Credits: 780');
  console.log('   • sarah@example.com   - 198 pts, Rank #4, Credits: 1100');
  console.log('   • alex@example.com    - 178 pts, Rank #5, Credits: 650');
  console.log('   • chris@example.com   - 156 pts, Rank #6, Credits: 890');
  console.log('   • emma@example.com    - 142 pts, Rank #7, Credits: 720');
  console.log('   • david@example.com   - 128 pts, Rank #8, Credits: 550');
  console.log('   • admin@example.com   - ADMIN account');
  console.log('');
  console.log('   🏆 LEAGUES:');
  console.log('   ────────────────────────────────────');
  console.log('   • Sunday Showdown  - Public  - Code: SUNDAY2025  (John is Commissioner)');
  console.log('   • Office Champions - Private - Code: OFFICE2025  (Jane is Commissioner)');
  console.log('   • Weekend Warriors - Public  - Code: WEEKEND25   (John is Commissioner)');
  console.log('   • High Rollers     - Private - Code: HIGHROLL    (Mike is Commissioner)');
  console.log('');
  console.log('   📈 DATA CREATED:');
  console.log('   ────────────────────────────────────');
  console.log(`   • ${userTeams.length} Fantasy Teams`);
  console.log(`   • ${completedMatchesForStats.length * 50}+ Player Stats entries`);
  console.log('   • 20+ Match Predictions');
  console.log('   • 4 Leagues with members');
  console.log('');
  console.log('═'.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
