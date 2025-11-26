'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { ArrowLeft, Users, DollarSign, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';

interface Player {
  id: string;
  name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
  price: number;
  avgPoints: number;
  jerseyNumber?: number;
  imageUrl?: string;
  status: string;
}

interface Team {
  id: string;
  name: string;
  abbreviation: string;
  city: string;
  logoUrl?: string;
  conference: string;
  division: string;
}

const POSITION_LABELS: Record<string, string> = {
  QB: 'Quarterbacks',
  RB: 'Running Backs',
  WR: 'Wide Receivers',
  TE: 'Tight Ends',
  K: 'Kickers',
  DEF: 'Defense',
};

const POSITION_COLORS: Record<string, string> = {
  QB: 'from-purple-500 to-indigo-600',
  RB: 'from-green-500 to-emerald-600',
  WR: 'from-blue-500 to-cyan-600',
  TE: 'from-orange-500 to-amber-600',
  K: 'from-pink-500 to-rose-600',
  DEF: 'from-red-500 to-orange-600',
};

export default function TeamRosterPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playersByPosition, setPlayersByPosition] = useState<Record<string, Player[]>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchTeamRoster();
  }, [resolvedParams.id]);

  const fetchTeamRoster = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teams/${resolvedParams.id}/players`);
      if (!response.ok) {
        throw new Error('Failed to fetch team roster');
      }
      const data = await response.json();
      setTeam(data.team);
      setPlayers(data.players);
      setPlayersByPosition(data.playersByPosition);
    } catch (error) {
      console.error('Error fetching team roster:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPlayers = () => {
    if (filter === 'all') return players;
    return players.filter(p => p.position === filter);
  };

  const filteredPlayers = getFilteredPlayers();
  const positions = Object.keys(playersByPosition).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Navbar />
      
      {loading ? (
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-400 border-r-transparent"></div>
            <p className="text-gray-300 mt-4">Loading roster...</p>
          </div>
        </div>
      ) : team ? (
        <>
          {/* Header */}
          <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
            <div className="container mx-auto px-6 py-6">
              <Link
                href="/dashboard/teams"
                className="inline-flex items-center space-x-2 text-gray-300 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Teams</span>
              </Link>

              <div className="flex items-center space-x-6">
                {/* Team Logo */}
                <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  {team.logoUrl ? (
                    <img
                      src={team.logoUrl}
                      alt={team.name}
                      className="w-20 h-20 object-contain"
                    />
                  ) : (
                    <span className="text-slate-900 font-bold text-2xl">
                      {team.abbreviation}
                    </span>
                  )}
                </div>

                {/* Team Info */}
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {team.name}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-gray-300 text-sm">
                      {team.conference} {team.division}
                    </span>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{players.length} players</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-6 py-8">
            {/* Position Filter */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                All Positions ({players.length})
              </button>
              {positions.map((position) => (
                <button
                  key={position}
                  onClick={() => setFilter(position)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    filter === position
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {position} ({playersByPosition[position]?.length || 0})
                </button>
              ))}
            </div>

            {/* Players Grid */}
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-20">
                <Shield className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-300 text-xl">No players found</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="p-6">
                      {/* Player Header */}
                      <div className="flex items-start space-x-4 mb-4">
                        {/* Player Image */}
                        <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
                          {player.imageUrl ? (
                            <img
                              src={player.imageUrl}
                              alt={player.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-slate-900 font-bold text-2xl">
                              #{player.jerseyNumber || '??'}
                            </div>
                          )}
                        </div>

                        {/* Player Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-lg truncate group-hover:text-amber-400 transition-colors">
                            {player.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 bg-gradient-to-r ${POSITION_COLORS[player.position]} rounded text-white text-xs font-bold`}>
                              {player.position}
                            </span>
                            <span className="text-gray-400 text-sm">
                              #{player.jerseyNumber || '??'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Player Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-gray-400 text-xs mb-1">
                            <DollarSign className="h-3 w-3" />
                            <span>Price</span>
                          </div>
                          <div className="text-white font-bold text-lg">
                            ${player.price.toFixed(1)}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-gray-400 text-xs mb-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>Avg Points</span>
                          </div>
                          <div className="text-white font-bold text-lg">
                            {player.avgPoints.toFixed(1)}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mt-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          player.status === 'ACTIVE' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {player.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Position Breakdown */}
            {filter === 'all' && players.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-white mb-6">Roster Breakdown</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {positions.map((position) => (
                    <div
                      key={position}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center"
                    >
                      <div className={`inline-block px-3 py-1 bg-gradient-to-r ${POSITION_COLORS[position]} rounded-full text-white text-sm font-bold mb-2`}>
                        {position}
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {playersByPosition[position]?.length || 0}
                      </div>
                      <div className="text-gray-400 text-sm mt-1">
                        {POSITION_LABELS[position]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <Shield className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-300 text-xl">Team not found</p>
        </div>
      )}
    </div>
  );
}

