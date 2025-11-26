import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// GET /api/teams - Get all teams with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conference = searchParams.get('conference');
    const division = searchParams.get('division');

    const where: any = {};
    
    if (conference) {
      where.conference = conference;
    }
    
    if (division) {
      where.division = division;
    }

    const teams = await prisma.team.findMany({
      where,
      include: {
        _count: {
          select: {
            players: true,
          },
        },
      },
      orderBy: [
        { conference: 'asc' },
        { division: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

