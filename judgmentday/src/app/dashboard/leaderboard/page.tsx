'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Trophy, Medal, TrendingUp, Users, Award } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  points: number;
  totalPoints?: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'global' | 'match'>('global');

  useEffect(() => {
    fetchLeaderboard();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [view]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-gray-400 font-bold text-lg">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-amber-500';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-700';
      default:
        return 'bg-white/5';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Navbar />
      
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                <Trophy className="h-10 w-10 text-amber-400" />
                <span>Leaderboard</span>
              </h1>
              <p className="text-gray-300">See how you rank against other players</p>
            </div>
            <div className="flex items-center space-x-4 text-gray-300">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-amber-400" />
                <span className="font-semibold">{leaderboard.length} Players</span>
              </div>
              <button
                onClick={fetchLeaderboard}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            {/* 2nd Place */}
            <div className="flex flex-col items-center pt-12">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mb-4 shadow-2xl">
                <Medal className="h-12 w-12 text-slate-900" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white mb-1">{leaderboard[1].username}</p>
                <p className="text-amber-400 font-bold text-xl">{leaderboard[1].points} pts</p>
                <div className="mt-4 px-6 py-3 bg-gradient-to-r from-gray-300 to-gray-400 rounded-xl">
                  <p className="text-slate-900 font-bold text-lg">2nd Place</p>
                </div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Trophy className="h-16 w-16 text-slate-900" />
                </div>
              </div>
              <div className="text-center mt-4">
                <p className="text-3xl font-bold text-white mb-1">{leaderboard[0].username}</p>
                <p className="text-amber-400 font-bold text-2xl">{leaderboard[0].points} pts</p>
                <div className="mt-4 px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl shadow-2xl">
                  <p className="text-slate-900 font-bold text-xl">🏆 Champion</p>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center pt-12">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center mb-4 shadow-2xl">
                <Medal className="h-12 w-12 text-white" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white mb-1">{leaderboard[2].username}</p>
                <p className="text-amber-400 font-bold text-xl">{leaderboard[2].points} pts</p>
                <div className="mt-4 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl">
                  <p className="text-white font-bold text-lg">3rd Place</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-amber-400/10 to-orange-500/10">
              <div className="flex items-center space-x-3">
                <Award className="h-6 w-6 text-amber-400" />
                <h2 className="text-2xl font-bold text-white">All Rankings</h2>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-400 border-r-transparent"></div>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-20">
                <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-300 text-xl">No rankings yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.userId}
                    className={`p-6 hover:bg-white/5 transition-colors ${getRankBadge(
                      entry.rank
                    )} ${entry.rank <= 3 ? 'bg-opacity-10' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        {/* Rank */}
                        <div className="w-16 flex justify-center">{getRankIcon(entry.rank)}</div>

                        {/* Avatar */}
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {entry.username.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* User Info */}
                        <div>
                          <p className="text-white font-bold text-lg">{entry.username}</p>
                          <p className="text-gray-400 text-sm">Rank #{entry.rank}</p>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-green-400" />
                          <span className="text-3xl font-bold text-amber-400">
                            {entry.points}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">points</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Updates Badge */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-semibold">
                Live Updates • Refreshes every 30s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

