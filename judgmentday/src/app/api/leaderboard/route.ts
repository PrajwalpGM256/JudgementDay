import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// GET /api/leaderboard - Get global or match-specific leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');
    const leagueId = searchParams.get('leagueId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (matchId) {
      // Get leaderboard for a specific match
      const userTeams = await prisma.userTeam.findMany({
        where: { matchId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: [
          { totalPoints: 'desc' },
          { createdAt: 'asc' },
        ],
        take: limit,
      });

      return NextResponse.json({
        leaderboard: userTeams.map((team, index) => ({
          rank: team.rank || index + 1,
          userId: team.user.id,
          username: team.user.username,
          avatarUrl: team.user.avatarUrl,
          teamName: team.teamName,
          points: team.totalPoints,
        })),
      });
    } else if (leagueId) {
      // Get leaderboard for a specific league
      const leagueMembers = await prisma.leagueMember.findMany({
        where: { leagueId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              totalPoints: true,
            },
          },
        },
        orderBy: [
          { points: 'desc' },
          { joinedAt: 'asc' },
        ],
        take: limit,
      });

      return NextResponse.json({
        leaderboard: leagueMembers.map((member, index) => ({
          rank: member.rank || index + 1,
          userId: member.user.id,
          username: member.user.username,
          avatarUrl: member.user.avatarUrl,
          points: member.points,
          totalPoints: member.user.totalPoints,
        })),
      });
    } else {
      // Get global leaderboard
      const users = await prisma.user.findMany({
        where: {
          totalPoints: {
            gt: 0,
          },
        },
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          totalPoints: true,
          rank: true,
        },
        orderBy: [
          { totalPoints: 'desc' },
          { createdAt: 'asc' },
        ],
        take: limit,
      });

      return NextResponse.json({
        leaderboard: users.map((user, index) => ({
          rank: user.rank || index + 1,
          userId: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
          points: user.totalPoints,
        })),
      });
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

