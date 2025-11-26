/**
 * ESPN API Integration
 * Uses ESPN's unofficial JSON API endpoints
 * More stable than HTML scraping but still unofficial
 */

import axios from 'axios';

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';

interface ESPNTeam {
  id: string;
  uid: string;
  slug: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  name: string;
  nickname: string;
  location: string;
  logos?: Array<{
    href: string;
    width: number;
    height: number;
  }>;
}

interface ESPNPlayer {
  id: string;
  uid: string;
  guid: string;
  firstName: string;
  lastName: string;
  displayName: string;
  jersey?: string;
  position?: {
    abbreviation: string;
    displayName: string;
  };
  headshot?: {
    href: string;
    alt?: string;
  };
  status?: {
    name: string;
    type: string;
  };
}

interface TeamData {
  id: string;
  name: string;
  abbreviation: string;
  city: string;
  logoUrl?: string;
  conference: string;
  division: string;
}

interface PlayerData {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  position: string;
  jerseyNumber?: number;
  imageUrl?: string;
  status: string;
}

/**
 * Fetch all NFL teams from ESPN API
 */
export async function fetchESPNTeams(): Promise<TeamData[]> {
  try {
    console.log('🏈 Fetching NFL teams from ESPN API...');
    
    const response = await axios.get(`${ESPN_API_BASE}/teams`, {
      timeout: 10000,
    });

    if (!response.data?.sports?.[0]?.leagues?.[0]?.teams) {
      throw new Error('Invalid response structure from ESPN API');
    }

    const teams: ESPNTeam[] = response.data.sports[0].leagues[0].teams.map(
      (t: any) => t.team
    );

    console.log(`✅ Fetched ${teams.length} teams from ESPN`);

    return teams.map((team) => ({
      id: team.id,
      name: team.displayName || team.name,
      abbreviation: team.abbreviation,
      city: team.location || team.name.replace(team.nickname, '').trim(),
      logoUrl: team.logos?.[0]?.href || undefined,
      // ESPN doesn't provide conference/division in teams endpoint
      // We'll need to set these manually or fetch from another source
      conference: '', // Will be populated from team details
      division: '',
    }));
  } catch (error: any) {
    console.error('❌ Error fetching ESPN teams:', error.message);
    throw new Error(`Failed to fetch teams from ESPN: ${error.message}`);
  }
}

/**
 * Fetch detailed team info including conference and division
 */
export async function fetchESPNTeamDetails(teamId: string): Promise<{
  conference: string;
  division: string;
}> {
  try {
    const response = await axios.get(`${ESPN_API_BASE}/teams/${teamId}`, {
      timeout: 10000,
    });

    const team = response.data?.team;
    if (!team) {
      throw new Error('Team not found');
    }

    // Extract conference and division from groups
    const conference = team.groups?.standingsGroups?.find((g: any) => 
      g.abbreviation === 'AFC' || g.abbreviation === 'NFC'
    )?.abbreviation || 'NFC';

    const division = team.groups?.standingsGroups?.find((g: any) => 
      ['North', 'South', 'East', 'West'].some(d => g.name?.includes(d))
    )?.shortName || 'North';

    return { conference, division };
  } catch (error: any) {
    console.warn(`⚠️ Could not fetch details for team ${teamId}:`, error.message);
    // Return defaults if API fails
    return { conference: 'NFC', division: 'North' };
  }
}

/**
 * Fetch roster for a specific team
 */
export async function fetchESPNTeamRoster(teamId: string): Promise<PlayerData[]> {
  try {
    console.log(`🏃 Fetching roster for team ${teamId}...`);
    
    const response = await axios.get(`${ESPN_API_BASE}/teams/${teamId}/roster`, {
      timeout: 10000,
    });

    // ESPN response structure: { athletes: [ { items: [...] } ] }
    if (!response.data?.athletes) {
      throw new Error('Invalid roster response from ESPN API');
    }

    // Flatten the roster structure
    const allPlayers: ESPNPlayer[] = [];
    
    // ESPN groups athletes by position groups (offense, defense, special teams)
    response.data.athletes.forEach((group: any) => {
      if (group.items && Array.isArray(group.items)) {
        allPlayers.push(...group.items);
      }
    });

    console.log(`✅ Fetched ${allPlayers.length} players for team ${teamId}`);

    return allPlayers.map((player: any) => ({
      id: player.id,
      name: player.displayName || player.fullName || `${player.firstName} ${player.lastName}`,
      firstName: player.firstName || '',
      lastName: player.lastName || '',
      position: player.position?.abbreviation || 'QB',
      jerseyNumber: player.jersey ? parseInt(player.jersey) : undefined,
      imageUrl: player.headshot?.href || undefined,
      status: player.status?.type === 'active' ? 'ACTIVE' : 'INACTIVE',
    }));
  } catch (error: any) {
    console.error(`❌ Error fetching roster for team ${teamId}:`, error.message);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error(`Failed to fetch roster: ${error.message}`);
  }
}

