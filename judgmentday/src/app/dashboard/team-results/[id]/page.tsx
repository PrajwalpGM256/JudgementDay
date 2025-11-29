'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { Trophy, ArrowLeft, User, TrendingUp, Award } from 'lucide-react';

interface PlayerStats {
  id: string;
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
  fantasyPoints: number;
}

interface Player {
  id: string;
  name: string;
  position: string;
  team: {
    abbreviation: string;
    name: string;
  };
  price: number;
  imageUrl: string | null;
}

interface UserTeamPlayer {
  id: string;
  playerId: string;
  position: string;
  player: Player;
  stats: PlayerStats | null;
}

interface Match {
  id: string;
  week: number;
  season: number;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: {
    name: string;
    abbreviation: string;
  };
  awayTeam: {
    name: string;
    abbreviation: string;
  };
}

interface UserTeam {
  id: string;
  teamName: string | null;
  totalCost: number;
  totalPoints: number;
  matchId: string;
  match: Match;
  players: UserTeamPlayer[];
}

export default function TeamResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<UserTeam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamDetails();
  }, [params.id]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user-teams/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch team');
      }
      const data = await response.json();
      setTeam(data.userTeam);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatStat = (value: number) => {
    return value > 0 ? `+${value}` : value === 0 ? '0' : value.toString();
  };

  const getStatDisplay = (player: UserTeamPlayer) => {
    if (!player.stats) {
      return <span className="text-gray-500 italic">No stats available</span>;
    }

    const stats = player.stats;
    const items: string[] = [];

    if (stats.passingYards > 0) items.push(`${stats.passingYards} pass yds, ${stats.passingTDs} TDs`);
    if (stats.interceptions > 0) items.push(`${stats.interceptions} INT`);
    if (stats.rushingYards > 0) items.push(`${stats.rushingYards} rush yds, ${stats.rushingTDs} TDs`);
    if (stats.receptions > 0) items.push(`${stats.receptions} rec, ${stats.receivingYards} yds, ${stats.receivingTDs} TDs`);
    if (stats.fgMade > 0) items.push(`${stats.fgMade}/${stats.fgAttempted} FG`);
    if (stats.defSacks > 0) items.push(`${stats.defSacks} sacks`);
    if (stats.defInterceptions > 0) items.push(`${stats.defInterceptions} INT`);
    if (stats.defTDs > 0) items.push(`${stats.defTDs} def TD`);
    if (stats.fumbles > 0) items.push(`${stats.fumbles} fumbles`);

    return (
      <div className="text-sm text-gray-400 space-y-1">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div key={idx}>• {item}</div>
          ))
        ) : (
          <span className="italic">Minimal activity</span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-400 border-r-transparent"></div>
            <p className="text-gray-300 mt-4">Loading team results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Navbar />
        <div className="container mx-auto px-6 py-20 text-center">
          <p className="text-gray-300 text-xl">Team not found</p>
          <button
            onClick={() => router.push('/dashboard/matches')}
            className="mt-4 px-6 py-2 bg-amber-400 text-slate-900 rounded-lg font-semibold"
          >
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  const hasStats = team.players.some(p => p.stats !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Navbar />

      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 py-6">
        <div className="container mx-auto px-6">
          <button
            onClick={() => router.push('/dashboard/matches')}
            className="flex items-center space-x-2 text-gray-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Matches</span>
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">
            {team.teamName || 'Your Team'}
          </h1>
          <p className="text-gray-300">
            {team.match.awayTeam.abbreviation} @ {team.match.homeTeam.abbreviation} • 
            Week {team.match.week}, {team.match.season}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Match Score */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-gray-300 mb-2">{team.match.awayTeam.name}</p>
              <p className="text-5xl font-bold text-white">{team.match.awayScore ?? '-'}</p>
            </div>
            <div className="text-4xl font-bold text-gray-500 mx-8">@</div>
            <div className="text-center flex-1">
              <p className="text-gray-300 mb-2">{team.match.homeTeam.name}</p>
              <p className="text-5xl font-bold text-white">{team.match.homeScore ?? '-'}</p>
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Points</p>
                <p className="text-3xl font-bold text-amber-400">{team.totalPoints.toFixed(1)}</p>
              </div>
              <Trophy className="h-12 w-12 text-amber-400/50" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Team Cost</p>
                <p className="text-3xl font-bold text-white">{team.totalCost}</p>
                <p className="text-xs text-gray-500">/ 75 credits</p>
              </div>
              <User className="h-12 w-12 text-gray-400/50" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Players</p>
                <p className="text-3xl font-bold text-white">{team.players.length}</p>
                <p className="text-xs text-gray-500">8 positions</p>
              </div>
              <Award className="h-12 w-12 text-gray-400/50" />
            </div>
          </div>
        </div>

        {!hasStats && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8">
            <p className="text-yellow-400 text-sm">
              ⚠️ Player stats are not available yet. Stats will be calculated after the match is completed.
            </p>
          </div>
        )}

        {/* Player Details */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-400/20 to-orange-500/20 border-b border-white/10 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-amber-400" />
              Player Performance
            </h2>
          </div>

          <div className="divide-y divide-white/10">
            {team.players
              .sort((a, b) => (b.stats?.fantasyPoints || 0) - (a.stats?.fantasyPoints || 0))
              .map((playerEntry) => (
              <div
                key={playerEntry.id}
                className="p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Player Image */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      {playerEntry.player.imageUrl ? (
                        <img
                          src={playerEntry.player.imageUrl}
                          alt={playerEntry.player.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <User className="h-8 w-8 text-white" />
                      )}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-semibold text-lg">
                          {playerEntry.player.name}
                        </h3>
                        <span className="px-2 py-0.5 bg-white/10 text-xs font-semibold text-gray-300 rounded">
                          {playerEntry.position}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {playerEntry.player.team.abbreviation}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        Cost: {playerEntry.player.price} credits
                      </p>
                      {getStatDisplay(playerEntry)}
                    </div>

                    {/* Fantasy Points */}
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${
                        playerEntry.stats 
                          ? playerEntry.stats.fantasyPoints > 20 
                            ? 'text-green-400' 
                            : playerEntry.stats.fantasyPoints > 10 
                            ? 'text-amber-400' 
                            : 'text-gray-400'
                          : 'text-gray-600'
                      }`}>
                        {playerEntry.stats ? playerEntry.stats.fantasyPoints.toFixed(1) : '-'}
                      </div>
                      <p className="text-gray-500 text-xs mt-1">Fantasy Pts</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Mode Notice */}
        {team.match.status === 'FINAL' && (
          <div className="mt-8 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-purple-300 text-sm">
              🧪 This is a test team for a completed match. The stats shown are simulated based on real game outcomes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

