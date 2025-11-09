import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createLeagueSchema = z.object({
  name: z.string().min(3, 'League name must be at least 3 characters'),
  description: z.string().optional(),
  isPrivate: z.boolean().default(true),
  maxMembers: z.number().min(2).max(100).default(20),
  season: z.number(),
  prizePool: z.number().optional().default(0),
});

const joinLeagueSchema = z.object({
  inviteCode: z.string(),
});

// GET /api/leagues - Get user's leagues
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leagues = await prisma.league.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        commissioner: {
          select: {
            id: true,
            username: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                totalPoints: true,
              },
            },
          },
          orderBy: {
            points: 'desc',
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    return NextResponse.json({ leagues });
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leagues' },
      { status: 500 }
    );
  }
}

// POST /api/leagues - Create a new league
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createLeagueSchema.parse(body);

    // Generate unique invite code
    const inviteCode = `${validatedData.name.slice(0, 3).toUpperCase()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const league = await prisma.league.create({
      data: {
        ...validatedData,
        commissionerId: session.user.id,
        inviteCode,
        members: {
          create: {
            userId: session.user.id,
          },
        },
      },
      include: {
        commissioner: {
          select: {
            id: true,
            username: true,
          },
        },
        members: true,
      },
    });

    return NextResponse.json({ league }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating league:', error);
    return NextResponse.json(
      { error: 'Failed to create league' },
      { status: 500 }
    );
  }
}

// POST /api/leagues/join - Join a league with invite code
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { inviteCode } = joinLeagueSchema.parse(body);

    const league = await prisma.league.findUnique({
      where: { inviteCode },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!league) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 404 }
      );
    }

    if (league._count.members >= league.maxMembers) {
      return NextResponse.json(
        { error: 'League is full' },
        { status: 400 }
      );
    }

    // Check if already a member
    const existingMember = await prisma.leagueMember.findUnique({
      where: {
        leagueId_userId: {
          leagueId: league.id,
          userId: session.user.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Already a member of this league' },
        { status: 400 }
      );
    }

    await prisma.leagueMember.create({
      data: {
        leagueId: league.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Successfully joined league' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error joining league:', error);
    return NextResponse.json(
      { error: 'Failed to join league' },
      { status: 500 }
    );
  }
}

