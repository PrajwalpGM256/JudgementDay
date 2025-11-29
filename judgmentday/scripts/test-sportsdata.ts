/**
 * Test SportsData.io API connection
 * Run with: npx tsx scripts/test-sportsdata.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { testConnection, getCurrentSeasonInfo, fetchScoresByWeek } from '../src/lib/sportsdata-api';

async function runTests() {
  console.log('🧪 Testing SportsData.io API Connection...\n');
  console.log('='.repeat(60));
  
  // Test 1: API Connection
  console.log('\n📡 Test 1: API Connection');
  console.log('-'.repeat(60));
  const connectionTest = await testConnection();
  console.log(connectionTest.message);
  
  if (!connectionTest.success) {
    console.error('\n❌ API connection failed. Please check your API key.');
    process.exit(1);
  }
  
  // Test 2: Get Current Season Info
  console.log('\n📅 Test 2: Current Season Info');
  console.log('-'.repeat(60));
  try {
    const seasonInfo = await getCurrentSeasonInfo();
    console.log(`✅ Current Season: ${seasonInfo.season}`);
    console.log(`✅ Current Week: ${seasonInfo.week}`);
  } catch (error: any) {
    console.error(`❌ Failed to get season info: ${error.message}`);
  }
  
  // Test 3: Fetch Scores for Current Week
  console.log('\n🏈 Test 3: Fetch Scores');
  console.log('-'.repeat(60));
  try {
    const seasonInfo = await getCurrentSeasonInfo();
    const scores = await fetchScoresByWeek(seasonInfo.season, seasonInfo.week);
    
    console.log(`✅ Found ${scores.length} games for Week ${seasonInfo.week}`);
    
    if (scores.length > 0) {
      console.log('\nFirst game:');
      const game = scores[0];
      console.log(`  ${game.awayTeam} @ ${game.homeTeam}`);
      console.log(`  Score: ${game.awayScore || 0} - ${game.homeScore || 0}`);
      console.log(`  Status: ${game.status}`);
      console.log(`  ScoreID: ${game.scoreId}`);
    }
  } catch (error: any) {
    console.error(`❌ Failed to fetch scores: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ API Test Complete!');
  console.log('='.repeat(60));
  console.log('\n💡 Next steps:');
  console.log('   1. Run: npx tsx scripts/sync-player-stats.ts [season] [week]');
  console.log('   2. This will fetch and store player stats in your database\n');
}

runTests().catch(console.error);

