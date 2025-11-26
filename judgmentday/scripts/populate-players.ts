/**
 * Script to populate NFL players from ESPN API
 * Run with: npx tsx scripts/populate-players.ts
 * 
 * Options:
 * - Single team: npx tsx scripts/populate-players.ts KC
 * - All teams: npx tsx scripts/populate-players.ts
 */

import { PrismaClient } from '@prisma/client';
import { 
  fetchESPNTeamRoster,
  mapESPNPosition,
  getESPNTeamId,
  type PlayerData 
} from '../src/lib/espn-api';

const prisma = new PrismaClient();

// Fantasy price calculation based on position
function calculatePlayerPrice(position: string, jerseyNumber?: number): number {
  const basePrices: Record<string, number> = {
    'QB': 15,   // Quarterbacks are most expensive
    'RB': 12,   // Running backs
    'WR': 10,   // Wide receivers
    'TE': 8,    // Tight ends
    'K': 5,     // Kickers
    'DEF': 3,   // Defense (less used in our system)
  };

  const basePrice = basePrices[position] || 8;
  
  // Add some variance (+/- 3) based on jersey number for realism
  const variance = jerseyNumber ? ((jerseyNumber % 6) - 3) : 0;
  
  return Math.max(3, basePrice + variance);
}

async function populatePlayersForTeam(dbTeamId: string, teamAbbr: string, teamName: string) {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🏈 Processing ${teamName} (${teamAbbr})`);
    console.log('='.repeat(60));

    // Get ESPN team ID from abbreviation
    const espnTeamId = getESPNTeamId(teamAbbr);
    if (!espnTeamId) {
      throw new Error(`No ESPN team ID found for ${teamAbbr}`);
    }

    // Fetch roster from ESPN
    const espnPlayers = await fetchESPNTeamRoster(espnTeamId);

    console.log(`📊 Fetched ${espnPlayers.length} players from ESPN\n`);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Filter to only fantasy-relevant positions
    const relevantPositions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

    for (const espnPlayer of espnPlayers) {
      try {
        // Map ESPN position to our enum
        const position = mapESPNPosition(espnPlayer.position);

        // Skip defensive players (we don't use individual defensive players)
        if (position === 'DEF') {
          skippedCount++;
          continue;
        }

        // Calculate fantasy price
        const price = calculatePlayerPrice(position, espnPlayer.jerseyNumber);

        const playerData = {
          name: espnPlayer.name,
          position,
          teamId: dbTeamId,
          price,
          imageUrl: espnPlayer.imageUrl,
          jerseyNumber: espnPlayer.jerseyNumber,
          status: espnPlayer.status as any,
          avgPoints: 0, // Will be calculated from actual stats later
        };

        // Upsert player
        const player = await prisma.player.upsert({
          where: { 
            // Use a composite key of dbTeamId + espnPlayer.id to handle players with same name
            id: `${dbTeamId}-${espnPlayer.id}`,
          },
          update: playerData,
          create: {
            id: `${dbTeamId}-${espnPlayer.id}`,
            ...playerData,
          },
        });

        const isNew = player.createdAt.getTime() === player.updatedAt.getTime();
        
        if (isNew) {
          createdCount++;
          console.log(`  ✅ ${player.name} - ${player.position} #${player.jerseyNumber || '??'} ($${player.price})`);
        } else {
          updatedCount++;
          console.log(`  🔄 ${player.name} - ${player.position} #${player.jerseyNumber || '??'} ($${player.price})`);
        }

        if (player.imageUrl) {
          console.log(`     🖼️  ${player.imageUrl.substring(0, 60)}...`);
        }

      } catch (error: any) {
        errors.push(`${espnPlayer.name}: ${error.message}`);
      }
    }

    console.log(`\n📈 ${teamName} Summary:`);
    console.log(`   ✅ Created: ${createdCount}`);
    console.log(`   🔄 Updated: ${updatedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount} (defensive players)`);
    if (errors.length > 0) {
      console.log(`   ❌ Errors: ${errors.length}`);
      errors.forEach(err => console.log(`      - ${err}`));
    }

    return { createdCount, updatedCount, skippedCount, errors: errors.length };

  } catch (error: any) {
    console.error(`\n❌ Error processing team ${teamAbbr}:`, error.message);
    return { createdCount: 0, updatedCount: 0, skippedCount: 0, errors: 1 };
  }
}

async function populatePlayers() {
  try {
    console.log('🚀 Starting player population from ESPN API...\n');

    // Check if specific team abbreviation was provided
    const targetTeam = process.argv[2]?.toUpperCase();

    // Fetch all teams from database
    let teams = await prisma.team.findMany({
      orderBy: { name: 'asc' },
    });

    if (targetTeam) {
      teams = teams.filter(t => t.abbreviation === targetTeam);
      if (teams.length === 0) {
        console.error(`❌ Team "${targetTeam}" not found in database`);
        process.exit(1);
      }
      console.log(`🎯 Processing single team: ${teams[0].name}\n`);
    } else {
      console.log(`📋 Processing all ${teams.length} teams\n`);
      console.log('💡 Tip: To process a single team, run: npx tsx scripts/populate-players.ts <TEAM_ABBR>\n');
    }

    let totalCreated = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    // Process each team
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      
      console.log(`\n[${i + 1}/${teams.length}] Processing ${team.name}...`);

      const result = await populatePlayersForTeam(
        team.id,
        team.abbreviation,
        team.name
      );

      totalCreated += result.createdCount;
      totalUpdated += result.updatedCount;
      totalSkipped += result.skippedCount;
      totalErrors += result.errors;

      // Add a small delay to avoid rate limiting (500ms between teams)
      if (i < teams.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('📈 OVERALL SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Created: ${totalCreated} players`);
    console.log(`🔄 Updated: ${totalUpdated} players`);
    console.log(`⏭️  Skipped: ${totalSkipped} players (defensive)`);
    console.log(`❌ Errors: ${totalErrors}`);
    console.log(`📊 Total teams: ${teams.length}`);
    console.log('='.repeat(60));

    // Show position breakdown
    const positionCounts = await prisma.player.groupBy({
      by: ['position'],
      _count: { position: true },
    });

    console.log('\n📊 PLAYERS BY POSITION:\n');
    positionCounts
      .sort((a, b) => b._count.position - a._count.position)
      .forEach(({ position, _count }) => {
        console.log(`   ${position}: ${_count.position} players`);
      });

    console.log('\n✨ Player population completed successfully!\n');

  } catch (error: any) {
    console.error('\n💥 Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
populatePlayers();

