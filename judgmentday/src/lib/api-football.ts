/**
 * API-FOOTBALL Integration via RapidAPI
 * 
 * This module integrates with API-FOOTBALL from RapidAPI to fetch:
 * - Live NFL scores and match data
 * - Player statistics
 * - Team information
 * - Real-time game updates
 * 
 * API Documentation: https://rapidapi.com/api-sports/api/api-football
 */

import axios from 'axios';

const API_KEY = process.env.RAPIDAPI_KEY || '';
const API_HOST = process.env.RAPIDAPI_HOST || 'api-football-v1.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}/v3`;

// Create axios instance with RapidAPI headers
const apiFootball = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': API_HOST,
  },
});

interface PlayerStatUpdate {
  playerId: string;
  passingYards?: number;
  passingTDs?: number;
  interceptions?: number;
  rushingYards?: number;
  rushingTDs?: number;
  receptions?: number;
  receivingYards?: number;
  receivingTDs?: number;
  fumbles?: number;
  fgMade?: number;
  fgAttempted?: number;
  defSacks?: number;
  defInterceptions?: number;
  defTDs?: number;
}

interface MatchUpdate {
  matchId: string;
  homeScore: number;
  awayScore: number;
  status: 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'FINAL';
  quarter?: string;
  timeRemaining?: string;
}

/**
 * Fetch live NFL fixtures/matches
 */
export async function fetchLiveFixtures(season: number, week?: number): Promise<any[]> {
  try {
    const response = await apiFootball.get('/fixtures', {
      params: {
        league: 1, // NFL league ID (check API-FOOTBALL docs for correct ID)
        season: season,
        ...(week && { round: `Week ${week}` }),
      },
    });

    return response.data.response || [];
  } catch (error: any) {
    console.error('Error fetching fixtures:', error.message);
    throw new Error(`Failed to fetch fixtures: ${error.message}`);
  }
}

/**
 * Fetch player statistics for a specific match
 */
export async function fetchPlayerStatsForMatch(fixtureId: string): Promise<PlayerStatUpdate[]> {
  try {
    const response = await apiFootball.get('/fixtures/players', {
      params: {
        fixture: fixtureId,
      },
    });

    const data = response.data.response || [];
    
    // Transform API-FOOTBALL data to our format
    const playerStats: PlayerStatUpdate[] = [];

    data.forEach((team: any) => {
      team.players.forEach((playerData: any) => {
        const player = playerData.player;
        const stats = playerData.statistics[0];

        // Map API-FOOTBALL stats to our fantasy scoring format
        playerStats.push({
          playerId: String(player.id),
          passingYards: stats.games?.passes?.total || 0,
          passingTDs: stats.games?.passes?.touchdowns || 0,
          interceptions: stats.games?.passes?.interceptions || 0,
          rushingYards: stats.games?.rushes?.yards || 0,
          rushingTDs: stats.games?.rushes?.touchdowns || 0,
          receivingYards: stats.games?.receiving?.yards || 0,
          receivingTDs: stats.games?.receiving?.touchdowns || 0,
          receptions: stats.games?.receiving?.receptions || 0,
          fumbles: stats.games?.fumbles || 0,
        });
      });
    });

    return playerStats;
  } catch (error: any) {
    console.error('Error fetching player stats:', error.message);
    throw new Error(`Failed to fetch player stats: ${error.message}`);
  }
}

/**
 * Fetch live scores for current week
 */
export async function fetchLiveScores(season: number, week: number): Promise<MatchUpdate[]> {
  try {
    const fixtures = await fetchLiveFixtures(season, week);

    return fixtures.map((fixture: any) => ({
      matchId: String(fixture.fixture.id),
      homeScore: fixture.goals.home || 0,
      awayScore: fixture.goals.away || 0,
      status: mapFixtureStatus(fixture.fixture.status.short),
      quarter: fixture.fixture.status.elapsed ? `Q${Math.ceil(fixture.fixture.status.elapsed / 15)}` : undefined,
      timeRemaining: fixture.fixture.status.elapsed ? `${15 - (fixture.fixture.status.elapsed % 15)}:00` : undefined,
    }));
  } catch (error: any) {
    console.error('Error fetching live scores:', error.message);
    throw new Error(`Failed to fetch live scores: ${error.message}`);
  }
}

