/**
 * SportsData.io API Integration
 * Provides detailed player statistics for NFL games
 * Documentation: https://sportsdata.io/developers/api-documentation/nfl
 */

import axios from 'axios';

// Get API key from environment
const API_KEY = process.env.SPORTSDATA_API_KEY || process.env.NEXT_PUBLIC_SPORTSDATA_API_KEY || '';
const BASE_URL = process.env.SPORTSDATA_BASE_URL || 'https://api.sportsdata.io/v3/nfl';

// Debug: Check if API key is loaded
if (!API_KEY) {
  console.warn('⚠️  SPORTSDATA_API_KEY not found in environment variables');
  console.warn('   Please add to .env.local: SPORTSDATA_API_KEY="your-key-here"');
}

// Create axios instance with API key header
const sportsDataAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Ocp-Apim-Subscription-Key': API_KEY,
  },
  timeout: 15000,
});

/**
 * Interfaces for SportsData.io response
 */
interface SportsDataPlayerStat {
  PlayerID: number;
  Name: string;
  Team: string;
  Position: string;
  Number: number;
  
  // Passing stats
  PassingYards: number;
  PassingTouchdowns: number;
  PassingInterceptions: number;
  PassingAttempts: number;
  PassingCompletions: number;
  
  // Rushing stats
  RushingYards: number;
  RushingTouchdowns: number;
  RushingAttempts: number;
  
  // Receiving stats
  ReceivingYards: number;
  ReceivingTouchdowns: number;
  Receptions: number;
  ReceivingTargets: number;
  
  // Fumbles
  FumblesLost: number;
  
  // Kicking stats
  FieldGoalsMade: number;
  FieldGoalsAttempted: number;
  ExtraPointsMade: number;
  
  // Defensive stats (for DEF position)
  Sacks: number;
  Interceptions: number;
  DefensiveTouchdowns: number;
  
  // Fantasy points (pre-calculated by SportsData.io)
  FantasyPoints: number;
  FantasyPointsPPR: number;
}

interface PlayerStatUpdate {
  externalPlayerId: string; // SportsData player ID
  playerName: string;
  teamAbbr: string;
  position: string;
  
