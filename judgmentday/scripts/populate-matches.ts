/**
 * Script to populate NFL matches from ESPN API
 * Run with: npx tsx scripts/populate-matches.ts [season] [week]
 * 
 * Examples:
 * - Current season/week: npx tsx scripts/populate-matches.ts
 * - Specific week: npx tsx scripts/populate-matches.ts 2024 1
 * - Entire season: npx tsx scripts/populate-matches.ts 2024 all
 */

import { PrismaClient } from '@prisma/client';
import { 
  fetchESPNSchedule,
  fetchESPNScoreboard,
  fetchESPNSeasonSchedule,
  getESPNTeamId,
  type MatchData 
} from '../src/lib/espn-api';

const prisma = new PrismaClient();

// Current NFL season and week (update as needed)
const CURRENT_SEASON = 2024;
const CURRENT_WEEK = 13; // Update this based on current week

async function findTeamByAbbreviation(abbreviation: string) {
  // Try exact match first
  let team = await prisma.team.findUnique({
    where: { abbreviation: abbreviation },
  });

  // If not found, try common variations
  if (!team) {
    const variations: Record<string, string> = {
      'WSH': 'WAS', // Washington
      'JAC': 'JAX', // Jacksonville
      'LA': 'LAR',  // LA Rams
    };
    
    const altAbbr = variations[abbreviation];
    if (altAbbr) {
      team = await prisma.team.findUnique({
        where: { abbreviation: altAbbr },
      });
    }
  }

  return team;
}

async function populateMatchesFromData(matches: MatchData[]) {
  let createdCount = 0;
  let updatedCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const matchData of matches) {
    try {
      // Find home and away teams
      const homeTeam = await findTeamByAbbreviation(matchData.homeTeamAbbr);
      const awayTeam = await findTeamByAbbreviation(matchData.awayTeamAbbr);

      if (!homeTeam) {
        errors.push(`Home team not found: ${matchData.homeTeamAbbr}`);
        errorCount++;
        continue;
      }

      if (!awayTeam) {
        errors.push(`Away team not found: ${matchData.awayTeamAbbr}`);
        errorCount++;
        continue;
      }

      // Upsert match
      const match = await prisma.match.upsert({
        where: { 
          id: `espn-${matchData.espnId}`,
        },
        update: {
          week: matchData.week,
          season: matchData.season,
          homeScore: matchData.homeScore,
          awayScore: matchData.awayScore,
          scheduledAt: matchData.scheduledAt,
          status: matchData.status,
          quarter: matchData.quarter,
          timeRemaining: matchData.timeRemaining,
        },
        create: {
          id: `espn-${matchData.espnId}`,
          week: matchData.week,
          season: matchData.season,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          homeScore: matchData.homeScore,
          awayScore: matchData.awayScore,
          scheduledAt: matchData.scheduledAt,
          status: matchData.status,
          quarter: matchData.quarter,
          timeRemaining: matchData.timeRemaining,
        },
      });

      const isNew = match.createdAt.getTime() === match.updatedAt.getTime();
      
      if (isNew) {
        createdCount++;
        console.log(`  ✅ ${awayTeam.abbreviation} @ ${homeTeam.abbreviation} - ${matchData.scheduledAt.toLocaleDateString()}`);
      } else {
        updatedCount++;
        console.log(`  🔄 ${awayTeam.abbreviation} @ ${homeTeam.abbreviation} - ${matchData.status}`);
      }

      if (matchData.homeScore !== undefined && matchData.awayScore !== undefined) {
        console.log(`     Score: ${awayTeam.abbreviation} ${matchData.awayScore} - ${homeTeam.abbreviation} ${matchData.homeScore}`);
      }

    } catch (error: any) {
      errorCount++;
      errors.push(`Error processing match ${matchData.espnId}: ${error.message}`);
    }
  }

  return { createdCount, updatedCount, errorCount, errors };
}

async function populateMatches() {
  try {
    console.log('🚀 Starting match population from ESPN API...\n');

    const args = process.argv.slice(2);
    const season = args[0] ? parseInt(args[0]) : CURRENT_SEASON;
    const weekArg = args[1];

    let matches: MatchData[] = [];

    if (weekArg === 'all') {
      console.log(`📅 Fetching entire ${season} season schedule...\n`);
      matches = await fetchESPNSeasonSchedule(season);
    } else if (weekArg === 'current') {
      console.log('📊 Fetching current scoreboard...\n');
      matches = await fetchESPNScoreboard();
    } else {
      const week = weekArg ? parseInt(weekArg) : CURRENT_WEEK;
      console.log(`📅 Fetching ${season} Week ${week} schedule...\n`);
      matches = await fetchESPNSchedule(season, week);
    }

    if (matches.length === 0) {
      console.log('⚠️  No matches found. The season might not have started yet or the week is invalid.\n');
      return;
    }

    console.log(`📊 Found ${matches.length} matches\n`);
    console.log('=' .repeat(60));

    const result = await populateMatchesFromData(matches);

    console.log('\n' + '='.repeat(60));
    console.log('📈 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Created: ${result.createdCount} matches`);
    console.log(`🔄 Updated: ${result.updatedCount} matches`);
    console.log(`❌ Errors: ${result.errorCount} matches`);
    console.log('='.repeat(60));

    if (result.errors.length > 0) {
      console.log('\n⚠️  ERRORS:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }

    // Show match breakdown by status
    const allMatches = await prisma.match.findMany({
      where: {
        season,
      },
      include: {
        homeTeam: { select: { abbreviation: true } },
        awayTeam: { select: { abbreviation: true } },
      },
      orderBy: [
        { week: 'asc' },
        { scheduledAt: 'asc' },
      ],
    });

    console.log('\n📊 MATCHES BY STATUS:\n');
    const statusCounts: Record<string, number> = {};
    allMatches.forEach(match => {
      statusCounts[match.status] = (statusCounts[match.status] || 0) + 1;
    });

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} matches`);
    });

    console.log(`\n📅 Total matches in database for ${season}: ${allMatches.length}`);
    console.log('\n✨ Match population completed successfully!\n');

  } catch (error: any) {
    console.error('\n💥 Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
populateMatches();

