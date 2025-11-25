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
).optional();

const updateLeagueSchema = z.object({
  name: z.string().min(3, 'League name must be at least 3 characters').optional(),
  description: z.string().optional(),
  isPrivate: z.boolean().optional(),
  maxMembers: z.number().min(2).max(100).optional(),
  entryFee: z.number().min(0, 'Entry fee must be non-negative').optional(),
  basePrizePool: z.number().min(0, 'Base prize pool must be non-negative').optional(),
  prizeDistribution: prizeDistributionSchema,
});

// GET /api/leagues/admin - Get all leagues created by the admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      );
    }

    const leagues = await prisma.league.findMany({
      where: {
        commissionerId: session.user.id,
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

    return NextResponse.json({ leagues });
  } catch (error) {
    console.error('Error fetching admin leagues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leagues' },
      { status: 500 }
    );
  }
}

// PATCH /api/leagues/admin - Update a league (admin only, must be commissioner)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { leagueId, ...updateData } = body;

    if (!leagueId) {
      return NextResponse.json(
        { error: 'League ID is required' },
        { status: 400 }
      );
    }

    // Verify the admin is the commissioner of this league
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
    });

    if (!league) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      );
    }

    if (league.commissionerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit leagues you created' },
        { status: 403 }
      );
    }

    // Validate update data
    const validatedData = updateLeagueSchema.parse(updateData);

    // Prepare update data
    const updatePayload: any = {};
    
    if (validatedData.name !== undefined) updatePayload.name = validatedData.name;
    if (validatedData.description !== undefined) updatePayload.description = validatedData.description;
    if (validatedData.isPrivate !== undefined) updatePayload.isPrivate = validatedData.isPrivate;
    if (validatedData.entryFee !== undefined) updatePayload.entryFee = validatedData.entryFee;
    if (validatedData.basePrizePool !== undefined) updatePayload.basePrizePool = validatedData.basePrizePool;

    // If updating maxMembers, check if it's less than current member count
    if (validatedData.maxMembers !== undefined) {
      const currentMemberCount = await prisma.leagueMember.count({
        where: { leagueId },
      });

      if (validatedData.maxMembers < currentMemberCount) {
        return NextResponse.json(
          {
            error: `Cannot set max members to ${validatedData.maxMembers}. League already has ${currentMemberCount} members.`,
          },
          { status: 400 }
        );
      }
      updatePayload.maxMembers = validatedData.maxMembers;
    }

    // Validate prize distribution if provided
    if (validatedData.prizeDistribution !== undefined) {
      const entryFee = validatedData.entryFee ?? league.entryFee;
      const basePrizePool = validatedData.basePrizePool ?? league.basePrizePool;
      const maxMembers = validatedData.maxMembers ?? league.maxMembers;

      if (validatedData.prizeDistribution.length > 0) {
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

        const totalAvailable = (entryFee * maxMembers) + basePrizePool;
        const totalPrizeAmounts = sortedPrizes.reduce((sum, prize) => sum + prize.amount, 0);
        
        if (totalPrizeAmounts > totalAvailable) {
          return NextResponse.json(
            { error: `Total prize distribution (${totalPrizeAmounts}) cannot exceed available prize pool (${totalAvailable})` },
            { status: 400 }
          );
        }

        updatePayload.prizeDistribution = sortedPrizes;
      } else {
        updatePayload.prizeDistribution = null;
      }
    }

    // Update the league
    const updatedLeague = await prisma.league.update({
      where: { id: leagueId },
      data: updatePayload,
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

    return NextResponse.json({ league: updatedLeague });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating league:', error);
    return NextResponse.json(
      { error: 'Failed to update league' },
      { status: 500 }
    );
  }
}

// DELETE /api/leagues/admin - Delete a league (admin only, must be commissioner)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');

    if (!leagueId) {
      return NextResponse.json(
        { error: 'League ID is required' },
        { status: 400 }
      );
    }

    // Verify the admin is the commissioner of this league
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
    });

    if (!league) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      );
    }

    if (league.commissionerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete leagues you created' },
        { status: 403 }
      );
    }

    // Delete the league (cascade will handle members)
    await prisma.league.delete({
      where: { id: leagueId },
    });

    return NextResponse.json({ message: 'League deleted successfully' });
  } catch (error) {
    console.error('Error deleting league:', error);
    return NextResponse.json(
      { error: 'Failed to delete league' },
      { status: 500 }
    );
  }
}

