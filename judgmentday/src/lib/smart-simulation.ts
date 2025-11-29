/**
 * Smart Player Stats Simulation System
 * Generates realistic player statistics based on:
 * - Position (QB, RB, WR, TE, K, DEF)
 * - Team performance (winning/losing)
 * - Random variance for realism
 * - NFL statistical averages
 */

interface SimulatedStats {
  passingYards: number;
  passingTDs: number;
  interceptions: number;
  rushingYards: number;
  rushingTDs: number;
  receptions: number;
  receivingYards: number;
  receivingTDs: number;
  fumbles: number;
  fgMade: number;
  fgAttempted: number;
  defSacks: number;
  defInterceptions: number;
  defTDs: number;
}

/**
 * Generate random number in range with optional bias
 */
function randomInRange(min: number, max: number, bias: number = 0): number {
  const base = Math.random() * (max - min) + min;
  return Math.max(0, Math.round(base * (1 + bias)));
}

/**
 * Calculate team performance bonus based on score differential
 */
function getTeamPerformanceBonus(teamScore: number, opponentScore: number): number {
  const differential = teamScore - opponentScore;
  
  if (differential > 20) return 0.25;      // Blowout win: +25%
  if (differential > 10) return 0.15;      // Solid win: +15%
  if (differential > 0) return 0.05;       // Close win: +5%
  if (differential > -10) return -0.05;    // Close loss: -5%
  if (differential > -20) return -0.15;    // Bad loss: -15%
  return -0.25;                             // Blowout loss: -25%
}

/**
 * Generate realistic stats for a Quarterback
 */
function generateQBStats(isWinningTeam: boolean, performanceBonus: number): SimulatedStats {
  const bonus = performanceBonus;
  
  return {
    passingYards: randomInRange(180, 350, bonus),
    passingTDs: randomInRange(1, 4, bonus),
    interceptions: randomInRange(0, 2, -bonus), // Fewer INTs if winning
    rushingYards: randomInRange(0, 35, bonus / 2),
    rushingTDs: randomInRange(0, 1, bonus / 2),
    receptions: 0,
    receivingYards: 0,
    receivingTDs: 0,
    fumbles: Math.random() < 0.1 ? 1 : 0, // 10% chance of fumble
    fgMade: 0,
    fgAttempted: 0,
    defSacks: 0,
    defInterceptions: 0,
    defTDs: 0,
  };
}

/**
 * Generate realistic stats for a Running Back
 */
function generateRBStats(isWinningTeam: boolean, performanceBonus: number): SimulatedStats {
  const bonus = performanceBonus;
  const isStarterRB = Math.random() > 0.5; // 50% chance of being lead back
  
  return {
    passingYards: 0,
    passingTDs: 0,
    interceptions: 0,
    rushingYards: isStarterRB 
      ? randomInRange(60, 140, bonus)
      : randomInRange(20, 70, bonus),
    rushingTDs: randomInRange(0, 2, bonus),
    receptions: randomInRange(2, 6, bonus / 2),
    receivingYards: randomInRange(10, 50, bonus / 2),
    receivingTDs: Math.random() < 0.15 ? 1 : 0, // 15% chance
    fumbles: Math.random() < 0.08 ? 1 : 0, // 8% chance of fumble
    fgMade: 0,
    fgAttempted: 0,
    defSacks: 0,
    defInterceptions: 0,
    defTDs: 0,
  };
}

/**
 * Generate realistic stats for a Wide Receiver
 */
function generateWRStats(isWinningTeam: boolean, performanceBonus: number): SimulatedStats {
  const bonus = performanceBonus;
  const isWR1 = Math.random() > 0.6; // 40% chance of being WR1
  
  return {
    passingYards: 0,
    passingTDs: 0,
    interceptions: 0,
    rushingYards: Math.random() < 0.2 ? randomInRange(5, 25) : 0, // 20% chance of rush
    rushingTDs: 0,
    receptions: isWR1 
      ? randomInRange(5, 10, bonus)
      : randomInRange(2, 6, bonus),
    receivingYards: isWR1
      ? randomInRange(60, 130, bonus)
      : randomInRange(25, 80, bonus),
    receivingTDs: randomInRange(0, 2, bonus),
    fumbles: Math.random() < 0.05 ? 1 : 0, // 5% chance
    fgMade: 0,
    fgAttempted: 0,
    defSacks: 0,
    defInterceptions: 0,
    defTDs: 0,
  };
}

