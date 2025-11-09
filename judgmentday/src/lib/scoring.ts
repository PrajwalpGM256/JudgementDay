import { PlayerStat } from '@prisma/client';

/**
 * Calculate fantasy points based on player statistics
 * NFL Fantasy Football Standard Scoring Rules:
 * 
 * Passing:
 * - 25 yards = 1 point
 * - TD = 4 points
 * - Interception = -2 points
 * 
 * Rushing/Receiving:
 * - 10 yards = 1 point
 * - TD = 6 points
 * - Reception = 0 points (standard scoring, not PPR)
 * 
 * Fumbles:
 * - Fumble lost = -2 points
 * 
 * Kicking:
 * - FG 0-39 yards = 3 points
 * - FG 40-49 yards = 4 points
 * - FG 50+ yards = 5 points
 * - PAT = 1 point (included in fgMade for simplicity)
 * 
 * Defense:
 * - Sack = 1 point
 * - Interception = 2 points
 * - TD = 6 points
 */

export function calculateFantasyPoints(stats: Partial<PlayerStat>): number {
  let points = 0;

  // Passing points
  if (stats.passingYards) {
    points += Math.floor(stats.passingYards / 25); // 1 point per 25 yards
  }
  if (stats.passingTDs) {
    points += stats.passingTDs * 4; // 4 points per TD
  }
  if (stats.interceptions) {
    points -= stats.interceptions * 2; // -2 points per interception
  }

  // Rushing points
  if (stats.rushingYards) {
    points += Math.floor(stats.rushingYards / 10); // 1 point per 10 yards
  }
  if (stats.rushingTDs) {
    points += stats.rushingTDs * 6; // 6 points per TD
  }

  // Receiving points
  if (stats.receivingYards) {
    points += Math.floor(stats.receivingYards / 10); // 1 point per 10 yards
  }
  if (stats.receivingTDs) {
    points += stats.receivingTDs * 6; // 6 points per TD
  }
  // Note: receptions count is stored but not scored in standard scoring

  // Fumbles
  if (stats.fumbles) {
    points -= stats.fumbles * 2; // -2 points per fumble
  }

  // Kicking points (simplified - assuming average distance)
  if (stats.fgMade) {
    points += stats.fgMade * 3.5; // Average of 3-5 points
  }

  // Defense points
  if (stats.defSacks) {
    points += stats.defSacks * 1; // 1 point per sack
  }
  if (stats.defInterceptions) {
    points += stats.defInterceptions * 2; // 2 points per interception
  }
  if (stats.defTDs) {
    points += stats.defTDs * 6; // 6 points per TD
  }

  return Math.round(points * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate total fantasy points for a user's team based on player stats
 */
export function calculateTeamPoints(playerStats: PlayerStat[]): number {
  return playerStats.reduce((total, stat) => {
    return total + (stat.fantasyPoints || calculateFantasyPoints(stat));
  }, 0);
}

/**
 * Update fantasy points for all player stats in a match
 */
export async function updateMatchFantasyPoints(
  prisma: any,
  matchId: string
): Promise<void> {
  const playerStats = await prisma.playerStat.findMany({
    where: { matchId },
  });

  for (const stat of playerStats) {
    const fantasyPoints = calculateFantasyPoints(stat);
    await prisma.playerStat.update({
      where: { id: stat.id },
      data: { fantasyPoints },
    });
  }
}

/**
 * Update total points and rankings for all user teams in a match
 */
export async function updateUserTeamPoints(
  prisma: any,
  matchId: string
): Promise<void> {
  const userTeams = await prisma.userTeam.findMany({
    where: { matchId },
    include: {
      players: {
        include: {
          player: {
            include: {
              stats: {
                where: { matchId },
              },
            },
          },
        },
      },
    },
  });

  // Calculate points for each team
  const teamsWithPoints = userTeams.map((team) => {
    const totalPoints = team.players.reduce((sum, utp) => {
      const playerStat = utp.player.stats[0];
      return sum + (playerStat?.fantasyPoints || 0);
    }, 0);

    return {
      id: team.id,
      totalPoints: Math.round(totalPoints * 10) / 10,
    };
  });

  // Sort by points to assign ranks
  teamsWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);

  // Update each team with points and rank
  for (let i = 0; i < teamsWithPoints.length; i++) {
    const team = teamsWithPoints[i];
    await prisma.userTeam.update({
      where: { id: team.id },
      data: {
        totalPoints: team.totalPoints,
        rank: i + 1,
      },
    });
  }
}

/**
 * Update user's total points across all their teams
 */
export async function updateUserTotalPoints(
  prisma: any,
  userId: string
): Promise<void> {
  const userTeams = await prisma.userTeam.findMany({
    where: { userId },
    select: { totalPoints: true },
  });

  const totalPoints = userTeams.reduce(
    (sum, team) => sum + team.totalPoints,
    0
  );

  await prisma.user.update({
    where: { id: userId },
    data: { totalPoints: Math.round(totalPoints) },
  });
}

/**
 * Calculate and update leaderboard rankings
 */
export async function updateLeaderboard(prisma: any): Promise<void> {
  const users = await prisma.user.findMany({
    orderBy: { totalPoints: 'desc' },
    select: { id: true },
  });

  // Update rank for each user
  for (let i = 0; i < users.length; i++) {
    await prisma.user.update({
      where: { id: users[i].id },
      data: { rank: i + 1 },
    });
  }
}

