'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, Calendar, Users, TrendingUp, Database, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMatches: 0,
    totalPlayers: 0,
    activeTeams: 0,
  });

  const fetchAdminStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setStats({
        totalUsers: data.totalUsers || 0,
        totalMatches: data.totalMatches || 0,
        totalPlayers: data.totalPlayers || 0,
        activeTeams: data.activeTeams || 0,
      });
    } catch (error: any) {
      console.error('Error fetching admin stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'ADMIN') {
      toast.error('Access denied. Admin only.');
      router.push('/dashboard');
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      // Fetch admin stats when authenticated
      fetchAdminStats();
    }
  }, [session, status, router, fetchAdminStats]);

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Dashboard Statistics</h2>
          <button
            onClick={fetchAdminStats}
            disabled={statsLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
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

