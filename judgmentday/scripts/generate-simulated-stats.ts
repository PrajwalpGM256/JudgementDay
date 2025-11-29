/**
 * Generate simulated player statistics for completed matches
 * Run with: npx tsx scripts/generate-simulated-stats.ts [season] [week]
 * 
 * Examples:
 * - Specific week: npx tsx scripts/generate-simulated-stats.ts 2025 12
 * - Current season: npx tsx scripts/generate-simulated-stats.ts 2025
 */

import { PrismaClient } from '@prisma/client';
import { generatePlayerStats } from '../src/lib/smart-simulation';
import { calculateFantasyPoints, updateUserTeamPoints } from '../src/lib/scoring';

const prisma = new PrismaClient();

async function generateStatsForMatch(matchId: string, matchInfo: any) {
  try {
    console.log(`\n🎮 Generating stats for: ${matchInfo.awayTeam} @ ${matchInfo.homeTeam}`);
    console.log(`   Score: ${matchInfo.awayTeam} ${matchInfo.awayScore} - ${matchInfo.homeTeam} ${matchInfo.homeScore}`);
    
    // Check if stats already exist for this match
    const existingStats = await prisma.playerStat.findFirst({
      where: { matchId },
    });
    
    if (existingStats) {
      console.log(`   ⏭️  Stats already exist for this match, skipping...`);
      return { playersUpdated: 0, skipped: true };
    }
    
    // Get all players from both teams
    const homeTeam = await prisma.team.findUnique({
      where: { id: matchInfo.homeTeamId },
      include: { 
        players: { 
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
    });
    
    const awayTeam = await prisma.team.findUnique({
      where: { id: matchInfo.awayTeamId },
      include: { 
        players: { 
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
    });
    
    if (!homeTeam || !awayTeam) {
      console.log(`   ❌ Teams not found`);
      return { playersUpdated: 0, skipped: false };
    }
    
    let playersUpdated = 0;
    const homeScore = matchInfo.homeScore || 0;
    const awayScore = matchInfo.awayScore || 0;
    
    // Generate stats for home team players
    for (const player of homeTeam.players) {
      const stats = generatePlayerStats(player.position, homeScore, awayScore);
      const fantasyPoints = calculateFantasyPoints(stats);
      
      await prisma.playerStat.create({
        data: {
          playerId: player.id,
          matchId: matchId,
          ...stats,
          fantasyPoints,
        },
      });
      
      if (fantasyPoints > 5) {
        console.log(`   ✅ ${player.name} (${player.position}): ${fantasyPoints.toFixed(1)} pts`);
      }
      
      playersUpdated++;
    }
    
    // Generate stats for away team players
    for (const player of awayTeam.players) {
      const stats = generatePlayerStats(player.position, awayScore, homeScore);
      const fantasyPoints = calculateFantasyPoints(stats);
      
      await prisma.playerStat.create({
        data: {
          playerId: player.id,
          matchId: matchId,
          ...stats,
          fantasyPoints,
        },
      });
      
      if (fantasyPoints > 5) {
        console.log(`   ✅ ${player.name} (${player.position}): ${fantasyPoints.toFixed(1)} pts`);
      }
      
      playersUpdated++;
    }
    
    console.log(`   📊 Generated stats for ${playersUpdated} players`);
    
    // Update user team scores for this match
    await updateUserTeamPoints(prisma, matchId);
    console.log(`   🏆 Updated user team scores`);
    
    return { playersUpdated, skipped: false };
    
  } catch (error: any) {
    console.error(`   ❌ Error generating stats for match:`, error.message);
    return { playersUpdated: 0, skipped: false };
  }
}

async function generateSimulatedStats() {
  try {
    console.log('🚀 Starting simulated player stats generation...\n');
    
    const args = process.argv.slice(2);
    const season = args[0] ? parseInt(args[0]) : 2025;
    const week = args[1] ? parseInt(args[1]) : undefined;
    
    // Build query for matches
    const where: any = {
      season,
      status: 'FINAL',
      homeScore: { not: null },
      awayScore: { not: null },
    };
    
    if (week) {
      where.week = week;
      console.log(`📅 Generating stats for ${season} Week ${week}\n`);
    } else {
      console.log(`📅 Generating stats for all completed ${season} season games\n`);
    }
    
    // Get completed matches
    const matches = await prisma.match.findMany({
      where,
      include: {
        homeTeam: { select: { abbreviation: true } },
        awayTeam: { select: { abbreviation: true } },
      },
      orderBy: [
        { week: 'asc' },
        { scheduledAt: 'asc' },
      ],
    });
    
    console.log(`📊 Found ${matches.length} completed matches\n`);
    console.log('='.repeat(60));
    
    let totalPlayersUpdated = 0;
    let matchesProcessed = 0;
    let matchesSkipped = 0;
    
    for (const match of matches) {
      const matchInfo = {
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        homeTeam: match.homeTeam.abbreviation,
        awayTeam: match.awayTeam.abbreviation,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
      };
      
      const result = await generateStatsForMatch(match.id, matchInfo);
      
      if (result.skipped) {
        matchesSkipped++;
      } else {
        totalPlayersUpdated += result.playersUpdated;
        matchesProcessed++;
      }
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📈 GENERATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Matches Processed: ${matchesProcessed}`);
    console.log(`⏭️  Matches Skipped: ${matchesSkipped} (already had stats)`);
    console.log(`📊 Player Stats Created: ${totalPlayersUpdated}`);
    console.log('='.repeat(60));
    
    // Show some sample results
    console.log('\n🏆 Top Performances:\n');
    
    const topPerformances = await prisma.playerStat.findMany({
      where: {
        match: { 
          season,
          ...(week ? { week } : {}),
        },
      },
      include: {
        player: {
          select: {
            name: true,
            position: true,
          },
        },
        match: {
          select: {
            week: true,
            homeTeam: { select: { abbreviation: true } },
            awayTeam: { select: { abbreviation: true } },
          },
        },
      },
      orderBy: {
        fantasyPoints: 'desc',
      },
      take: 10,
    });
    
    topPerformances.forEach((stat, index) => {
      console.log(`${index + 1}. ${stat.player.name} (${stat.player.position}) - Week ${stat.match.week}`);
      console.log(`   ${stat.fantasyPoints.toFixed(1)} fantasy points`);
      if (stat.passingYards > 0) console.log(`   ${stat.passingYards} pass yds, ${stat.passingTDs} TDs`);
      if (stat.rushingYards > 0) console.log(`   ${stat.rushingYards} rush yds, ${stat.rushingTDs} TDs`);
      if (stat.receivingYards > 0) console.log(`   ${stat.receivingYards} rec yds, ${stat.receivingTDs} TDs, ${stat.receptions} rec`);
      console.log('');
    });
    
    console.log('✨ Simulated stats generation completed!\n');
    
  } catch (error: any) {
    console.error('\n💥 Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateSimulatedStats();

