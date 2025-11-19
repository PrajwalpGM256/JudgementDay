import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      );
    }

    // Fetch all stats in parallel for better performance
    const [totalUsers, totalMatches, totalPlayers, activeTeams] = await Promise.all([
      prisma.user.count(),
      prisma.match.count(),
      prisma.player.count(),
      prisma.userTeam.count(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalMatches,
      totalPlayers,
      activeTeams,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}

