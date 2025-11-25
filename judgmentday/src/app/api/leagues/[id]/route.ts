import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/leagues/[id] - Get a specific league by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const league = await prisma.league.findUnique({
      where: { id },
      include: {
        commissioner: {
          select: {
            id: true,
            username: true,
          },
        },
        match: {
          select: {
            id: true,
            week: true,
            season: true,
            scheduledAt: true,
            status: true,
            homeTeam: {
              select: {
                id: true,
                name: true,
                abbreviation: true,
              },
            },
            awayTeam: {
              select: {
                id: true,
                name: true,
                abbreviation: true,
              },
            },
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
            userTeam: {
              select: {
                id: true,
                teamName: true,
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

    if (!league) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const isMember = league.members.some(
      (member) => member.userId === session.user.id
    );

    // For private leagues, check if user has access (either member or commissioner)
    if (league.isPrivate && !isMember && league.commissionerId !== session.user.id) {
      return NextResponse.json(
        { error: 'This is a private league. Please use invite code to view.' },
        { status: 403 }
      );
    }

    // Don't show invite code unless user is the commissioner (for private leagues)
    const leagueData = {
      ...league,
      inviteCode: league.isPrivate && league.commissionerId === session.user.id 
        ? league.inviteCode 
        : league.isPrivate 
        ? undefined 
        : undefined, // Public leagues don't need/show invite codes
      isMember,
      canJoin: !isMember && league._count.members < league.maxMembers,
    };

    return NextResponse.json({ league: leagueData });
  } catch (error) {
    console.error('Error fetching league:', error);
    return NextResponse.json(
      { error: 'Failed to fetch league' },
      { status: 500 }
    );
  }
}

