'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, Calendar, Users, TrendingUp, Database, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMatches: 0,
    totalPlayers: 0,
    activeTeams: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'ADMIN') {
      toast.error('Access denied. Admin only.');
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const handleScoreUpdate = async (matchId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/scoring/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId }),
      });

      if (!response.ok) throw new Error('Failed to update scores');

      const data = await response.json();
      toast.success(`Updated scores for ${data.usersUpdated} users`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update scores');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-400 border-r-transparent"></div>
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-10 w-10 text-amber-400" />
            <div>
              <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-300">Manage matches, players, and scoring</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-400" />
              <span className="text-xs text-gray-400">Total</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.totalUsers}</p>
            <p className="text-sm text-gray-400">Registered Users</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-8 w-8 text-green-400" />
              <span className="text-xs text-gray-400">Active</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.totalMatches}</p>
            <p className="text-sm text-gray-400">Scheduled Matches</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Database className="h-8 w-8 text-purple-400" />
              <span className="text-xs text-gray-400">Available</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.totalPlayers}</p>
            <p className="text-sm text-gray-400">Players in Database</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-amber-400" />
              <span className="text-xs text-gray-400">Created</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.activeTeams}</p>
            <p className="text-sm text-gray-400">Fantasy Teams</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Scoring Management */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <RefreshCw className="h-6 w-6 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">Scoring Management</h2>
            </div>

            <p className="text-gray-300 mb-6">
              Update fantasy points for matches based on player statistics. This will recalculate
              all user team scores and update the leaderboard.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-white font-semibold mb-2">Manual Score Update</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Trigger scoring calculation for all matches with player stats
                </p>
                <button
                  onClick={() => handleScoreUpdate('all')}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold rounded-lg hover:from-amber-300 hover:to-orange-400 transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update All Scores'}
                </button>
              </div>

              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                <h3 className="text-blue-400 font-semibold mb-2">Automatic Updates</h3>
                <p className="text-sm text-gray-300">
                  In production, set up a cron job or serverless function to automatically update
                  scores every 5-10 minutes during game time.
                </p>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Database className="h-6 w-6 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">Data Management</h2>
            </div>

            <p className="text-gray-300 mb-6">
              Manage matches, players, and teams. Use the Prisma Studio or API endpoints to add new
              data.
            </p>

            <div className="space-y-3">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-white font-semibold mb-2">Prisma Studio</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Run <code className="text-amber-400">npm run db:studio</code> to open Prisma
                  Studio for database management
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-white font-semibold mb-2">Seed Database</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Run <code className="text-amber-400">npm run db:seed</code> to populate with demo
                  data
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-white font-semibold mb-2">API Integration</h3>
                <p className="text-sm text-gray-400">
                  Configure external sports API in environment variables to fetch live player stats
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* API Endpoints Reference */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Admin API Endpoints</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <code className="text-green-400 text-sm">POST /api/matches</code>
              <p className="text-gray-400 text-xs mt-2">Create new match</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <code className="text-green-400 text-sm">POST /api/scoring/update</code>
              <p className="text-gray-400 text-xs mt-2">Update match scoring</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <code className="text-blue-400 text-sm">GET /api/matches</code>
              <p className="text-gray-400 text-xs mt-2">List all matches</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <code className="text-blue-400 text-sm">GET /api/players</code>
              <p className="text-gray-400 text-xs mt-2">List all players</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

