import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('👥 Checking all users in database...\n');

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        walletBalance: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (users.length === 0) {
      console.log('❌ No users found in database!\n');
      console.log('Run: npx prisma db seed\n');
      return;
    }

    console.log('Current Users in Database:');
    console.log('═'.repeat(100));
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.role})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Wallet: ${user.walletBalance} credits`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
      console.log('─'.repeat(100));
    });
    console.log(`\n✅ Total users: ${users.length}\n`);
    
    console.log('🔑 You can login with any of these accounts:');
    users.forEach((user) => {
      console.log(`   Email: ${user.email} | Password: password123`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Error checking users:', error);
    process.exit(1);
  }
}

checkUsers()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