/**
 * Map API-FOOTBALL status codes to our status enum
 */
function mapFixtureStatus(apiStatus: string): 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'FINAL' {
  const statusMap: Record<string, 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'FINAL'> = {
    'NS': 'SCHEDULED',     // Not Started
    'TBD': 'SCHEDULED',    // Time To Be Defined
    '1H': 'LIVE',          // First Half
    'HT': 'HALFTIME',      // Halftime
    '2H': 'LIVE',          // Second Half
    'ET': 'LIVE',          // Extra Time
    'P': 'LIVE',           // Penalty
    'FT': 'FINAL',         // Full Time
    'AET': 'FINAL',        // After Extra Time
    'PEN': 'FINAL',        // Penalty Shootout
    'PST': 'SCHEDULED',    // Postponed
    'CANC': 'SCHEDULED',   // Cancelled
    'ABD': 'FINAL',        // Abandoned
    'AWD': 'FINAL',        // Awarded
    'WO': 'FINAL',         // WalkOver
  };

  return statusMap[apiStatus] || 'SCHEDULED';
}

/**
 * Sync match data from API-FOOTBALL to our database
 */
export async function syncMatchFromAPI(
  prisma: any,
  apiFixtureId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Fetch fixture details
    const response = await apiFootball.get('/fixtures', {
      params: { id: apiFixtureId },
    });

    const fixture = response.data.response[0];
    if (!fixture) {
      throw new Error('Fixture not found');
    }

    // Find or create match in database
    const match = await prisma.match.upsert({
      where: { id: apiFixtureId },
      update: {
        homeScore: fixture.goals.home,
        awayScore: fixture.goals.away,
        status: mapFixtureStatus(fixture.fixture.status.short),
        updatedAt: new Date(),
      },
      create: {
        id: apiFixtureId,
        week: 1, // Extract from fixture.league.round
        season: fixture.league.season,
        homeTeamId: String(fixture.teams.home.id),
        awayTeamId: String(fixture.teams.away.id),
        homeScore: fixture.goals.home,
        awayScore: fixture.goals.away,
        scheduledAt: new Date(fixture.fixture.date),
        status: mapFixtureStatus(fixture.fixture.status.short),
      },
    });

    // Fetch and update player stats
    const playerStats = await fetchPlayerStatsForMatch(apiFixtureId);
    
    for (const stat of playerStats) {
      await prisma.playerStat.upsert({
        where: {
          playerId_matchId: {
            playerId: stat.playerId,
            matchId: match.id,
          },
        },
        update: stat,
        create: {
          playerId: stat.playerId,
          matchId: match.id,
          ...stat,
        },
      });
    }

    // Calculate fantasy points
    const { updateMatchFantasyPoints, updateUserTeamPoints } = await import('./scoring');
    await updateMatchFantasyPoints(prisma, match.id);
    await updateUserTeamPoints(prisma, match.id);

    return {
      success: true,
      message: `Successfully synced match ${apiFixtureId}`,
    };
  } catch (error: any) {
    console.error('Error syncing match:', error);
    return {
      success: false,
      message: error.message || 'Failed to sync match',
    };
  }
}

/**
 * Test API connection
 */
export async function testAPIConnection(): Promise<{ success: boolean; message: string }> {
  try {
    if (!API_KEY) {
      throw new Error('RAPIDAPI_KEY environment variable is not set');
    }

    const response = await apiFootball.get('/status');
    
    return {
      success: true,
      message: `API connection successful! Requests remaining: ${response.data.response?.requests?.remaining || 'N/A'}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to connect to API-FOOTBALL',
    };
  }
}

/**
 * Get available NFL leagues/seasons
 */
export async function getAvailableSeasons(): Promise<any[]> {
  try {
    const response = await apiFootball.get('/leagues', {
      params: {
        name: 'NFL', // or the correct league name for American Football
      },
    });

    return response.data.response || [];
  } catch (error: any) {
    console.error('Error fetching leagues:', error.message);
    return [];
  }
}

// Export types
export type { PlayerStatUpdate, MatchUpdate };

