import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// GET /api/players - Get all players with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const teamId = searchParams.get('teamId');
    const maxPrice = searchParams.get('maxPrice');
    const status = searchParams.get('status') || 'ACTIVE';

    const where: any = {
      status,
    };

    if (position) {
      where.position = position;
    }

    if (teamId) {
      where.teamId = teamId;
    }

    if (maxPrice) {
      where.price = {
        lte: parseFloat(maxPrice),
      };
    }

    const players = await prisma.player.findMany({
      where,
      include: {
        team: true,
      },
      orderBy: [
        { avgPoints: 'desc' },
        { price: 'desc' },
      ],
    });

    return NextResponse.json({ players });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

