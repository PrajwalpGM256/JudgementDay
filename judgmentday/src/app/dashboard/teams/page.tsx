'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { Users, Trophy, Shield } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  abbreviation: string;
  city: string;
  logoUrl?: string;
  conference: string;
  division: string;
  _count: {
    players: number;
  };
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'AFC' | 'NFC'>('all');

  useEffect(() => {
    fetchTeams();
  }, [filter]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const conferenceParam = filter !== 'all' ? `?conference=${filter}` : '';
      const response = await fetch(`/api/teams${conferenceParam}`);
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group teams by division
  const groupedTeams: Record<string, Team[]> = {};
  teams.forEach((team) => {
    const key = `${team.conference}-${team.division}`;
    if (!groupedTeams[key]) {
      groupedTeams[key] = [];
    }
    groupedTeams[key].push(team);
  });

  const getConferenceColor = (conference: string) => {
    return conference === 'AFC' 
      ? 'from-red-500 to-orange-600' 
      : 'from-blue-500 to-purple-600';
  };

  const getConferenceIcon = (conference: string) => {
    return conference === 'AFC' ? '🏈' : '🏆';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Navbar />
      
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="h-10 w-10 text-amber-400" />
            <h1 className="text-4xl font-bold text-white">NFL Teams</h1>
          </div>
          <p className="text-gray-300">All 32 teams with their rosters</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-8">
          {['all', 'AFC', 'NFC'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as typeof filter)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                filter === tab
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {tab === 'all' ? 'All Teams' : `${tab} Conference`}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-400 border-r-transparent"></div>
            <p className="text-gray-300 mt-4">Loading teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-20">
            <Shield className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-300 text-xl">No teams found</p>
            <p className="text-gray-500 mt-2">Run the populate-teams script to add teams</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Group by Conference */}
            {['AFC', 'NFC'].map((conference) => {
              const conferenceTeams = teams.filter(t => t.conference === conference);
              if (conferenceTeams.length === 0) return null;

              return (
                <div key={conference} className="space-y-6">
                  {/* Conference Header */}
                  <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
                    <div className={`text-4xl`}>
                      {getConferenceIcon(conference)}
                    </div>
                    <h2 className="text-3xl font-bold text-white">
                      {conference} Conference
                    </h2>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-gray-300 text-sm">
                      {conferenceTeams.length} teams
                    </span>
                  </div>

                  {/* Divisions */}
                  <div className="grid md:grid-cols-2 gap-8">
                    {['North', 'South', 'East', 'West'].map((division) => {
                      const divisionKey = `${conference}-${division}`;
                      const divisionTeams = groupedTeams[divisionKey] || [];
                      
                      if (divisionTeams.length === 0) return null;

                      return (
                        <div key={divisionKey} className="space-y-4">
                          {/* Division Header */}
                          <div className="flex items-center space-x-2 mb-3">
                            <Trophy className="h-5 w-5 text-amber-400" />
                            <h3 className="text-xl font-bold text-white">
                              {division} Division
                            </h3>
                          </div>

                          {/* Teams in Division */}
                          <div className="space-y-3">
                            {divisionTeams.map((team) => (
                              <Link
                                key={team.id}
                                href={`/dashboard/teams/${team.id}`}
                                className="block group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
                              >
                                <div className="flex items-center space-x-4">
                                  {/* Team Logo */}
                                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-md">
                                    {team.logoUrl ? (
                                      <img
                                        src={team.logoUrl}
                                        alt={team.name}
                                        className="w-14 h-14 object-contain"
                                      />
                                    ) : (
                                      <span className="text-slate-900 font-bold text-xl">
                                        {team.abbreviation}
                                      </span>
                                    )}
                                  </div>

                                  {/* Team Info */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-bold text-lg truncate">
                                      {team.name}
                                    </h4>
                                    <div className="flex items-center space-x-3 mt-1">
                                      <span className="text-gray-400 text-sm">
                                        {team.abbreviation}
                                      </span>
                                      <span className="text-gray-500">•</span>
                                      <div className="flex items-center space-x-1 text-gray-400 text-sm">
                                        <Users className="h-3 w-3" />
                                        <span>{team._count.players} players</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Conference Badge */}
                                  <div className={`px-3 py-1 bg-gradient-to-r ${getConferenceColor(conference)} rounded-full`}>
                                    <span className="text-white text-xs font-bold">
                                      {team.conference}
                                    </span>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Summary */}
        {teams.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-amber-400 mb-2">
                {teams.length}
              </div>
              <div className="text-gray-300">Total Teams</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {teams.reduce((sum, team) => sum + team._count.players, 0)}
              </div>
              <div className="text-gray-300">Total Players</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">
                {new Set(teams.map(t => `${t.conference}-${t.division}`)).size}
              </div>
              <div className="text-gray-300">Divisions</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

