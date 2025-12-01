'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Calendar, Users, TrendingUp, Database, RefreshCw, Trophy, Plus, X, Globe, Lock, Edit, Trash2, Trash2 as Trash, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface League {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  maxMembers: number;
  entryFee?: number;
  basePrizePool?: number;
  match?: {
    id: string;
    week: number;
    season: number;
    scheduledAt: string;
    status: string;
    homeTeam: {
      id: string;
      name: string;
      abbreviation: string;
    };
    awayTeam: {
      id: string;
      name: string;
      abbreviation: string;
    };
  };
  commissioner: {
    id: string;
    username: string;
  };
  members: any[];
  _count: {
    members: number;
  };
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [leaguesLoading, setLeaguesLoading] = useState(true);
  const [showCreateLeagueModal, setShowCreateLeagueModal] = useState(false);
  const [showEditLeagueModal, setShowEditLeagueModal] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [adminLeagues, setAdminLeagues] = useState<League[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMatches: 0,
    totalPlayers: 0,
    activeTeams: 0,
  });
  const [createLeagueForm, setCreateLeagueForm] = useState({
    name: '',
    description: '',
    matchId: '',
    isPrivate: false,
    maxMembers: 20,
    entryFee: 0,
    basePrizePool: 0,
    prizeDistribution: [] as Array<{ rank: number; amount: number }>,
  });
  const [editLeagueForm, setEditLeagueForm] = useState({
    name: '',
    description: '',
    isPrivate: false,
    maxMembers: 20,
    entryFee: 0,
    basePrizePool: 0,
    prizeDistribution: [] as Array<{ rank: number; amount: number }>,
  });
  const [syncingMatches, setSyncingMatches] = useState(false);

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

  const fetchAdminLeagues = useCallback(async () => {
    setLeaguesLoading(true);
    try {
      const response = await fetch('/api/leagues/admin');
      if (!response.ok) throw new Error('Failed to fetch leagues');
      
      const data = await response.json();
      setAdminLeagues(data.leagues || []);
    } catch (error: any) {
      console.error('Error fetching admin leagues:', error);
      toast.error('Failed to load leagues');
    } finally {
      setLeaguesLoading(false);
    }
  }, []);

  const fetchMatches = useCallback(async () => {
    try {
      const response = await fetch('/api/matches?status=SCHEDULED');
      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  }, []);

  const syncMatches = async () => {
    setSyncingMatches(true);
    const loadingToast = toast.loading('Syncing matches from ESPN...');
    try {
      const response = await fetch('/api/admin/sync-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          season: new Date().getFullYear(),
          mode: 'all',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync matches');
      }

      toast.success(
        `✅ Synced ${data.summary.total} matches! (${data.summary.created} new, ${data.summary.updated} updated)`,
        { id: loadingToast, duration: 5000 }
      );

      // Refresh stats and matches
      fetchAdminStats();
      fetchMatches();
    } catch (error: any) {
      toast.error(error.message || 'Failed to sync matches', { id: loadingToast });
    } finally {
      setSyncingMatches(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'ADMIN') {
      toast.error('Access denied. Admin only.');
      router.push('/dashboard');
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      // Fetch admin stats and leagues when authenticated
      fetchAdminStats();
      fetchAdminLeagues();
      fetchMatches();
    }
  }, [session, status, router, fetchAdminStats, fetchAdminLeagues, fetchMatches]);

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

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate prize distribution
    if (calculateTotalPrizeDistribution(false) > calculateTotalAvailablePrizePool(false)) {
      toast.error('Prize distribution cannot exceed available prize pool');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createLeagueForm.name,
          description: createLeagueForm.description,
          matchId: createLeagueForm.matchId,
          isPrivate: createLeagueForm.isPrivate,
          maxMembers: createLeagueForm.maxMembers,
          entryFee: createLeagueForm.entryFee,
          basePrizePool: createLeagueForm.basePrizePool,
          prizeDistribution: createLeagueForm.prizeDistribution.length > 0 ? createLeagueForm.prizeDistribution : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create league');
      }

      const data = await response.json();
      toast.success('League created successfully!');
      setShowCreateLeagueModal(false);
      setCreateLeagueForm({
        name: '',
        description: '',
        matchId: '',
        isPrivate: false,
        maxMembers: 20,
        entryFee: 0,
        basePrizePool: 0,
        prizeDistribution: [],
      });
      fetchAdminLeagues();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create league');
    } finally {
      setLoading(false);
    }
  };

  const handleEditLeague = (league: League) => {
    setEditingLeague(league);
    setEditLeagueForm({
      name: league.name,
      description: league.description || '',
      isPrivate: league.isPrivate,
      maxMembers: league.maxMembers,
      entryFee: league.entryFee || 0,
      basePrizePool: league.basePrizePool || 0,
      prizeDistribution: (league as any).prizeDistribution || [],
    });
    setShowEditLeagueModal(true);
  };

  const handleUpdateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeague) return;

    // Validate prize distribution
    if (calculateTotalPrizeDistribution(true) > calculateTotalAvailablePrizePool(true)) {
      toast.error('Prize distribution cannot exceed available prize pool');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/leagues/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId: editingLeague.id,
          name: editLeagueForm.name,
          description: editLeagueForm.description,
          isPrivate: editLeagueForm.isPrivate,
          maxMembers: editLeagueForm.maxMembers,
          entryFee: editLeagueForm.entryFee,
          basePrizePool: editLeagueForm.basePrizePool,
          prizeDistribution: editLeagueForm.prizeDistribution.length > 0 ? editLeagueForm.prizeDistribution : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update league');
      }

      toast.success('League updated successfully!');
      setShowEditLeagueModal(false);
      setEditingLeague(null);
      fetchAdminLeagues();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update league');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLeague = async (leagueId: string, leagueName: string) => {
    if (!confirm(`Are you sure you want to delete "${leagueName}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/leagues/admin?leagueId=${leagueId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete league');
      }

      toast.success('League deleted successfully!');
      fetchAdminLeagues();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete league');
    } finally {
      setLoading(false);
    }
  };

  const addPrizeTier = (isEdit: boolean = false) => {
    if (isEdit) {
      const nextRank = editLeagueForm.prizeDistribution.length + 1;
      setEditLeagueForm({
        ...editLeagueForm,
        prizeDistribution: [...editLeagueForm.prizeDistribution, { rank: nextRank, amount: 0 }],
      });
    } else {
      const nextRank = createLeagueForm.prizeDistribution.length + 1;
      setCreateLeagueForm({
        ...createLeagueForm,
        prizeDistribution: [...createLeagueForm.prizeDistribution, { rank: nextRank, amount: 0 }],
      });
    }
  };

  const removePrizeTier = (index: number, isEdit: boolean = false) => {
    if (isEdit) {
      setEditLeagueForm({
        ...editLeagueForm,
        prizeDistribution: editLeagueForm.prizeDistribution.filter((_, i) => i !== index),
      });
    } else {
      setCreateLeagueForm({
        ...createLeagueForm,
        prizeDistribution: createLeagueForm.prizeDistribution.filter((_, i) => i !== index),
      });
    }
  };

  const updatePrizeTier = (index: number, field: 'rank' | 'amount', value: number, isEdit: boolean = false) => {
    if (isEdit) {
      const updated = [...editLeagueForm.prizeDistribution];
      updated[index] = { ...updated[index], [field]: value };
      setEditLeagueForm({ ...editLeagueForm, prizeDistribution: updated });
    } else {
      const updated = [...createLeagueForm.prizeDistribution];
      updated[index] = { ...updated[index], [field]: value };
      setCreateLeagueForm({ ...createLeagueForm, prizeDistribution: updated });
    }
  };

  const calculateTotalAvailablePrizePool = (isEdit: boolean = false) => {
    const form = isEdit ? editLeagueForm : createLeagueForm;
    return (form.entryFee * form.maxMembers) + form.basePrizePool;
  };

  const calculateTotalPrizeDistribution = (isEdit: boolean = false) => {
    const form = isEdit ? editLeagueForm : createLeagueForm;
    return form.prizeDistribution.reduce((sum, prize) => sum + prize.amount, 0);
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
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 py-4 sm:py-6">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Shield className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-amber-400" />
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-300 text-sm sm:text-base">Manage matches, players, and scoring</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 border border-white/20 hover:border-white/40 transition-all duration-200 text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stats Grid */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Dashboard Statistics</h2>
          <button
            onClick={fetchAdminStats}
            disabled={statsLoading}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              <span className="text-xs text-gray-400">Total</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.totalUsers}</p>
            <p className="text-xs sm:text-sm text-gray-400">Registered Users</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
              <span className="text-xs text-gray-400">Active</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.totalMatches}</p>
            <p className="text-xs sm:text-sm text-gray-400">Scheduled Matches</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Database className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
              <span className="text-xs text-gray-400">Available</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.totalPlayers}</p>
            <p className="text-xs sm:text-sm text-gray-400">Players in Database</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-amber-400" />
              <span className="text-xs text-gray-400">Created</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.activeTeams}</p>
            <p className="text-xs sm:text-sm text-gray-400">Fantasy Teams</p>
          </div>
        </div>

        {/* Admin Actions Section */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4 sm:p-6 mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1 flex items-center space-x-2">
                <Database className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                <span>Data Management</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">Sync latest matches and scores from ESPN API</p>
            </div>
            <button
              onClick={syncMatches}
              disabled={syncingMatches}
              className="flex items-center justify-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-sm sm:text-base"
            >
              <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${syncingMatches ? 'animate-spin' : ''}`} />
              <span>{syncingMatches ? 'Syncing...' : 'Sync Matches from ESPN'}</span>
            </button>
          </div>
        </div>

        {/* League Management Section */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Trophy className="h-6 w-6 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">League Management</h2>
            </div>
            <button
              onClick={() => setShowCreateLeagueModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-400 hover:to-emerald-500 font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <Plus className="h-4 w-4" />
              <span>Create League</span>
            </button>
          </div>
          <p className="text-gray-400 mb-6">
            Create public leagues that everyone can join, or private leagues for restricted access.
          </p>

          {/* Admin's Leagues List */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">My Created Leagues</h3>
            {leaguesLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-400 border-r-transparent"></div>
              </div>
            ) : adminLeagues.length === 0 ? (
              <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No leagues created yet</p>
                <p className="text-gray-500 text-sm mt-1">Create your first league above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {adminLeagues.map((league) => (
                  <div
                    key={league.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-xl font-bold text-white">{league.name}</h4>
                          {league.isPrivate ? (
                            <div title="Private League">
                              <Lock className="h-5 w-5 text-blue-400" />
                            </div>
                          ) : (
                            <div title="Public League">
                              <Globe className="h-5 w-5 text-green-400" />
                            </div>
                          )}
                        </div>
                        {league.description && (
                          <p className="text-gray-300 mb-3">{league.description}</p>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <span className="text-gray-400">Members: </span>
                            <span className="text-white font-semibold">
                              {league._count.members}/{league.maxMembers}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Match: </span>
                            <span className="text-white font-semibold">
                              {league.match ? `Week ${league.match.week}` : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Prize Pool: </span>
                            <span className="text-green-400 font-semibold">
                              {((league.entryFee || 0) * league.maxMembers + (league.basePrizePool || 0)).toFixed(0)} credits
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Entry Fee: </span>
                            <span className="text-white font-semibold">
                              {league.entryFee || 0} credits
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Created: </span>
                            <span className="text-white font-semibold">
                              {new Date(league.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditLeague(league)}
                          disabled={loading}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit League"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLeague(league.id, league.name)}
                          disabled={loading}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete League"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      {/* Create League Modal */}
      {showCreateLeagueModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create League</h2>
              <button
                onClick={() => {
                  setShowCreateLeagueModal(false);
                  setCreateLeagueForm({
                    name: '',
                    description: '',
                    matchId: '',
                    isPrivate: false,
                    maxMembers: 20,
                    entryFee: 0,
                    basePrizePool: 0,
                    prizeDistribution: [],
                  });
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreateLeague} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">League Name</label>
                <input
                  type="text"
                  required
                  value={createLeagueForm.name}
                  onChange={(e) => setCreateLeagueForm({ ...createLeagueForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter league name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={createLeagueForm.description}
                  onChange={(e) =>
                    setCreateLeagueForm({ ...createLeagueForm, description: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Describe your league"
                  rows={3}
                />
              </div>
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createLeagueForm.isPrivate}
                    onChange={(e) =>
                      setCreateLeagueForm({ ...createLeagueForm, isPrivate: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 bg-slate-700 border-white/10 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    {createLeagueForm.isPrivate ? (
                      <Lock className="h-4 w-4 text-blue-400" />
                    ) : (
                      <Globe className="h-4 w-4 text-green-400" />
                    )}
                    <span className="text-sm font-medium text-gray-300">
                      {createLeagueForm.isPrivate ? 'Private League' : 'Public League'}
                    </span>
                  </div>
                </label>
                <p className="text-xs text-gray-400 mt-1 ml-8">
                  {createLeagueForm.isPrivate
                    ? 'Only users with invite code can join'
                    : 'Anyone can view and join this league'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Match *</label>
                <select
                  required
                  value={createLeagueForm.matchId}
                  onChange={(e) => setCreateLeagueForm({ ...createLeagueForm, matchId: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select a match</option>
                  {matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      Week {match.week} - {match.homeTeam.abbreviation} vs {match.awayTeam.abbreviation} ({new Date(match.scheduledAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Members</label>
                  <input
                    type="number"
                    required
                    min="2"
                    max="100"
                    value={createLeagueForm.maxMembers}
                    onChange={(e) =>
                      setCreateLeagueForm({
                        ...createLeagueForm,
                        maxMembers: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Entry Fee (Credits)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={createLeagueForm.entryFee}
                    onChange={(e) =>
                      setCreateLeagueForm({
                        ...createLeagueForm,
                        entryFee: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Base Prize Pool (Credits) - Optional
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={createLeagueForm.basePrizePool}
                  onChange={(e) =>
                    setCreateLeagueForm({
                      ...createLeagueForm,
                      basePrizePool: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Additional prize pool amount (beyond entry fees)
                </p>
              </div>

              {/* Prize Distribution */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Prize Distribution (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => addPrizeTier(false)}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Prize</span>
                  </button>
                </div>
                {createLeagueForm.prizeDistribution.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {createLeagueForm.prizeDistribution.map((prize, index) => (
                      <div key={index} className="flex space-x-2 items-center">
                        <div className="flex-1">
                          <input
                            type="number"
                            min="1"
                            placeholder="Rank"
                            value={prize.rank || ''}
                            onChange={(e) =>
                              updatePrizeTier(index, 'rank', parseInt(e.target.value) || 0, false)
                            }
                            className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Amount (Credits)"
                            value={prize.amount || ''}
                            onChange={(e) =>
                              updatePrizeTier(index, 'amount', parseFloat(e.target.value) || 0, false)
                            }
                            className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removePrizeTier(index, false)}
                          className="p-2 text-red-400 hover:text-red-300"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="bg-slate-700/50 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Available Prize Pool:</span>
                    <span className="font-semibold">{calculateTotalAvailablePrizePool(false)} credits</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Total Prize Distribution:</span>
                    <span className={`font-semibold ${calculateTotalPrizeDistribution(false) > calculateTotalAvailablePrizePool(false) ? 'text-red-400' : 'text-green-400'}`}>
                      {calculateTotalPrizeDistribution(false)} credits
                    </span>
                  </div>
                  {calculateTotalPrizeDistribution(false) > calculateTotalAvailablePrizePool(false) && (
                    <p className="text-red-400 text-xs mt-1">
                      ⚠️ Prize distribution exceeds available prize pool
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateLeagueModal(false);
                    setCreateLeagueForm({
                      name: '',
                      description: '',
                      matchId: '',
                      isPrivate: false,
                      maxMembers: 20,
                      entryFee: 0,
                      basePrizePool: 0,
                      prizeDistribution: [],
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-400 hover:to-emerald-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create League'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit League Modal */}
      {showEditLeagueModal && editingLeague && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Edit League</h2>
              <button
                onClick={() => {
                  setShowEditLeagueModal(false);
                  setEditingLeague(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateLeague} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">League Name</label>
                <input
                  type="text"
                  required
                  value={editLeagueForm.name}
                  onChange={(e) => setEditLeagueForm({ ...editLeagueForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter league name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={editLeagueForm.description}
                  onChange={(e) =>
                    setEditLeagueForm({ ...editLeagueForm, description: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Describe your league"
                  rows={3}
                />
              </div>
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editLeagueForm.isPrivate}
                    onChange={(e) =>
                      setEditLeagueForm({ ...editLeagueForm, isPrivate: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 bg-slate-700 border-white/10 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    {editLeagueForm.isPrivate ? (
                      <Lock className="h-4 w-4 text-blue-400" />
                    ) : (
                      <Globe className="h-4 w-4 text-green-400" />
                    )}
                    <span className="text-sm font-medium text-gray-300">
                      {editLeagueForm.isPrivate ? 'Private League' : 'Public League'}
                    </span>
                  </div>
                </label>
                <p className="text-xs text-gray-400 mt-1 ml-8">
                  {editLeagueForm.isPrivate
                    ? 'Only users with invite code can join'
                    : 'Anyone can view and join this league'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Members</label>
                  <input
                    type="number"
                    required
                    min="2"
                    max="100"
                    value={editLeagueForm.maxMembers}
                    onChange={(e) =>
                      setEditLeagueForm({
                        ...editLeagueForm,
                        maxMembers: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Current: {editingLeague._count.members} members
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Entry Fee (Credits)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={editLeagueForm.entryFee}
                    onChange={(e) =>
                      setEditLeagueForm({
                        ...editLeagueForm,
                        entryFee: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Base Prize Pool (Credits) - Optional
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={editLeagueForm.basePrizePool}
                  onChange={(e) =>
                    setEditLeagueForm({
                      ...editLeagueForm,
                      basePrizePool: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Additional prize pool amount (beyond entry fees)
                </p>
              </div>

              {/* Prize Distribution */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Prize Distribution (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => addPrizeTier(true)}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Prize</span>
                  </button>
                </div>
                {editLeagueForm.prizeDistribution.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {editLeagueForm.prizeDistribution.map((prize, index) => (
                      <div key={index} className="flex space-x-2 items-center">
                        <div className="flex-1">
                          <input
                            type="number"
                            min="1"
                            placeholder="Rank"
                            value={prize.rank || ''}
                            onChange={(e) =>
                              updatePrizeTier(index, 'rank', parseInt(e.target.value) || 0, true)
                            }
                            className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Amount (Credits)"
                            value={prize.amount || ''}
                            onChange={(e) =>
                              updatePrizeTier(index, 'amount', parseFloat(e.target.value) || 0, true)
                            }
                            className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removePrizeTier(index, true)}
                          className="p-2 text-red-400 hover:text-red-300"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="bg-slate-700/50 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Available Prize Pool:</span>
                    <span className="font-semibold">{calculateTotalAvailablePrizePool(true)} credits</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Total Prize Distribution:</span>
                    <span className={`font-semibold ${calculateTotalPrizeDistribution(true) > calculateTotalAvailablePrizePool(true) ? 'text-red-400' : 'text-green-400'}`}>
                      {calculateTotalPrizeDistribution(true)} credits
                    </span>
                  </div>
                  {calculateTotalPrizeDistribution(true) > calculateTotalAvailablePrizePool(true) && (
                    <p className="text-red-400 text-xs mt-1">
                      ⚠️ Prize distribution exceeds available prize pool
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditLeagueModal(false);
                    setEditingLeague(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-400 hover:to-cyan-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update League'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

