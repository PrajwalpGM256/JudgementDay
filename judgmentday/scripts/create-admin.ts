import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('🔧 Creating admin user...\n');

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@judgmentday.com' },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email: admin@judgmentday.com');
      console.log('🔑 Password: admin123\n');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@judgmentday.com',
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
        walletBalance: 75,
        totalPoints: 0,
      },
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('📋 Login Details:');
    console.log('   Email: admin@judgmentday.com');
    console.log('   Password: admin123\n');
    console.log('🚀 Next Steps:');
    console.log('   1. Start your app: npm run dev');
    console.log('   2. Login at: http://localhost:3000/auth/login');
    console.log('   3. Go to admin panel: http://localhost:3000/admin');
    console.log('   4. Add your RAPIDAPI_KEY to .env');
    console.log('   5. Use "Sync Sports Data" to fetch real NFL data!\n');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