/**
 * Map ESPN position to our Position enum
 */
export function mapESPNPosition(espnPosition: string): 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' {
  const positionMap: Record<string, 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF'> = {
    'QB': 'QB',
    'RB': 'RB',
    'FB': 'RB', // Fullback -> Running Back
    'WR': 'WR',
    'TE': 'TE',
    'K': 'K',
    'P': 'K', // Punter -> Kicker category
    // Defensive positions -> DEF (we use team defense)
    'DE': 'DEF',
    'DT': 'DEF',
    'LB': 'DEF',
    'MLB': 'DEF',
    'OLB': 'DEF',
    'CB': 'DEF',
    'S': 'DEF',
    'SS': 'DEF',
    'FS': 'DEF',
    'DB': 'DEF',
  };

  return positionMap[espnPosition.toUpperCase()] || 'DEF';
}

/**
 * Static conference and division mapping for NFL teams
 * (Since ESPN API doesn't always provide this reliably)
 */
export const NFL_TEAM_CONFERENCE_MAP: Record<string, { conference: string; division: string }> = {
  // AFC East
  'BUF': { conference: 'AFC', division: 'East' },
  'MIA': { conference: 'AFC', division: 'East' },
  'NE': { conference: 'AFC', division: 'East' },
  'NYJ': { conference: 'AFC', division: 'East' },
  
  // AFC North
  'BAL': { conference: 'AFC', division: 'North' },
  'CIN': { conference: 'AFC', division: 'North' },
  'CLE': { conference: 'AFC', division: 'North' },
  'PIT': { conference: 'AFC', division: 'North' },
  
  // AFC South
  'HOU': { conference: 'AFC', division: 'South' },
  'IND': { conference: 'AFC', division: 'South' },
  'JAX': { conference: 'AFC', division: 'South' },
  'TEN': { conference: 'AFC', division: 'South' },
  
  // AFC West
  'DEN': { conference: 'AFC', division: 'West' },
  'KC': { conference: 'AFC', division: 'West' },
  'LV': { conference: 'AFC', division: 'West' },
  'LAC': { conference: 'AFC', division: 'West' },
  
  // NFC East
  'DAL': { conference: 'NFC', division: 'East' },
  'NYG': { conference: 'NFC', division: 'East' },
  'PHI': { conference: 'NFC', division: 'East' },
  'WAS': { conference: 'NFC', division: 'East' },
  
  // NFC North
  'CHI': { conference: 'NFC', division: 'North' },
  'DET': { conference: 'NFC', division: 'North' },
  'GB': { conference: 'NFC', division: 'North' },
  'MIN': { conference: 'NFC', division: 'North' },
  
  // NFC South
  'ATL': { conference: 'NFC', division: 'South' },
  'CAR': { conference: 'NFC', division: 'South' },
  'NO': { conference: 'NFC', division: 'South' },
  'TB': { conference: 'NFC', division: 'South' },
  
  // NFC West
  'ARI': { conference: 'NFC', division: 'West' },
  'LAR': { conference: 'NFC', division: 'West' },
  'SF': { conference: 'NFC', division: 'West' },
  'SEA': { conference: 'NFC', division: 'West' },
};

/**
 * Get conference and division for a team by abbreviation
 */
export function getTeamConferenceDivision(abbreviation: string): { conference: string; division: string } {
  return NFL_TEAM_CONFERENCE_MAP[abbreviation.toUpperCase()] || { 
    conference: 'NFC', 
    division: 'North' 
  };
}

