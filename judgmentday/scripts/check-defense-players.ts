import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDefensePlayers() {
  try {
    console.log('🛡️  Checking Defense Players...\n');

    // Get all DEF players with team defense naming pattern
    const defensePlayers = await prisma.player.findMany({
      where: {
        position: 'DEF',
        name: {
          contains: 'Defense',
        },
      },
      include: {
        team: {
          select: {
            name: true,
            abbreviation: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log(`Found ${defensePlayers.length} team defense players:\n`);
    console.log('='.repeat(80));

    defensePlayers.forEach((player, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${player.name.padEnd(35)} | ${player.team.abbreviation.padEnd(4)} | $${player.price.toFixed(1)}`);
    });

    console.log('='.repeat(80));
    console.log(`\n✅ All ${defensePlayers.length} defenses available for team building!\n`);

    // Show sample matches where these can be used
    console.log('📅 Sample matches you can test:\n');
    
    const matches = await prisma.match.findMany({
      where: {
        status: 'FINAL',
        season: 2025,
      },
      include: {
        homeTeam: { select: { abbreviation: true } },
        awayTeam: { select: { abbreviation: true } },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
      take: 5,
    });

    matches.forEach((match, index) => {
      console.log(`${index + 1}. Week ${match.week}: ${match.awayTeam.abbreviation} @ ${match.homeTeam.abbreviation} (${match.awayScore} - ${match.homeScore})`);
    });

    console.log('\n✨ Ready to test!\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDefensePlayers();

