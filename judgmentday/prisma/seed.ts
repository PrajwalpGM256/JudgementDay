import { PrismaClient, Position, PlayerStatus, MatchStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const NFL_TEAMS = [
  // AFC East
  { name: 'Buffalo Bills', abbreviation: 'BUF', city: 'Buffalo', conference: 'AFC', division: 'East' },
  { name: 'Miami Dolphins', abbreviation: 'MIA', city: 'Miami', conference: 'AFC', division: 'East' },
  { name: 'New England Patriots', abbreviation: 'NE', city: 'New England', conference: 'AFC', division: 'East' },
  { name: 'New York Jets', abbreviation: 'NYJ', city: 'New York', conference: 'AFC', division: 'East' },
  
  // AFC North
  { name: 'Baltimore Ravens', abbreviation: 'BAL', city: 'Baltimore', conference: 'AFC', division: 'North' },
  { name: 'Cincinnati Bengals', abbreviation: 'CIN', city: 'Cincinnati', conference: 'AFC', division: 'North' },
  { name: 'Cleveland Browns', abbreviation: 'CLE', city: 'Cleveland', conference: 'AFC', division: 'North' },
  { name: 'Pittsburgh Steelers', abbreviation: 'PIT', city: 'Pittsburgh', conference: 'AFC', division: 'North' },
  
  // AFC South
  { name: 'Houston Texans', abbreviation: 'HOU', city: 'Houston', conference: 'AFC', division: 'South' },
  { name: 'Indianapolis Colts', abbreviation: 'IND', city: 'Indianapolis', conference: 'AFC', division: 'South' },
  { name: 'Jacksonville Jaguars', abbreviation: 'JAX', city: 'Jacksonville', conference: 'AFC', division: 'South' },
  { name: 'Tennessee Titans', abbreviation: 'TEN', city: 'Tennessee', conference: 'AFC', division: 'South' },
  
  // AFC West
  { name: 'Denver Broncos', abbreviation: 'DEN', city: 'Denver', conference: 'AFC', division: 'West' },
  { name: 'Kansas City Chiefs', abbreviation: 'KC', city: 'Kansas City', conference: 'AFC', division: 'West' },
  { name: 'Las Vegas Raiders', abbreviation: 'LV', city: 'Las Vegas', conference: 'AFC', division: 'West' },
  { name: 'Los Angeles Chargers', abbreviation: 'LAC', city: 'Los Angeles', conference: 'AFC', division: 'West' },
  
  // NFC East
  { name: 'Dallas Cowboys', abbreviation: 'DAL', city: 'Dallas', conference: 'NFC', division: 'East' },
  { name: 'New York Giants', abbreviation: 'NYG', city: 'New York', conference: 'NFC', division: 'East' },
  { name: 'Philadelphia Eagles', abbreviation: 'PHI', city: 'Philadelphia', conference: 'NFC', division: 'East' },
  { name: 'Washington Commanders', abbreviation: 'WAS', city: 'Washington', conference: 'NFC', division: 'East' },
  
  // NFC North
  { name: 'Chicago Bears', abbreviation: 'CHI', city: 'Chicago', conference: 'NFC', division: 'North' },
  { name: 'Detroit Lions', abbreviation: 'DET', city: 'Detroit', conference: 'NFC', division: 'North' },
  { name: 'Green Bay Packers', abbreviation: 'GB', city: 'Green Bay', conference: 'NFC', division: 'North' },
  { name: 'Minnesota Vikings', abbreviation: 'MIN', city: 'Minnesota', conference: 'NFC', division: 'North' },
  
  // NFC South
  { name: 'Atlanta Falcons', abbreviation: 'ATL', city: 'Atlanta', conference: 'NFC', division: 'South' },
  { name: 'Carolina Panthers', abbreviation: 'CAR', city: 'Carolina', conference: 'NFC', division: 'South' },
  { name: 'New Orleans Saints', abbreviation: 'NO', city: 'New Orleans', conference: 'NFC', division: 'South' },
  { name: 'Tampa Bay Buccaneers', abbreviation: 'TB', city: 'Tampa Bay', conference: 'NFC', division: 'South' },
  
  // NFC West
  { name: 'Arizona Cardinals', abbreviation: 'ARI', city: 'Arizona', conference: 'NFC', division: 'West' },
  { name: 'Los Angeles Rams', abbreviation: 'LAR', city: 'Los Angeles', conference: 'NFC', division: 'West' },
  { name: 'San Francisco 49ers', abbreviation: 'SF', city: 'San Francisco', conference: 'NFC', division: 'West' },
  { name: 'Seattle Seahawks', abbreviation: 'SEA', city: 'Seattle', conference: 'NFC', division: 'West' },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.userTeamPlayer.deleteMany();
  await prisma.userTeam.deleteMany();
  await prisma.pick.deleteMany();
  await prisma.playerStat.deleteMany();
  await prisma.leagueMember.deleteMany();
  await prisma.league.deleteMany();
  await prisma.match.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users
  console.log('👤 Creating demo users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      username: 'JohnDoe',
      password: hashedPassword,
      role: 'USER',
      walletBalance: 75,
      credits: 1000,
      totalPoints: 0,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      username: 'JaneSmith',
      password: hashedPassword,
      role: 'USER',
      walletBalance: 75,
      credits: 1000,
      totalPoints: 0,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'AdminUser',
      password: hashedPassword,
      role: 'ADMIN',
      walletBalance: 75,
      credits: 1000,
      totalPoints: 0,
    },
  });

  console.log(`✅ Created ${[user1, user2, adminUser].length} users`);

  // Create NFL teams
  console.log('🏈 Creating NFL teams...');
  const teams = await Promise.all(
    NFL_TEAMS.map((team) =>
      prisma.team.create({
        data: team,
      })
    )
  );
  console.log(`✅ Created ${teams.length} teams`);

  // Create sample players for some teams
  console.log('👥 Creating sample players...');
  
  const samplePlayers = [
    // Kansas City Chiefs
    { name: 'Patrick Mahomes', position: Position.QB, teamName: 'Kansas City Chiefs', price: 12.5, jerseyNumber: 15, avgPoints: 25.5 },
    { name: 'Travis Kelce', position: Position.TE, teamName: 'Kansas City Chiefs', price: 9.5, jerseyNumber: 87, avgPoints: 15.2 },
    { name: 'Isiah Pacheco', position: Position.RB, teamName: 'Kansas City Chiefs', price: 7.0, jerseyNumber: 10, avgPoints: 12.8 },
    
    // Buffalo Bills
    { name: 'Josh Allen', position: Position.QB, teamName: 'Buffalo Bills', price: 12.0, jerseyNumber: 17, avgPoints: 24.8 },
    { name: 'Stefon Diggs', position: Position.WR, teamName: 'Buffalo Bills', price: 8.5, jerseyNumber: 14, avgPoints: 14.5 },
    { name: 'James Cook', position: Position.RB, teamName: 'Buffalo Bills', price: 6.5, jerseyNumber: 4, avgPoints: 11.2 },
    
    // San Francisco 49ers
    { name: 'Brock Purdy', position: Position.QB, teamName: 'San Francisco 49ers', price: 10.5, jerseyNumber: 13, avgPoints: 22.3 },
    { name: 'Christian McCaffrey', position: Position.RB, teamName: 'San Francisco 49ers', price: 11.0, jerseyNumber: 23, avgPoints: 20.5 },
    { name: 'Deebo Samuel', position: Position.WR, teamName: 'San Francisco 49ers', price: 8.0, jerseyNumber: 19, avgPoints: 13.8 },
    { name: 'George Kittle', position: Position.TE, teamName: 'San Francisco 49ers', price: 8.5, jerseyNumber: 85, avgPoints: 13.2 },
    
    // Dallas Cowboys
    { name: 'Dak Prescott', position: Position.QB, teamName: 'Dallas Cowboys', price: 11.0, jerseyNumber: 4, avgPoints: 23.5 },
    { name: 'CeeDee Lamb', position: Position.WR, teamName: 'Dallas Cowboys', price: 9.0, jerseyNumber: 88, avgPoints: 16.8 },
    { name: 'Tony Pollard', position: Position.RB, teamName: 'Dallas Cowboys', price: 7.5, jerseyNumber: 20, avgPoints: 13.5 },
    
    // Philadelphia Eagles
    { name: 'Jalen Hurts', position: Position.QB, teamName: 'Philadelphia Eagles', price: 11.5, jerseyNumber: 1, avgPoints: 24.2 },
    { name: 'A.J. Brown', position: Position.WR, teamName: 'Philadelphia Eagles', price: 9.5, jerseyNumber: 11, avgPoints: 17.2 },
    { name: 'DeVonta Smith', position: Position.WR, teamName: 'Philadelphia Eagles', price: 8.0, jerseyNumber: 6, avgPoints: 14.1 },
    
    // Miami Dolphins
    { name: 'Tua Tagovailoa', position: Position.QB, teamName: 'Miami Dolphins', price: 10.0, jerseyNumber: 1, avgPoints: 21.8 },
    { name: 'Tyreek Hill', position: Position.WR, teamName: 'Miami Dolphins', price: 10.0, jerseyNumber: 10, avgPoints: 18.5 },
    { name: 'Raheem Mostert', position: Position.RB, teamName: 'Miami Dolphins', price: 6.0, jerseyNumber: 31, avgPoints: 11.8 },
    
    // Detroit Lions
    { name: 'Jared Goff', position: Position.QB, teamName: 'Detroit Lions', price: 9.5, jerseyNumber: 16, avgPoints: 20.5 },
    { name: 'Amon-Ra St. Brown', position: Position.WR, teamName: 'Detroit Lions', price: 8.5, jerseyNumber: 14, avgPoints: 15.2 },
    { name: 'David Montgomery', position: Position.RB, teamName: 'Detroit Lions', price: 7.0, jerseyNumber: 5, avgPoints: 12.5 },
    
    // Generic Kickers
    { name: 'Justin Tucker', position: Position.K, teamName: 'Baltimore Ravens', price: 5.0, jerseyNumber: 9, avgPoints: 9.5 },
    { name: 'Harrison Butker', position: Position.K, teamName: 'Kansas City Chiefs', price: 4.5, jerseyNumber: 7, avgPoints: 9.2 },
    
    // Generic Defenses
    { name: '49ers Defense', position: Position.DEF, teamName: 'San Francisco 49ers', price: 6.5, jerseyNumber: 0, avgPoints: 10.8 },
    { name: 'Bills Defense', position: Position.DEF, teamName: 'Buffalo Bills', price: 6.0, jerseyNumber: 0, avgPoints: 10.2 },
  ];

  const players = [];
  for (const playerData of samplePlayers) {
    const team = teams.find(t => t.name === playerData.teamName);
    if (team) {
      const player = await prisma.player.create({
        data: {
          name: playerData.name,
          position: playerData.position,
          teamId: team.id,
          price: playerData.price,
          jerseyNumber: playerData.jerseyNumber,
          avgPoints: playerData.avgPoints,
          status: PlayerStatus.ACTIVE,
        },
      });
      players.push(player);
    }
  }
  console.log(`✅ Created ${players.length} players`);

  // Create sample matches for Week 11 (2025 season)
  console.log('📅 Creating sample matches...');
  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
  nextSunday.setHours(13, 0, 0, 0); // 1:00 PM

  const matchPairings = [
    ['Kansas City Chiefs', 'Buffalo Bills'],
    ['San Francisco 49ers', 'Dallas Cowboys'],
    ['Philadelphia Eagles', 'Miami Dolphins'],
    ['Detroit Lions', 'Green Bay Packers'],
    ['Baltimore Ravens', 'Pittsburgh Steelers'],
    ['Los Angeles Rams', 'Seattle Seahawks'],
  ];

  const matches = [];
  for (let i = 0; i < matchPairings.length; i++) {
    const [homeName, awayName] = matchPairings[i];
    const homeTeam = teams.find(t => t.name === homeName);
    const awayTeam = teams.find(t => t.name === awayName);
    
    if (homeTeam && awayTeam) {
      const matchTime = new Date(nextSunday);
      matchTime.setHours(13 + Math.floor(i / 2) * 3); // Stagger times
      
      const match = await prisma.match.create({
        data: {
          week: 11,
          season: 2025,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          scheduledAt: matchTime,
          status: MatchStatus.SCHEDULED,
        },
      });
      matches.push(match);
    }
  }
  console.log(`✅ Created ${matches.length} matches`);

  // Create a sample league
  console.log('🏆 Creating sample leagues...');
  const league1 = await prisma.league.create({
    data: {
      name: 'Office League',
      description: 'Fantasy football league for office colleagues',
      commissionerId: user1.id,
      inviteCode: 'OFFICE2025',
      isPrivate: true,
      maxMembers: 12,
      season: 2025,
      prizePool: 500,
    },
  });

  await prisma.leagueMember.createMany({
    data: [
      { leagueId: league1.id, userId: user1.id, points: 0 },
      { leagueId: league1.id, userId: user2.id, points: 0 },
    ],
  });

  console.log(`✅ Created league with ${2} members`);

  console.log('✨ Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - ${teams.length} NFL teams`);
  console.log(`   - ${players.length} players`);
  console.log(`   - ${matches.length} matches`);
  console.log(`   - 3 users (john@example.com, jane@example.com, admin@example.com)`);
  console.log(`   - Password for all users: password123`);
  console.log(`   - 1 league with invite code: OFFICE2025`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