/**
 * ESPN Team ID mapping (abbreviation -> ESPN ID)
 * These are ESPN's internal team IDs used in their API
 */
export const ESPN_TEAM_ID_MAP: Record<string, string> = {
  'ARI': '22',  // Arizona Cardinals
  'ATL': '1',   // Atlanta Falcons
  'BAL': '33',  // Baltimore Ravens
  'BUF': '2',   // Buffalo Bills
  'CAR': '29',  // Carolina Panthers
  'CHI': '3',   // Chicago Bears
  'CIN': '4',   // Cincinnati Bengals
  'CLE': '5',   // Cleveland Browns
  'DAL': '6',   // Dallas Cowboys
  'DEN': '7',   // Denver Broncos
  'DET': '8',   // Detroit Lions
  'GB': '9',    // Green Bay Packers
  'HOU': '34',  // Houston Texans
  'IND': '11',  // Indianapolis Colts
  'JAX': '30',  // Jacksonville Jaguars
  'KC': '12',   // Kansas City Chiefs
  'LV': '13',   // Las Vegas Raiders
  'LAC': '24',  // Los Angeles Chargers
  'LAR': '14',  // Los Angeles Rams
  'MIA': '15',  // Miami Dolphins
  'MIN': '16',  // Minnesota Vikings
  'NE': '17',   // New England Patriots
  'NO': '18',   // New Orleans Saints
  'NYG': '19',  // New York Giants
  'NYJ': '20',  // New York Jets
  'PHI': '21',  // Philadelphia Eagles
  'PIT': '23',  // Pittsburgh Steelers
  'SF': '25',   // San Francisco 49ers
  'SEA': '26',  // Seattle Seahawks
  'TB': '27',   // Tampa Bay Buccaneers
  'TEN': '10',  // Tennessee Titans
  'WAS': '28',  // Washington Commanders
};

/**
 * Get ESPN team ID from abbreviation
 */
export function getESPNTeamId(abbreviation: string): string | null {
  return ESPN_TEAM_ID_MAP[abbreviation.toUpperCase()] || null;
}

/**
 * Interfaces for Match/Game data
 */
interface ESPNGame {
  id: string;
  uid: string;
  date: string;
  name: string;
  shortName: string;
  season: {
    year: number;
    type: number;
  };
  week: {
    number: number;
  };
  status: {
    type: {
      id: string;
      name: string;
      state: string;
      completed: boolean;
      description: string;
      detail: string;
      shortDetail: string;
    };
  };
  competitions: Array<{
    id: string;
    uid: string;
    date: string;
    attendance: number;
    status: {
      clock: number;
      displayClock: string;
      period: number;
      type: {
        id: string;
        name: string;
        state: string;
        completed: boolean;
      };
    };
    competitors: Array<{
      id: string;
      uid: string;
      type: string;
      order: number;
      homeAway: string;
      team: {
        id: string;
        abbreviation: string;
        displayName: string;
      };
      score: string;
    }>;
  }>;
}

interface MatchData {
  espnId: string;
  week: number;
  season: number;
  homeTeamAbbr: string;
  awayTeamAbbr: string;
  homeScore?: number;
  awayScore?: number;
  scheduledAt: Date;
  status: 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'FINAL' | 'POSTPONED' | 'CANCELLED';
  quarter?: string;
  timeRemaining?: string;
}

/**
 * Fetch NFL schedule for a specific week and season
 */