/**
 * Generate realistic stats for a Tight End
 */
function generateTEStats(isWinningTeam: boolean, performanceBonus: number): SimulatedStats {
  const bonus = performanceBonus;
  
  return {
    passingYards: 0,
    passingTDs: 0,
    interceptions: 0,
    rushingYards: 0,
    rushingTDs: 0,
    receptions: randomInRange(3, 8, bonus),
    receivingYards: randomInRange(30, 90, bonus),
    receivingTDs: randomInRange(0, 1, bonus),
    fumbles: Math.random() < 0.03 ? 1 : 0, // 3% chance
    fgMade: 0,
    fgAttempted: 0,
    defSacks: 0,
    defInterceptions: 0,
    defTDs: 0,
  };
}

/**
 * Generate realistic stats for a Kicker
 */
function generateKStats(isWinningTeam: boolean, performanceBonus: number): SimulatedStats {
  const bonus = performanceBonus;
  const attempts = randomInRange(2, 5);
  const made = Math.min(attempts, randomInRange(1, 4, bonus));
  
  return {
    passingYards: 0,
    passingTDs: 0,
    interceptions: 0,
    rushingYards: 0,
    rushingTDs: 0,
    receptions: 0,
    receivingYards: 0,
    receivingTDs: 0,
    fumbles: 0,
    fgMade: made,
    fgAttempted: attempts,
    defSacks: 0,
    defInterceptions: 0,
    defTDs: 0,
  };
}

/**
 * Generate realistic stats for Defense
 * Note: In our system, DEF represents the entire team defense
 */
function generateDEFStats(isWinningTeam: boolean, performanceBonus: number): SimulatedStats {
  const bonus = performanceBonus;
  
  return {
    passingYards: 0,
    passingTDs: 0,
    interceptions: 0,
    rushingYards: 0,
    rushingTDs: 0,
    receptions: 0,
    receivingYards: 0,
    receivingTDs: 0,
    fumbles: 0,
    fgMade: 0,
    fgAttempted: 0,
    defSacks: randomInRange(2, 6, bonus),
    defInterceptions: randomInRange(0, 2, bonus),
    defTDs: Math.random() < (isWinningTeam ? 0.15 : 0.05) ? 1 : 0, // 15% if winning, 5% if losing
  };
}

/**
 * Generate realistic stats for a player based on their position
 */
export function generatePlayerStats(
  position: string,
  teamScore: number,
  opponentScore: number
): SimulatedStats {
  const isWinningTeam = teamScore > opponentScore;
  const performanceBonus = getTeamPerformanceBonus(teamScore, opponentScore);
  
  switch (position) {
    case 'QB':
      return generateQBStats(isWinningTeam, performanceBonus);
    case 'RB':
      return generateRBStats(isWinningTeam, performanceBonus);
    case 'WR':
      return generateWRStats(isWinningTeam, performanceBonus);
    case 'TE':
      return generateTEStats(isWinningTeam, performanceBonus);
    case 'K':
      return generateKStats(isWinningTeam, performanceBonus);
    case 'DEF':
      return generateDEFStats(isWinningTeam, performanceBonus);
    default:
      return generateWRStats(isWinningTeam, performanceBonus);
  }
}

/**
 * Generate stats for all players in a match
 * This ensures variety - not all QBs score the same
 */
export function generateMatchStats(
  players: Array<{ position: string; teamAbbr: string }>,
  homeTeamAbbr: string,
  awayTeamAbbr: string,
  homeScore: number,
  awayScore: number
): Map<number, SimulatedStats> {
  const playerStats = new Map<number, SimulatedStats>();
  
  players.forEach((player, index) => {
    const teamScore = player.teamAbbr === homeTeamAbbr ? homeScore : awayScore;
    const opponentScore = player.teamAbbr === homeTeamAbbr ? awayScore : homeScore;
    
    const stats = generatePlayerStats(player.position, teamScore, opponentScore);
    playerStats.set(index, stats);
  });
  
  return playerStats;
}

/**
 * Add realistic variance to base stats
 * Makes each simulation unique
 */
export function addVariance(value: number, variancePercent: number = 0.2): number {
  const variance = value * variancePercent;
  const adjustment = (Math.random() - 0.5) * 2 * variance;
  return Math.max(0, Math.round(value + adjustment));
}

export type { SimulatedStats };

