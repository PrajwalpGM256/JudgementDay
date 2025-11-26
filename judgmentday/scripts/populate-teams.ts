/**
 * Script to populate NFL teams from ESPN API
 * Run with: npx tsx scripts/populate-teams.ts
 */

import { PrismaClient } from '@prisma/client';
import { 
  fetchESPNTeams, 
  getTeamConferenceDivision,
  type TeamData 
} from '../src/lib/espn-api';

const prisma = new PrismaClient();

async function populateTeams() {
  try {
    console.log('🚀 Starting team population from ESPN API...\n');

    // Fetch teams from ESPN
    const espnTeams = await fetchESPNTeams();

    console.log(`\n📊 Fetched ${espnTeams.length} teams from ESPN\n`);

    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    // Process each team
    for (const espnTeam of espnTeams) {
      try {
        // Get conference and division
        const { conference, division } = getTeamConferenceDivision(espnTeam.abbreviation);

        const teamData = {
          name: espnTeam.name,
          abbreviation: espnTeam.abbreviation,
          city: espnTeam.city,
          logoUrl: espnTeam.logoUrl,
          conference,
          division,
        };

        // Upsert team (create or update)
        const team = await prisma.team.upsert({
          where: { abbreviation: espnTeam.abbreviation },
          update: teamData,
          create: teamData,
        });

        if (team.createdAt.getTime() === team.updatedAt.getTime()) {
          createdCount++;
          console.log(`✅ Created: ${team.name} (${team.abbreviation})`);
        } else {
          updatedCount++;
          console.log(`🔄 Updated: ${team.name} (${team.abbreviation})`);
        }

        console.log(`   📍 ${conference} ${division}`);
        if (team.logoUrl) {
          console.log(`   🖼️  Logo: ${team.logoUrl.substring(0, 50)}...`);
        }
        console.log('');

      } catch (error: any) {
        errorCount++;
        console.error(`❌ Error processing ${espnTeam.name}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Created: ${createdCount} teams`);
    console.log(`🔄 Updated: ${updatedCount} teams`);
    console.log(`❌ Errors: ${errorCount} teams`);
    console.log(`📊 Total: ${espnTeams.length} teams processed`);
    console.log('='.repeat(60) + '\n');

    // Display all teams in database
    const allTeams = await prisma.team.findMany({
      orderBy: [
        { conference: 'asc' },
        { division: 'asc' },
        { name: 'asc' },
      ],
    });

    console.log('\n📋 ALL TEAMS IN DATABASE:\n');
    
    let currentConference = '';
    let currentDivision = '';
    
    allTeams.forEach((team) => {
      if (team.conference !== currentConference) {
        currentConference = team.conference;
        console.log(`\n🏆 ${currentConference} CONFERENCE`);
        console.log('-'.repeat(50));
      }
      
      if (team.division !== currentDivision) {
        currentDivision = team.division;
        console.log(`\n  ${currentDivision} Division:`);
      }
      
      console.log(`  • ${team.name} (${team.abbreviation})`);
    });

    console.log('\n✨ Team population completed successfully!\n');

  } catch (error: any) {
    console.error('\n💥 Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
populateTeams();

