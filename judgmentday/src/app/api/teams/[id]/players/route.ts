import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// GET /api/teams/[id]/players - Get all players for a specific team
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');

    // First get the team to include in response
    const team = await prisma.team.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        abbreviation: true,
        city: true,
        logoUrl: true,
        conference: true,
        division: true,
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    const where: any = { teamId: id };
    
    if (position) {
      where.position = position;
    }

    const players = await prisma.player.findMany({
      where,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            abbreviation: true,
          },
        },
      },
      orderBy: [
        { position: 'asc' },
        { jerseyNumber: 'asc' },
        { name: 'asc' },
      ],
    });

    // Group players by position
    const playersByPosition = players.reduce((acc, player) => {
      if (!acc[player.position]) {
        acc[player.position] = [];
      }
      acc[player.position].push(player);
      return acc;
    }, {} as Record<string, typeof players>);

    return NextResponse.json({ 
      team,
      players,
      playersByPosition,
      totalPlayers: players.length,
    });
  } catch (error) {
    console.error('Error fetching team players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team players' },
      { status: 500 }
    );
  }
}

