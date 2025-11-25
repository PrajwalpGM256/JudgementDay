import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const prizeDistributionSchema = z.array(
  z.object({
    rank: z.number().int().positive('Rank must be a positive number'),
    amount: z.number().min(0, 'Prize amount must be non-negative'),
  })
);

const createLeagueSchema = z.object({
  name: z.string().min(3, 'League name must be at least 3 characters'),
  description: z.string().optional(),
  matchId: z.string().min(1, 'Match ID is required'),
  isPrivate: z.boolean().default(true),
  maxMembers: z.number().min(2).max(100).default(20),
  entryFee: z.number().min(0, 'Entry fee must be non-negative').default(0),
  basePrizePool: z.number().min(0, 'Base prize pool must be non-negative').default(0),
  prizeDistribution: prizeDistributionSchema.optional(),
}).refine((data) => {
  // Validate prize distribution if provided
  if (data.prizeDistribution && data.prizeDistribution.length > 0) {
    const totalAvailable = (data.entryFee * data.maxMembers) + data.basePrizePool;
    const totalPrizeAmounts = data.prizeDistribution.reduce((sum, prize) => sum + prize.amount, 0);
    
    if (totalPrizeAmounts > totalAvailable) {
      return false;
    }
  }
  return true;
}, {
  message: 'Total prize distribution cannot exceed (entry fee × max members) + base prize pool',
  path: ['prizeDistribution'],
});

const joinLeagueSchema = z.object({
  inviteCode: z.string().optional(),
  leagueId: z.string().optional(),
  userTeamId: z.string().min(1, 'Team selection is required'),
}).refine((data) => data.inviteCode || data.leagueId, {
  message: 'Either inviteCode or leagueId must be provided',
});

// GET /api/leagues - Get user's leagues and public leagues
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'my' or 'public'

    if (type === 'public') {
      // Get all public leagues
      const publicLeagues = await prisma.league.findMany({
        where: {
          isPrivate: false,
        },
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
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Add membership status for each league
      const leaguesWithMembership = publicLeagues.map((league) => {
        const isMember = league.members.some(
          (member) => member.userId === session.user.id
        );
        return {
          ...league,
          isMember,
          canJoin: !isMember && league._count.members < league.maxMembers,
        };
      });

      return NextResponse.json({ leagues: leaguesWithMembership });
    }

    // Default: Get user's leagues (leagues they're members of OR leagues they created as commissioner)
    const userLeagues = await prisma.league.findMany({
      where: {
        OR: [
          {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
          {
            commissionerId: session.user.id,
          },
        ],
      },
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

    // Add membership status and isCommissioner flag for each league
    const leaguesWithStatus = userLeagues.map((league) => {
      const isMember = league.members.some(
        (member) => member.userId === session.user.id
      );
      const isCommissioner = league.commissionerId === session.user.id;
      return {
        ...league,
        isMember,
        isCommissioner,
        canJoin: !isMember && league._count.members < league.maxMembers,
      };
    });

    return NextResponse.json({ leagues: leaguesWithStatus });
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

    // Verify match exists
    const match = await prisma.match.findUnique({
      where: { id: validatedData.matchId },
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Regular users can only create private leagues
    // Admins can create both private and public leagues
    const isAdmin = session.user.role === 'ADMIN';
    const isPrivate = isAdmin ? validatedData.isPrivate : true;

    // Generate unique invite code (always generate one, even for public leagues)
    let inviteCode = `${validatedData.name.slice(0, 3).toUpperCase()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    
    // Ensure uniqueness
    let exists = await prisma.league.findUnique({ where: { inviteCode } });
    while (exists) {
      inviteCode = `${validatedData.name.slice(0, 3).toUpperCase()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      exists = await prisma.league.findUnique({ where: { inviteCode } });
    }

    // Prepare prize distribution - sort by rank and validate uniqueness
    let prizeDistributionData = null;
    if (validatedData.prizeDistribution && validatedData.prizeDistribution.length > 0) {
      // Sort by rank and check for duplicate ranks
      const sortedPrizes = [...validatedData.prizeDistribution].sort((a, b) => a.rank - b.rank);
      const ranks = sortedPrizes.map(p => p.rank);
      const uniqueRanks = new Set(ranks);
      
      if (ranks.length !== uniqueRanks.size) {
        return NextResponse.json(
          { error: 'Prize distribution cannot have duplicate ranks' },
          { status: 400 }
        );
      }

      prizeDistributionData = sortedPrizes;
    }

    // Don't automatically add creator as member - they need to join with team selection
    const createData: any = {
      name: validatedData.name,
      description: validatedData.description,
      matchId: validatedData.matchId,
      isPrivate,
      maxMembers: validatedData.maxMembers,
      entryFee: validatedData.entryFee,
      basePrizePool: validatedData.basePrizePool,
      prizeDistribution: prizeDistributionData,
      commissionerId: session.user.id,
      inviteCode,
    };

    // Create the league
    const league = await prisma.league.create({
      data: createData,
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
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    return NextResponse.json({ league }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError && error.errors && error.errors.length > 0) {
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

// PUT /api/leagues - Join a league (by invite code for private, or by leagueId for public)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = joinLeagueSchema.parse(body);
    
    // Get user to check credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let league;
    
    // Check if joining by leagueId (public league) or inviteCode (private league)
    if (validatedData.leagueId) {
      // Joining public league by ID
      league = await prisma.league.findUnique({
        where: { id: validatedData.leagueId },
        include: {
          match: {
            select: { id: true },
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

      // Only public leagues can be joined by ID
      if (league.isPrivate) {
        return NextResponse.json(
          { error: 'This is a private league. Please use invite code.' },
          { status: 400 }
        );
      }
    } else if (validatedData.inviteCode) {
      // Joining by invite code (private league)
      league = await prisma.league.findUnique({
        where: { inviteCode: validatedData.inviteCode },
        include: {
          match: {
            select: { id: true },
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
    } else {
      return NextResponse.json(
        { error: 'Either leagueId or inviteCode is required' },
        { status: 400 }
      );
    }

    // Check if league is full
    if (league._count.members >= league.maxMembers) {
      return NextResponse.json(
        { error: 'League is full' },
        { status: 400 }
      );
    }

    // Check if user has enough credits
    if (user.credits < league.entryFee) {
      return NextResponse.json(
        { error: 'You do not have enough credits to join this league' },
        { status: 400 }
      );
    }

    // Verify the team belongs to the user and is for the correct match
    const userTeam = await prisma.userTeam.findUnique({
      where: { id: validatedData.userTeamId },
      include: {
        match: {
          select: { id: true },
        },
      },
    });

    if (!userTeam) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    if (userTeam.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'This team does not belong to you' },
        { status: 403 }
      );
    }

    if (userTeam.matchId !== league.matchId) {
      return NextResponse.json(
        { error: 'This team is not for the match associated with this league' },
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

    // Use a transaction to deduct credits and create membership atomically
    await prisma.$transaction(async (tx) => {
      // Deduct entry fee from user credits
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          credits: {
            decrement: league.entryFee,
          },
        },
      });

      // Create league membership with team
      await tx.leagueMember.create({
        data: {
          leagueId: league.id,
          userId: session.user.id,
          userTeamId: validatedData.userTeamId,
          points: Math.round(userTeam.totalPoints), // Use current team points
        },
      });
    });

    return NextResponse.json({ 
      message: 'Successfully joined league', 
      leagueId: league.id,
      creditsRemaining: user.credits - league.entryFee,
    });
  } catch (error) {
    if (error instanceof z.ZodError && error.errors && error.errors.length > 0) {
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

