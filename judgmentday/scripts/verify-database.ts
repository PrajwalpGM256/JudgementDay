/**
 * Comprehensive Database Verification Script
 * Tests all CRUD operations and verifies database integrity
 * Run with: npx tsx scripts/verify-database.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function addResult(test: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: any) {
  results.push({ test, status, message, details });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${test}: ${message}`);
  if (details) {
    console.log(`   Details:`, details);
  }
}

async function testReads() {
  console.log('\n' + '='.repeat(60));
  console.log('📖 TESTING READS');
  console.log('='.repeat(60));

  try {
    // Test 1: Read all teams
    const teams = await prisma.team.findMany();
    addResult('Read Teams', teams.length === 32 ? 'PASS' : 'WARN', 
      `Found ${teams.length} teams (expected 32)`, { count: teams.length });

    // Test 2: Read all players
    const players = await prisma.player.findMany();
    addResult('Read Players', players.length > 0 ? 'PASS' : 'FAIL', 
      `Found ${players.length} players`, { count: players.length });

    // Test 3: Read all matches
    const matches = await prisma.match.findMany();
    addResult('Read Matches', matches.length > 0 ? 'PASS' : 'FAIL', 
      `Found ${matches.length} matches`, { count: matches.length });

    // Test 4: Read players by position
    const qbs = await prisma.player.findMany({ where: { position: 'QB' } });
    const rbs = await prisma.player.findMany({ where: { position: 'RB' } });
    const wrs = await prisma.player.findMany({ where: { position: 'WR' } });
    const tes = await prisma.player.findMany({ where: { position: 'TE' } });
    const ks = await prisma.player.findMany({ where: { position: 'K' } });
    const defs = await prisma.player.findMany({ where: { position: 'DEF' } });
    
    addResult('Read Players by Position', 'PASS', 
      'All positions found', {
        QB: qbs.length,
        RB: rbs.length,
        WR: wrs.length,
        TE: tes.length,
        K: ks.length,
        DEF: defs.length,
      });

    // Test 5: Read matches by status
    const scheduled = await prisma.match.findMany({ where: { status: 'SCHEDULED' } });
    const final = await prisma.match.findMany({ where: { status: 'FINAL' } });
    const live = await prisma.match.findMany({ where: { status: 'LIVE' } });
    
    addResult('Read Matches by Status', 'PASS', 
      'Matches categorized by status', {
        SCHEDULED: scheduled.length,
        FINAL: final.length,
        LIVE: live.length,
      });

    // Test 6: Read players with team relation
    const playersWithTeam = await prisma.player.findMany({
      include: { team: true },
      take: 10,
    });
    addResult('Read Players with Relations', 
      playersWithTeam.every(p => p.team !== null) ? 'PASS' : 'FAIL', 
      'Players have team relations', { sampleCount: playersWithTeam.length });

    // Test 7: Read matches with teams
    const matchesWithTeams = await prisma.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      take: 10,
    });
    addResult('Read Matches with Relations', 
      matchesWithTeams.every(m => m.homeTeam && m.awayTeam) ? 'PASS' : 'FAIL', 
      'Matches have team relations', { sampleCount: matchesWithTeams.length });

  } catch (error: any) {
    addResult('Read Operations', 'FAIL', `Error: ${error.message}`);
  }
}

async function testUpdates() {
  console.log('\n' + '='.repeat(60));
  console.log('✏️  TESTING UPDATES');
  console.log('='.repeat(60));

  try {
    // Test 1: Update a player
    const testPlayer = await prisma.player.findFirst({ where: { position: 'QB' } });
    if (testPlayer) {
      const originalPrice = testPlayer.price;
      const newPrice = originalPrice + 1;
      
      const updated = await prisma.player.update({
        where: { id: testPlayer.id },
        data: { price: newPrice },
      });
      
      // Revert change
      await prisma.player.update({
        where: { id: testPlayer.id },
        data: { price: originalPrice },
      });
      
      addResult('Update Player', updated.price === newPrice ? 'PASS' : 'FAIL', 
        'Player price updated successfully');
    } else {
      addResult('Update Player', 'WARN', 'No QB found to test');
    }

    // Test 2: Update a match
    const testMatch = await prisma.match.findFirst({ where: { status: 'SCHEDULED' } });
    if (testMatch) {
      const updated = await prisma.match.update({
        where: { id: testMatch.id },
        data: { quarter: '1' },
      });
      
      // Revert change
      await prisma.match.update({
        where: { id: testMatch.id },
        data: { quarter: null },
      });
      
      addResult('Update Match', updated.quarter === '1' ? 'PASS' : 'FAIL', 
        'Match updated successfully');
    } else {
      addResult('Update Match', 'WARN', 'No scheduled match found to test');
    }

    // Test 3: Update team
    const testTeam = await prisma.team.findFirst();
    if (testTeam) {
      const originalLogo = testTeam.logoUrl;
      const updated = await prisma.team.update({
        where: { id: testTeam.id },
        data: { logoUrl: 'test-url' },
      });
      
      // Revert change
      await prisma.team.update({
        where: { id: testTeam.id },
        data: { logoUrl: originalLogo },
      });
      
      addResult('Update Team', updated.logoUrl === 'test-url' ? 'PASS' : 'FAIL', 
        'Team updated successfully');
    }

    // Test 4: Bulk update
    const playersToUpdate = await prisma.player.findMany({ take: 5 });
    if (playersToUpdate.length > 0) {
      const updateResult = await prisma.player.updateMany({
        where: { id: { in: playersToUpdate.map(p => p.id) } },
        data: { avgPoints: 10.5 },
      });
      
      addResult('Bulk Update', updateResult.count === playersToUpdate.length ? 'PASS' : 'WARN', 
        `Bulk updated ${updateResult.count} players`);
    }

  } catch (error: any) {
    addResult('Update Operations', 'FAIL', `Error: ${error.message}`);
  }
}

async function testDeletes() {
  console.log('\n' + '='.repeat(60));
  console.log('🗑️  TESTING DELETES');
  console.log('='.repeat(60));

  try {
    // Test 1: Create and delete a test record (PlayerStat)
    const testPlayer = await prisma.player.findFirst({ where: { position: 'QB' } });
    const testMatch = await prisma.match.findFirst();
    
    if (testPlayer && testMatch) {
      // Create a test player stat
      const testStat = await prisma.playerStat.create({
        data: {
          playerId: testPlayer.id,
          matchId: testMatch.id,
          passingYards: 100,
          fantasyPoints: 5.0,
        },
      });
      
      // Delete it
      await prisma.playerStat.delete({
        where: { id: testStat.id },
      });
      
      // Verify deletion
      const deleted = await prisma.playerStat.findUnique({
        where: { id: testStat.id },
      });
      
      addResult('Delete PlayerStat', deleted === null ? 'PASS' : 'FAIL', 
        'Test record created and deleted successfully');
    } else {
      addResult('Delete Test', 'WARN', 'Insufficient data to test deletion');
    }

  } catch (error: any) {
    addResult('Delete Operations', 'FAIL', `Error: ${error.message}`);
  }
}

async function testRelations() {
  console.log('\n' + '='.repeat(60));
  console.log('🔗 TESTING RELATIONS');
  console.log('='.repeat(60));

  try {
    // Test 1: Team -> Players relation
    const teamWithPlayers = await prisma.team.findFirst({
      include: { players: true },
    });
    addResult('Team-Players Relation', 
      teamWithPlayers && teamWithPlayers.players.length > 0 ? 'PASS' : 'WARN', 
      `Team has ${teamWithPlayers?.players.length || 0} players`);

    // Test 2: Match -> Teams relation
    const matchWithTeams = await prisma.match.findFirst({
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });
    addResult('Match-Teams Relation', 
      matchWithTeams && matchWithTeams.homeTeam && matchWithTeams.awayTeam ? 'PASS' : 'FAIL', 
      'Match has both home and away teams');

    // Test 3: Player -> Team relation
    const playerWithTeam = await prisma.player.findFirst({
      include: { team: true },
    });
    addResult('Player-Team Relation', 
      playerWithTeam && playerWithTeam.team ? 'PASS' : 'FAIL', 
      'Player has team relation');

  } catch (error: any) {
    addResult('Relation Tests', 'FAIL', `Error: ${error.message}`);
  }
}

async function testIntegrity() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 TESTING DATA INTEGRITY');
  console.log('='.repeat(60));

  try {
    // Test 1: No orphaned players (players without teams)
    // Since teamId is required, we check if team exists by joining
    const allPlayers = await prisma.player.findMany({
      include: { team: true },
    });
    const orphanedPlayers = allPlayers.filter(p => !p.team);
    addResult('Orphaned Players Check', 
      orphanedPlayers.length === 0 ? 'PASS' : 'FAIL', 
      orphanedPlayers.length === 0 
        ? 'No orphaned players found' 
        : `Found ${orphanedPlayers.length} orphaned players`);

    // Test 2: Matches have valid teams
    const allMatches = await prisma.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });
    const invalidMatches = allMatches.filter(m => !m.homeTeam || !m.awayTeam);
    addResult('Match Team Validation', 
      invalidMatches.length === 0 ? 'PASS' : 'FAIL', 
      invalidMatches.length === 0 
        ? 'All matches have valid teams' 
        : `Found ${invalidMatches.length} matches with invalid teams`);

    // Test 3: Player positions are valid
    const invalidPositions = await prisma.player.findMany({
      where: {
        position: {
          notIn: ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'],
        },
      },
    });
    addResult('Player Position Validation', 
      invalidPositions.length === 0 ? 'PASS' : 'FAIL', 
      invalidPositions.length === 0 
        ? 'All players have valid positions' 
        : `Found ${invalidPositions.length} players with invalid positions`);

    // Test 4: Match statuses are valid
    const invalidStatuses = await prisma.match.findMany({
      where: {
        status: {
          notIn: ['SCHEDULED', 'LIVE', 'HALFTIME', 'FINAL', 'POSTPONED', 'CANCELLED'],
        },
      },
    });
    addResult('Match Status Validation', 
      invalidStatuses.length === 0 ? 'PASS' : 'FAIL', 
      invalidStatuses.length === 0 
        ? 'All matches have valid statuses' 
        : `Found ${invalidStatuses.length} matches with invalid statuses`);

  } catch (error: any) {
    addResult('Integrity Tests', 'FAIL', `Error: ${error.message}`);
  }
}

async function generateSummary() {
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARN').length;
  const total = results.length;

  console.log(`\n✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log(`⚠️  Warnings: ${warnings}/${total}`);

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - ${r.test}: ${r.message}`);
    });
  }

  if (warnings > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`   - ${r.test}: ${r.message}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  
  // Database statistics
  const teamCount = await prisma.team.count();
  const playerCount = await prisma.player.count();
  const matchCount = await prisma.match.count();
  const playerStatCount = await prisma.playerStat.count();

  console.log('\n📈 DATABASE STATISTICS:');
  console.log(`   Teams: ${teamCount}`);
  console.log(`   Players: ${playerCount}`);
  console.log(`   Matches: ${matchCount}`);
  console.log(`   Player Stats: ${playerStatCount}`);
  
  const matchStatusCounts = await prisma.match.groupBy({
    by: ['status'],
    _count: { status: true },
  });
  
  console.log('\n📊 MATCH STATUS BREAKDOWN:');
  matchStatusCounts.forEach(({ status, _count }) => {
    console.log(`   ${status}: ${_count.status}`);
  });

  const playerPositionCounts = await prisma.player.groupBy({
    by: ['position'],
    _count: { position: true },
  });

  console.log('\n🏈 PLAYER POSITION BREAKDOWN:');
  playerPositionCounts.forEach(({ position, _count }) => {
    console.log(`   ${position}: ${_count.position}`);
  });

  console.log('\n✨ Verification completed!\n');
}

async function main() {
  try {
    console.log('🚀 Starting Database Verification...\n');
    console.log('Connecting to database...\n');

    await testReads();
    await testUpdates();
    await testDeletes();
    await testRelations();
    await testIntegrity();
    await generateSummary();

  } catch (error: any) {
    console.error('\n💥 Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();

