import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createTeamSchema = z.object({
  matchId: z.string(),
  teamName: z.string().optional(),
  players: z.array(z.object({
    playerId: z.string(),
    position: z.enum(['QB', 'RB', 'WR', 'TE', 'K', 'DEF']),
  })),
});

// GET /api/user-teams - Get user's teams
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');

    const where: any = {
      userId: session.user.id,
    };

    if (matchId) {
      where.matchId = matchId;
    }

    const userTeams = await prisma.userTeam.findMany({
      where,
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
        players: {
          include: {
            player: {
              include: {
                team: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ userTeams });
  } catch (error) {
    console.error('Error fetching user teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user teams' },
      { status: 500 }
    );
  }
}

// POST /api/user-teams - Create a new team
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTeamSchema.parse(body);

    // Validate team composition
    const positionCounts = validatedData.players.reduce((acc, p) => {
      acc[p.position] = (acc[p.position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Check position requirements: 1 QB, 2 RBs, 2 WRs, 1 TE, 1 K, 1 DEF
    const requiredPositions = { QB: 1, RB: 2, WR: 2, TE: 1, K: 1, DEF: 1 };
    for (const [position, count] of Object.entries(requiredPositions)) {
      if ((positionCounts[position] || 0) !== count) {
        return NextResponse.json(
          { error: `Team must have exactly ${count} ${position}(s)` },
          { status: 400 }
        );
      }
    }

    // Check if team already exists for this match
    const existingTeam = await prisma.userTeam.findUnique({
      where: {
        userId_matchId: {
          userId: session.user.id,
          matchId: validatedData.matchId,
        },
      },
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: 'You already have a team for this match' },
        { status: 400 }
      );
    }

    // Fetch player details to calculate cost
    const playerIds = validatedData.players.map(p => p.playerId);
    const players = await prisma.player.findMany({
      where: {
        id: { in: playerIds },
      },
    });

    const totalCost = players.reduce((sum, player) => sum + player.price, 0);

    // Check budget (75 credits)
    if (totalCost > 75) {
      return NextResponse.json(
        { error: `Total cost (${totalCost}) exceeds budget of 75 credits` },
        { status: 400 }
      );
    }

    // Check max 4 players from same team
    const teamCounts = players.reduce((acc, player) => {
      acc[player.teamId] = (acc[player.teamId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maxFromOneTeam = Math.max(...Object.values(teamCounts));
    if (maxFromOneTeam > 4) {
      return NextResponse.json(
        { error: 'Cannot have more than 4 players from the same team' },
        { status: 400 }
      );
    }

    // Create user team with players
    const userTeam = await prisma.userTeam.create({
      data: {
        userId: session.user.id,
        matchId: validatedData.matchId,
        teamName: validatedData.teamName,
        totalCost,
        players: {
          create: validatedData.players.map(p => ({
            playerId: p.playerId,
            position: p.position,
          })),
        },
      },
      include: {
        players: {
          include: {
            player: {
              include: {
                team: true,
              },
            },
          },
        },
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
    });

    return NextResponse.json({ userTeam }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating user team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}

