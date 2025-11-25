import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const viewLeagueByCodeSchema = z.object({
  inviteCode: z.string(),
});

// POST /api/leagues/view - View a private league by invite code (without joining)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { inviteCode } = viewLeagueByCodeSchema.parse(body);

    const league = await prisma.league.findUnique({
      where: { inviteCode },
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
        { error: 'Invalid invite code' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const isMember = league.members.some(
      (member) => member.userId === session.user.id
    );

    // Include the inviteCode in response since user already provided it to view the league
    // They need it to join the league
    const leagueData = {
      ...league,
      inviteCode: league.inviteCode, // Include invite code so user can join
      isMember,
      canJoin: !isMember && league._count.members < league.maxMembers,
    };

    return NextResponse.json({ league: leagueData });
  } catch (error) {
    if (error instanceof z.ZodError && error.errors && error.errors.length > 0) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error viewing league:', error);
    return NextResponse.json(
      { error: 'Failed to view league' },
      { status: 500 }
    );
  }
}