  // Stats for our fantasy scoring
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
 * Get current NFL season and week
 * Note: For 2025, we'll use hardcoded values since we know the season
 */
export async function getCurrentSeasonInfo(): Promise<{ season: number; week: number }> {
  try {
    // Try to fetch from API first
    const response = await sportsDataAPI.get('/scores/json/Timeframes/current');
    
    if (response.data && response.data.length > 0) {
      const current = response.data[0];
      return {
        season: current.Season || 2025,
        week: current.Week || 13,
      };
    }
    
    // Fallback to current values
    return {
      season: 2025,
      week: 13, // Current week as of Nov 26, 2025
    };
  } catch (error: any) {
    console.warn('⚠️  Could not fetch current season from API, using fallback');
    // Fallback to current year and estimated week
    const now = new Date();
    const season = now.getFullYear();
    // Estimate week based on date (NFL starts early September)
    const septemberStart = new Date(season, 8, 5); // Sept 5
    const weeksSinceStart = Math.floor((now.getTime() - septemberStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const week = Math.max(1, Math.min(18, weeksSinceStart + 1));
    
    return { season, week };
  }
}

/**
 * Fetch player stats for a specific game by ScoreID
 * ScoreID is SportsData.io's game identifier
 */
export async function fetchPlayerStatsByGame(scoreId: string): Promise<PlayerStatUpdate[]> {
  try {
    console.log(`📊 Fetching player stats for game ${scoreId} from SportsData.io...`);
    
    const response = await sportsDataAPI.get(`/stats/json/PlayerGameStatsByGame/${scoreId}`);
    const players: SportsDataPlayerStat[] = response.data;
    
    console.log(`✅ Fetched stats for ${players.length} players`);
    
    return players.map(player => ({
      externalPlayerId: String(player.PlayerID),
      playerName: player.Name,
      teamAbbr: player.Team,
      position: player.Position,
      
      passingYards: player.PassingYards || 0,
      passingTDs: player.PassingTouchdowns || 0,
      interceptions: player.PassingInterceptions || 0,
      
      rushingYards: player.RushingYards || 0,
      rushingTDs: player.RushingTouchdowns || 0,
      
      receptions: player.Receptions || 0,
      receivingYards: player.ReceivingYards || 0,
      receivingTDs: player.ReceivingTouchdowns || 0,
      
      fumbles: player.FumblesLost || 0,
      
      fgMade: player.FieldGoalsMade || 0,
      fgAttempted: player.FieldGoalsAttempted || 0,
      
      defSacks: player.Sacks || 0,
      defInterceptions: player.Interceptions || 0,
      defTDs: player.DefensiveTouchdowns || 0,
    }));
  } catch (error: any) {
    console.error(`❌ Error fetching player stats for game ${scoreId}:`, error.message);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Fetch scores for a specific week and season
 * Returns ScoreIDs that can be used to fetch player stats
 */
export async function fetchScoresByWeek(season: number, week: number): Promise<any[]> {
  try {
    console.log(`📅 Fetching scores for ${season} Week ${week}...`);
    
    const response = await sportsDataAPI.get(`/scores/json/ScoresByWeek/${season}/${week}`);
    const scores = response.data;
    
    console.log(`✅ Found ${scores.length} games`);
    
    return scores.map((score: any) => ({
      scoreId: score.ScoreID,
      gameKey: score.GameKey,
      season: score.Season,
      week: score.Week,
      homeTeam: score.HomeTeam,
      awayTeam: score.AwayTeam,
      homeScore: score.HomeScore,
      awayScore: score.AwayScore,
      status: score.Status, // 'Scheduled', 'InProgress', 'Final', etc.
      date: score.Date,
    }));
  } catch (error: any) {
    console.error(`❌ Error fetching scores:`, error.message);
    throw error;
  }
}

/**
 * Fetch live/in-progress scores
 */
export async function fetchLiveScores(): Promise<any[]> {
  try {
    console.log('📊 Fetching live scores...');
    
    const response = await sportsDataAPI.get('/scores/json/AreAnyGamesInProgress');
    const gamesInProgress = response.data;
    
    if (!gamesInProgress) {
      console.log('ℹ️  No games currently in progress');
      return [];
    }
    
    // Fetch current week scores
    const currentSeason = await getCurrentSeasonInfo();
    return await fetchScoresByWeek(currentSeason.season, currentSeason.week);
  } catch (error: any) {
    console.error('❌ Error fetching live scores:', error.message);
    throw error;
  }
}

/**
 * Test API connection
 */
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    if (!API_KEY) {
      return {
        success: false,
        message: 'API key not configured. Please set SPORTSDATA_API_KEY in .env.local',
      };
    }
    
    const response = await sportsDataAPI.get('/scores/json/AreAnyGamesInProgress');
    
    return {
      success: true,
      message: `✅ Successfully connected to SportsData.io! Games in progress: ${response.data}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Failed to connect: ${error.message}`,
    };
  }
}

/**
 * Map SportsData.io position to our Position enum
 */
export function mapSportsDataPosition(sdPosition: string): 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' {
  const positionMap: Record<string, 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF'> = {
    'QB': 'QB',
    'RB': 'RB',
    'FB': 'RB',
    'WR': 'WR',
    'TE': 'TE',
    'K': 'K',
    'P': 'K',
    // Defensive positions
    'DEF': 'DEF',
    'DE': 'DEF',
    'DT': 'DEF',
    'LB': 'DEF',
    'CB': 'DEF',
    'S': 'DEF',
    'DB': 'DEF',
  };
  
  return positionMap[sdPosition.toUpperCase()] || 'DEF';
}

// Export types
export type { PlayerStatUpdate, SportsDataPlayerStat };