export async function fetchESPNSchedule(season: number, week: number): Promise<MatchData[]> {
  try {
    console.log(`🏈 Fetching NFL schedule for ${season} Week ${week}...`);
    
    const response = await axios.get(`${ESPN_API_BASE}/scoreboard`, {
      params: {
        dates: season, // ESPN uses season year
        seasontype: 2, // 2 = regular season, 1 = preseason, 3 = postseason
        week: week,
      },
      timeout: 10000,
    });

    if (!response.data?.events) {
      console.log('No events found in response');
      return [];
    }

    const games: ESPNGame[] = response.data.events;
    console.log(`✅ Found ${games.length} games for Week ${week}`);

    return games.map((game) => {
      const competition = game.competitions[0];
      const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
      const awayTeam = competition.competitors.find(c => c.homeAway === 'away');

      return {
        espnId: game.id,
        week: game.week.number,
        season: game.season.year,
        homeTeamAbbr: homeTeam?.team.abbreviation || '',
        awayTeamAbbr: awayTeam?.team.abbreviation || '',
        homeScore: homeTeam?.score ? parseInt(homeTeam.score) : undefined,
        awayScore: awayTeam?.score ? parseInt(awayTeam.score) : undefined,
        scheduledAt: new Date(game.date),
        status: mapESPNGameStatus(game.status.type.name),
        quarter: competition.status.period > 0 ? `${competition.status.period}` : undefined,
        timeRemaining: competition.status.displayClock !== '0:00' ? competition.status.displayClock : undefined,
      };
    });
  } catch (error: any) {
    console.error('❌ Error fetching ESPN schedule:', error.message);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error(`Failed to fetch schedule: ${error.message}`);
  }
}

/**
 * Fetch current NFL scoreboard (all games happening now or today)
 */
export async function fetchESPNScoreboard(): Promise<MatchData[]> {
  try {
    console.log('🏈 Fetching current NFL scoreboard...');
    
    const response = await axios.get(`${ESPN_API_BASE}/scoreboard`, {
      timeout: 10000,
    });

    if (!response.data?.events) {
      return [];
    }

    const games: ESPNGame[] = response.data.events;
    console.log(`✅ Found ${games.length} games on scoreboard`);

    return games.map((game) => {
      const competition = game.competitions[0];
      const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
      const awayTeam = competition.competitors.find(c => c.homeAway === 'away');

      return {
        espnId: game.id,
        week: game.week.number,
        season: game.season.year,
        homeTeamAbbr: homeTeam?.team.abbreviation || '',
        awayTeamAbbr: awayTeam?.team.abbreviation || '',
        homeScore: homeTeam?.score ? parseInt(homeTeam.score) : undefined,
        awayScore: awayTeam?.score ? parseInt(awayTeam.score) : undefined,
        scheduledAt: new Date(game.date),
        status: mapESPNGameStatus(game.status.type.name),
        quarter: competition.status.period > 0 ? `${competition.status.period}` : undefined,
        timeRemaining: competition.status.displayClock !== '0:00' ? competition.status.displayClock : undefined,
      };
    });
  } catch (error: any) {
    console.error('❌ Error fetching ESPN scoreboard:', error.message);
    throw new Error(`Failed to fetch scoreboard: ${error.message}`);
  }
}

/**
 * Fetch entire season schedule
 */
export async function fetchESPNSeasonSchedule(season: number): Promise<MatchData[]> {
  const allMatches: MatchData[] = [];
  
  // NFL regular season is typically 18 weeks
  for (let week = 1; week <= 18; week++) {
    try {
      const weekMatches = await fetchESPNSchedule(season, week);
      allMatches.push(...weekMatches);
      
      // Add a small delay between requests to be respectful to ESPN's servers
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to fetch week ${week}:`, error);
    }
  }
  
  return allMatches;
}

/**
 * Map ESPN game status to our MatchStatus enum
 */
function mapESPNGameStatus(espnStatus: string): 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'FINAL' | 'POSTPONED' | 'CANCELLED' {
  const statusMap: Record<string, 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'FINAL' | 'POSTPONED' | 'CANCELLED'> = {
    'STATUS_SCHEDULED': 'SCHEDULED',
    'STATUS_IN_PROGRESS': 'LIVE',
    'STATUS_HALFTIME': 'HALFTIME',
    'STATUS_END_PERIOD': 'LIVE',
    'STATUS_FINAL': 'FINAL',
    'STATUS_FINAL_OVERTIME': 'FINAL',
    'STATUS_POSTPONED': 'POSTPONED',
    'STATUS_CANCELED': 'CANCELLED',
    'STATUS_CANCELLED': 'CANCELLED',
    'STATUS_DELAYED': 'SCHEDULED',
    'STATUS_SUSPENDED': 'SCHEDULED',
  };

  return statusMap[espnStatus] || 'SCHEDULED';
}

// Export types
export type { TeamData, PlayerData, ESPNTeam, ESPNPlayer, MatchData, ESPNGame };

