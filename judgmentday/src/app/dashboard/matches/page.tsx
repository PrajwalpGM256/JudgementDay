'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Users, Trophy, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface Team {
  id: string;
  name: string;
  abbreviation: string;
  city: string;
}

interface Match {
  id: string;
  week: number;
  season: number;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
  scheduledAt: string;
  status: string;
  userTeams: { id: string; userId: string }[];
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'live' | 'final'>('scheduled');

  useEffect(() => {
    fetchMatches();
  }, [filter]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const statusParam = filter !== 'all' ? `&status=${filter.toUpperCase()}` : '';
      const response = await fetch(`/api/matches?${statusParam}`);
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      SCHEDULED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      LIVE: 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse',
      FINAL: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      HALFTIME: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return styles[status as keyof typeof styles] || styles.SCHEDULED;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 py-6">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold text-white mb-2">Upcoming Matches</h1>
          <p className="text-gray-300">Build your fantasy team for each match</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-8">
          {['all', 'scheduled', 'live', 'final'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as typeof filter)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                filter === tab
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-400 border-r-transparent"></div>
            <p className="text-gray-300 mt-4">Loading matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-300 text-xl">No matches found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {matches.map((match) => (
              <div
                key={match.id}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="p-6">
                  {/* Match Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-amber-400" />
                      <span className="text-sm font-semibold text-amber-400">
                        Week {match.week}, {match.season}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                        match.status
                      )}`}
                    >
                      {match.status}
                    </span>
                  </div>

                  {/* Teams */}
                  <div className="space-y-3 mb-4">
                    {/* Away Team */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {match.awayTeam.abbreviation}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">{match.awayTeam.name}</p>
                          <p className="text-gray-400 text-xs">Away</p>
                        </div>
                      </div>
                      {match.awayScore !== null && (
                        <span className="text-2xl font-bold text-white">{match.awayScore}</span>
                      )}
                    </div>

                    {/* Home Team */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {match.homeTeam.abbreviation}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">{match.homeTeam.name}</p>
                          <p className="text-gray-400 text-xs">Home</p>
                        </div>
                      </div>
                      {match.homeScore !== null && (
                        <span className="text-2xl font-bold text-white">{match.homeScore}</span>
                      )}
                    </div>
                  </div>

                  {/* Match Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(match.scheduledAt), 'MMM d, h:mm a')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{match.userTeams.length} teams</span>
                      </div>
                    </div>

                    {match.status === 'SCHEDULED' && (
                      <Link
                        href={`/dashboard/team-builder/${match.id}`}
                        className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold rounded-lg hover:from-amber-300 hover:to-orange-400 transform hover:scale-105 transition-all duration-200"
                      >
                        <span>Build Team</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

