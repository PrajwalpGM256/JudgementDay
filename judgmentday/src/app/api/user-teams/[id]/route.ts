import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/user-teams/[id] - Get detailed user team with player stats
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userTeam = await prisma.userTeam.findUnique({
      where: {
        id: params.id,
      },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
        players: {
          include: {
            player: true,
          },
        },
      },
    });

    if (!userTeam) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user owns this team
    if (userTeam.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Enrich data with stats from the match (using correct matchId)
    const enrichedPlayers = await Promise.all(
      userTeam.players.map(async (utp) => {
        // Get stats for this player in this specific match
        const playerStats = await prisma.playerStat.findFirst({
          where: {
            playerId: utp.playerId,
            matchId: userTeam.matchId, // ✅ Use userTeam.matchId, not params.id!
          },
        });

        // Also include player team info
        const playerWithTeam = await prisma.player.findUnique({
          where: { id: utp.playerId },
          include: { team: true },
        });

        return {
          ...utp,
          player: playerWithTeam,
          stats: playerStats,
        };
      })
    );

    // Calculate total fantasy points from all players
    const calculatedTotalPoints = enrichedPlayers.reduce((total, player) => {
      return total + (player.stats?.fantasyPoints || 0);
    }, 0);

    // Update the totalPoints in database if it's different
    if (userTeam.totalPoints !== calculatedTotalPoints) {
      await prisma.userTeam.update({
        where: { id: userTeam.id },
        data: { totalPoints: calculatedTotalPoints },
      });
    }

    return NextResponse.json({
      userTeam: {
        ...userTeam,
        totalPoints: calculatedTotalPoints, // ✅ Return calculated total
        players: enrichedPlayers,
      },
    });
  } catch (error) {
    console.error('Error fetching user team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team details' },
      { status: 500 }
    );
  }
}

