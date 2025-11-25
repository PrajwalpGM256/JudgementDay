import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  updateMatchFantasyPoints,
  updateUserTeamPoints,
  updateUserTotalPoints,
  updateLeaderboard,
  updateLeagueMemberPoints,
  distributeLeaguePrizes,
} from '@/lib/scoring';

// POST /api/scoring/update - Update scoring for a match (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { matchId } = await request.json();

    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      );
    }

    // Step 1: Update fantasy points for all player stats in the match
    await updateMatchFantasyPoints(prisma, matchId);

    // Step 2: Update total points for all user teams in the match
    await updateUserTeamPoints(prisma, matchId);

    // Step 3: Get all users who have teams in this match
    const userTeams = await prisma.userTeam.findMany({
      where: { matchId },
      select: { userId: true },
    });

    const uniqueUserIds = [...new Set(userTeams.map((t) => t.userId))];

    // Step 4: Update total points for each user
    for (const userId of uniqueUserIds) {
      await updateUserTotalPoints(prisma, userId);
    }

    // Step 5: Update global leaderboard rankings
    await updateLeaderboard(prisma);

    // Step 6: Update league member points based on their teams
    await updateLeagueMemberPoints(prisma, matchId);

    // Step 7: Rank league members and distribute prizes
    await distributeLeaguePrizes(prisma, matchId);

    return NextResponse.json({
      message: 'Scoring updated successfully',
      usersUpdated: uniqueUserIds.length,
    });
  } catch (error) {
    console.error('Error updating scoring:', error);
    return NextResponse.json(
      { error: 'Failed to update scoring' },
      { status: 500 }
    );
  }
}

