/**
 * Sync player statistics from SportsData.io
 * Run with: npx tsx scripts/sync-player-stats.ts [season] [week]
 * 
 * Examples:
 * - Current week: npx tsx scripts/sync-player-stats.ts
 * - Specific week: npx tsx scripts/sync-player-stats.ts 2025 12
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { PrismaClient } from '@prisma/client';
import {
  getCurrentSeasonInfo,
  fetchScoresByWeek,
  fetchPlayerStatsByGame,
  type PlayerStatUpdate,
} from '../src/lib/sportsdata-api';
import { calculateFantasyPoints } from '../src/lib/scoring';

const prisma = new PrismaClient();

async function syncPlayerStatsForGame(
  scoreId: string,
  gameInfo: any
): Promise<{ success: boolean; playersUpdated: number; errors: number }> {
  try {
    console.log(`\n🎮 Processing game: ${gameInfo.awayTeam} @ ${gameInfo.homeTeam}`);
    console.log(`   ScoreID: ${scoreId}`);
    console.log(`   Status: ${gameInfo.status}`);
    
    // Fetch player stats from SportsData.io
    const playerStats = await fetchPlayerStatsByGame(scoreId);
    
    console.log(`   📊 Retrieved ${playerStats.length} player performances`);
    
    let playersUpdated = 0;
    let errors = 0;
    
    for (const stat of playerStats) {
      try {
        // Find the player in our database by name and team
        const player = await prisma.player.findFirst({
          where: {
            name: {
              contains: stat.playerName,
              mode: 'insensitive',
            },
            team: {
              abbreviation: stat.teamAbbr,
            },
          },
        });
        
        if (!player) {
          console.log(`   ⚠️  Player not found: ${stat.playerName} (${stat.teamAbbr})`);
          continue;
        }
        
        // Find the match in our database
        const match = await prisma.match.findFirst({
          where: {
            OR: [
              {
                homeTeam: { abbreviation: gameInfo.homeTeam },
                awayTeam: { abbreviation: gameInfo.awayTeam },
              },
            ],
            week: gameInfo.week,
            season: gameInfo.season,
          },
        });
        
        if (!match) {
          console.log(`   ⚠️  Match not found in database`);
          continue;
        }
        
        // Calculate fantasy points
        const fantasyPoints = calculateFantasyPoints({
          passingYards: stat.passingYards,
          passingTDs: stat.passingTDs,
          interceptions: stat.interceptions,
          rushingYards: stat.rushingYards,
          rushingTDs: stat.rushingTDs,
          receptions: stat.receptions,
          receivingYards: stat.receivingYards,
          receivingTDs: stat.receivingTDs,
          fumbles: stat.fumbles,
          fgMade: stat.fgMade,
          fgAttempted: stat.fgAttempted,
          defSacks: stat.defSacks,
          defInterceptions: stat.defInterceptions,
          defTDs: stat.defTDs,
        });
        
        // Upsert player stats
        await prisma.playerStat.upsert({
          where: {
            playerId_matchId: {
              playerId: player.id,
              matchId: match.id,
            },
          },
          update: {
            passingYards: stat.passingYards,
            passingTDs: stat.passingTDs,
            interceptions: stat.interceptions,
            rushingYards: stat.rushingYards,
            rushingTDs: stat.rushingTDs,
            receptions: stat.receptions,
            receivingYards: stat.receivingYards,
            receivingTDs: stat.receivingTDs,
            fumbles: stat.fumbles,
            fgMade: stat.fgMade,
            fgAttempted: stat.fgAttempted,
            defSacks: stat.defSacks,
            defInterceptions: stat.defInterceptions,
            defTDs: stat.defTDs,
            fantasyPoints: fantasyPoints,
            updatedAt: new Date(),
          },
          create: {
            playerId: player.id,
            matchId: match.id,
            passingYards: stat.passingYards,
            passingTDs: stat.passingTDs,
            interceptions: stat.interceptions,
            rushingYards: stat.rushingYards,
            rushingTDs: stat.rushingTDs,
            receptions: stat.receptions,
            receivingYards: stat.receivingYards,
            receivingTDs: stat.receivingTDs,
            fumbles: stat.fumbles,
            fgMade: stat.fgMade,
            fgAttempted: stat.fgAttempted,
            defSacks: stat.defSacks,
            defInterceptions: stat.defInterceptions,
            defTDs: stat.defTDs,
            fantasyPoints: fantasyPoints,
          },
        });
        
        playersUpdated++;
        
        if (fantasyPoints > 0) {
          console.log(`   ✅ ${stat.playerName}: ${fantasyPoints.toFixed(1)} pts`);
        }
        
      } catch (error: any) {
        errors++;
        console.error(`   ❌ Error processing ${stat.playerName}:`, error.message);
      }
    }
    
    return { success: true, playersUpdated, errors };
    
  } catch (error: any) {
    console.error(`   ❌ Failed to sync game ${scoreId}:`, error.message);
    return { success: false, playersUpdated: 0, errors: 1 };
  }
}

async function syncPlayerStats() {
  try {
    console.log('🚀 Starting player stats sync from SportsData.io...\n');
    
    // Get season and week from args or use current
    const args = process.argv.slice(2);
    let season: number;
    let week: number;
    
    if (args.length >= 2) {
      season = parseInt(args[0]);
      week = parseInt(args[1]);
      console.log(`📅 Syncing stats for ${season} Week ${week}\n`);
    } else {
      const currentInfo = await getCurrentSeasonInfo();
      season = currentInfo.season;
      week = currentInfo.week;
      console.log(`📅 Syncing stats for current week: ${season} Week ${week}\n`);
    }
    
    // Fetch scores/games for the week
    const games = await fetchScoresByWeek(season, week);
    
    console.log(`📊 Found ${games.length} games for Week ${week}`);
    console.log('='.repeat(60));
    
    let totalPlayersUpdated = 0;
    let totalErrors = 0;
    let gamesProcessed = 0;
    
    // Process each game
    for (const game of games) {
      // Only sync games that are Final or InProgress
      if (game.status === 'Scheduled' || game.status === 'Postponed') {
        console.log(`\n⏭️  Skipping ${game.awayTeam} @ ${game.homeTeam} (${game.status})`);
        continue;
      }
      
      const result = await syncPlayerStatsForGame(game.scoreId, game);
      
      if (result.success) {
        totalPlayersUpdated += result.playersUpdated;
        totalErrors += result.errors;
        gamesProcessed++;
      }
      
      // Small delay between games to be respectful to API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📈 SYNC SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Games Processed: ${gamesProcessed}/${games.length}`);
    console.log(`✅ Player Stats Updated: ${totalPlayersUpdated}`);
    console.log(`❌ Errors: ${totalErrors}`);
    console.log('='.repeat(60));
    
    // Now update user team scores
    console.log('\n🏆 Updating user team scores...');
    
    const { updateUserTeamPoints } = await import('../src/lib/scoring');
    
    for (const game of games) {
      const match = await prisma.match.findFirst({
        where: {
          week: game.week,
          season: game.season,
          homeTeam: { abbreviation: game.homeTeam },
          awayTeam: { abbreviation: game.awayTeam },
        },
      });
      
      if (match) {
        await updateUserTeamPoints(prisma, match.id);
        console.log(`   ✅ Updated scores for match: ${game.awayTeam} @ ${game.homeTeam}`);
      }
    }
    
    console.log('\n✨ Player stats sync completed successfully!\n');
    
  } catch (error: any) {
    console.error('\n💥 Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
syncPlayerStats();

