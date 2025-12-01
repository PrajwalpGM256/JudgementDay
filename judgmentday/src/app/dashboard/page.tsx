'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import {
  TrendingUp,
  Award,
  Calendar,
  Users,
  Target,
  Trophy,
} from 'lucide-react';

interface League {
  id: string;
  name: string;
  members: { user: { username: string } }[];
}

interface UserTeam {
  id: string;
  totalPoints: number;
  match: {
    id: string;
    week: number;
    scheduledAt: string;
    status: string;
    homeTeam: { name: string; abbreviation: string };
    awayTeam: { name: string; abbreviation: string };
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [userTeams, setUserTeams] = useState<UserTeam[]>([]);
  const [stats, setStats] = useState({
    totalPoints: 0,
    rank: 0,
    teamsCreated: 0,
    leaguesJoined: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user's leagues
      const leaguesRes = await fetch('/api/leagues');
      const leaguesData = await leaguesRes.json();
      setLeagues(leaguesData.leagues || []);

      // Fetch user's teams
      const teamsRes = await fetch('/api/user-teams');
      const teamsData = await teamsRes.json();
      setUserTeams(teamsData.userTeams || []);

      // Calculate stats
      const totalPoints = teamsData.userTeams?.reduce(
        (sum: number, team: UserTeam) => sum + team.totalPoints,
        0
      ) || 0;

      setStats({
        totalPoints: Math.round(totalPoints),
        rank: 0, // This would come from user data
        teamsCreated: teamsData.userTeams?.length || 0,
        leaguesJoined: leaguesData.leagues?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-400 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-gray-300">Here's your fantasy football overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                <Award className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-gray-300 text-sm mb-1">Total Points</p>
            <p className="text-3xl font-bold text-white mb-1">{stats.totalPoints}</p>
            <p className="text-xs text-gray-400">Across all teams</p>
          </div>

          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="text-green-400 text-sm font-semibold">Active</span>
            </div>
            <p className="text-gray-300 text-sm mb-1">Teams Created</p>
            <p className="text-3xl font-bold text-white mb-1">{stats.teamsCreated}</p>
            <p className="text-xs text-gray-400">Fantasy lineups</p>
          </div>

          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <span className="text-purple-400 text-sm font-semibold">Member</span>
            </div>
            <p className="text-gray-300 text-sm mb-1">Leagues Joined</p>
            <p className="text-3xl font-bold text-white mb-1">{stats.leaguesJoined}</p>
            <p className="text-xs text-gray-400">Competitions</p>
          </div>

          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              {/* <span className="text-yellow-400 text-sm font-semibold">100</span> */}
            </div>
            <p className="text-gray-300 text-sm mb-1">Wallet</p>
            <p className="text-3xl font-bold text-white mb-1">75</p>
            <p className="text-xs text-gray-400"> Team building Credits</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* My Leagues */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <Trophy className="h-6 w-6 text-amber-400" />
                <h2 className="text-xl font-bold text-white">My Leagues</h2>
              </div>
            </div>
            <div className="p-6">
              {leagues.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">No leagues yet</p>
                  <Link
                    href="/dashboard/leagues"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold rounded-lg hover:from-amber-300 hover:to-orange-400 transition-all duration-200"
                  >
                    Join a League
                  </Link>
                </div>
              ) : (
                <>
                  {leagues.map((league) => (
                    <Link
                      key={league.id}
                      href={`/dashboard/leagues/${league.id}`}
                      className="group block p-4 hover:bg-white/5 rounded-xl transition-all duration-200 mb-3 border border-white/5 hover:border-white/20"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                            {league.name}
                          </p>
                          <p className="text-sm text-gray-400">{league.members.length} members</p>
                        </div>
                        <span className="text-amber-400 group-hover:translate-x-1 transition-transform">
                          View →
                        </span>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href="/dashboard/leagues"
                    className="block mt-4 text-center py-3 text-amber-400 hover:text-amber-300 font-semibold border border-amber-400/20 rounded-xl hover:border-amber-400/40 hover:bg-amber-400/5 transition-all duration-200"
                  >
                    + Join New League
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* My Teams */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <Target className="h-6 w-6 text-amber-400" />
                <h2 className="text-xl font-bold text-white">My Teams</h2>
              </div>
            </div>
            <div className="p-6">
              {userTeams.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">No teams created yet</p>
                  <Link
                    href="/dashboard/matches"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold rounded-lg hover:from-amber-300 hover:to-orange-400 transition-all duration-200"
                  >
                    Build Your First Team
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {userTeams.slice(0, 3).map((team) => (
                      <Link
                        key={team.id}
                        href={`/dashboard/team-results/${team.id}`}
                        className="group block p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-400/20 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium group-hover:text-amber-400 transition-colors">
                            Week {team.match.week} • {team.match.status}
                          </span>
                          <span className="text-amber-400 font-bold group-hover:scale-110 transition-transform">
                            {team.totalPoints.toFixed(1)} pts
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                            {team.match.homeTeam.abbreviation} vs {team.match.awayTeam.abbreviation}
                          </p>
                          <span className="text-amber-400 text-xs group-hover:translate-x-1 transition-transform">
                            View Results →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/dashboard/matches"
                    className="block mt-6 w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold text-center rounded-xl hover:from-amber-300 hover:to-orange-400 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Create New Team
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/matches"
            className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <Calendar className="h-8 w-8 text-amber-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Browse Matches</h3>
            <p className="text-gray-400 text-sm">Find upcoming NFL games to build teams for</p>
          </Link>

          <Link
            href="/dashboard/leaderboard"
            className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <Trophy className="h-8 w-8 text-amber-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">View Leaderboard</h3>
            <p className="text-gray-400 text-sm">Check your ranking and compete with others</p>
          </Link>

          <Link
            href="/dashboard/leagues"
            className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <Users className="h-8 w-8 text-amber-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Join Leagues</h3>
            <p className="text-gray-400 text-sm">Compete with friends in private leagues</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
