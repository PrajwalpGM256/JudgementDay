'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { Plus, Users, Crown, Star, ArrowRight, Trophy, X, Copy, Check, Trash2, Coins, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface LeagueMember {
  user: {
    id: string;
    username: string;
    totalPoints: number;
  };
  points: number;
  rank?: number;
}

interface League {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  inviteCode?: string;
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
  members: LeagueMember[];
  _count: {
    members: number;
  };
  isMember?: boolean;
  isCommissioner?: boolean;
  canJoin?: boolean;
}

export default function LeaguesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [publicLeagues, setPublicLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [viewedLeague, setViewedLeague] = useState<League | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [leagueToDelete, setLeagueToDelete] = useState<League | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [matches, setMatches] = useState<any[]>([]);
  const [userCredits, setUserCredits] = useState(0);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    matchId: '',
    maxMembers: 20,
    entryFee: 0,
    basePrizePool: 0,
    prizeDistribution: [] as Array<{ rank: number; amount: number }>,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchLeagues();
      fetchMatches();
      fetchUserCredits();
    }
  }, [status, router]);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches?status=SCHEDULED');
      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchUserCredits = async () => {
    try {
      const response = await fetch('/api/user/credits');
      if (response.ok) {
        const data = await response.json();
        setUserCredits(data.credits || 0);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const fetchLeagues = async () => {
    setLoading(true);
    try {
      const [myResponse, publicResponse] = await Promise.all([
        fetch('/api/leagues?type=my'),
        fetch('/api/leagues?type=public'),
      ]);

      if (myResponse.ok) {
        const myData = await myResponse.json();
        setMyLeagues(myData.leagues || []);
      }

      if (publicResponse.ok) {
        const publicData = await publicResponse.json();
        setPublicLeagues(publicData.leagues || []);
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
      toast.error('Failed to load leagues');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate prize distribution
    if (calculateTotalPrizeDistribution() > calculateTotalAvailablePrizePool()) {
      toast.error('Prize distribution cannot exceed available prize pool');
      return;
    }

    try {
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          description: createForm.description,
          matchId: createForm.matchId,
          maxMembers: createForm.maxMembers,
          entryFee: createForm.entryFee,
          basePrizePool: createForm.basePrizePool,
          prizeDistribution: createForm.prizeDistribution.length > 0 ? createForm.prizeDistribution : undefined,
          isPrivate: true, // Regular users can only create private leagues
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create league');
      }

      const data = await response.json();
      toast.success('League created successfully!');
      setShowCreateModal(false);
      setCreateForm({ 
        name: '', 
        description: '', 
        matchId: '',
        maxMembers: 20, 
        entryFee: 0,
        basePrizePool: 0,
        prizeDistribution: [],
      });
      fetchLeagues();
      await fetchUserCredits();
      // Trigger credits update event for navbar
      window.dispatchEvent(new Event('creditsUpdated'));
    } catch (error: any) {
      toast.error(error.message || 'Failed to create league');
    }
  };

  const handleViewPrivateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    try {
      const response = await fetch('/api/leagues/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to view league');
      }

      const data = await response.json();
      setViewedLeague(data.league);
      setShowJoinModal(false);
      setShowViewModal(true);
      setInviteCode('');
      
      // Fetch user teams for this match if league has match info
      if (data.league?.match?.id) {
        fetchUserTeamsForMatch(data.league.match.id);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to view league');
    }
  };

  const fetchUserTeamsForMatch = async (matchId: string) => {
    setLoadingTeams(true);
    try {
      const response = await fetch(`/api/user-teams?matchId=${matchId}`);
      if (response.ok) {
        const data = await response.json();
        setUserTeams(data.userTeams || []);
        if (data.userTeams?.length > 0) {
          setSelectedTeamId(data.userTeams[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleJoinLeague = async (leagueId: string, inviteCode?: string) => {
    if (!selectedTeamId) {
      toast.error('Please select a team to join this league');
      return;
    }

    try {
      const response = await fetch('/api/leagues', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          leagueId: inviteCode ? undefined : leagueId,
          inviteCode: inviteCode,
          userTeamId: selectedTeamId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join league');
      }

      const data = await response.json();
      toast.success('Successfully joined league!');
      setShowViewModal(false);
      setViewedLeague(null);
      setSelectedTeamId('');
      setUserTeams([]);
      fetchLeagues();
      await fetchUserCredits();
      // Trigger credits update event for navbar
      window.dispatchEvent(new Event('creditsUpdated'));
    } catch (error: any) {
      toast.error(error.message || 'Failed to join league');
    }
  };

  const handleJoinPrivateLeague = async () => {
    if (!viewedLeague) return;

    if (!selectedTeamId) {
      toast.error('Please select a team to join this league');
      return;
    }

    try {
      const response = await fetch('/api/leagues', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          inviteCode: viewedLeague.inviteCode,
          userTeamId: selectedTeamId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join league');
      }

      const data = await response.json();
      toast.success('Successfully joined league!');
      setShowViewModal(false);
      setViewedLeague(null);
      setSelectedTeamId('');
      setUserTeams([]);
      fetchLeagues();
      await fetchUserCredits();
      // Trigger credits update event for navbar
      window.dispatchEvent(new Event('creditsUpdated'));
    } catch (error: any) {
      toast.error(error.message || 'Failed to join league');
    }
  };

  const handleDeleteLeague = async () => {
    if (!leagueToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/leagues?id=${leagueToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete league');
      }

      toast.success(`League "${leagueToDelete.name}" deleted successfully`);
      setShowDeleteConfirm(false);
      setLeagueToDelete(null);
      fetchLeagues();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete league');
    } finally {
      setDeleting(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success('Invite code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const addPrizeTier = () => {
    const nextRank = createForm.prizeDistribution.length + 1;
    setCreateForm({
      ...createForm,
      prizeDistribution: [...createForm.prizeDistribution, { rank: nextRank, amount: 0 }],
    });
  };

  const removePrizeTier = (index: number) => {
    setCreateForm({
      ...createForm,
      prizeDistribution: createForm.prizeDistribution.filter((_, i) => i !== index),
    });
  };

  const updatePrizeTier = (index: number, field: 'rank' | 'amount', value: number) => {
    const updated = [...createForm.prizeDistribution];
    updated[index] = { ...updated[index], [field]: value };
    setCreateForm({ ...createForm, prizeDistribution: updated });
  };

  const calculateTotalAvailablePrizePool = () => {
    return (createForm.entryFee * createForm.maxMembers) + createForm.basePrizePool;
  };

  const calculateTotalPrizeDistribution = () => {
    return createForm.prizeDistribution.reduce((sum, prize) => sum + prize.amount, 0);
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

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Leagues</h1>
            <p className="text-gray-300 text-sm sm:text-base">Join competitive leagues and prove your prediction skills</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-400 hover:to-emerald-500 font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg text-sm sm:text-base"
            >
              <Plus className="h-4 w-4" />
              <span>Create League</span>
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center justify-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-400 hover:to-cyan-500 font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg text-sm sm:text-base"
            >
              <Users className="h-4 w-4" />
              <span>Enter Code</span>
            </button>
          </div>
        </div>

        {/* My Leagues */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Trophy className="h-6 w-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-white">My Leagues</h2>
          </div>
          {myLeagues.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">You haven't created or joined any leagues yet</p>
              <p className="text-gray-500 text-sm mt-2">Create a league or join an existing one to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {myLeagues.map((league) => {
                const topMembers = league.members.slice(0, 3);
                const isMember = league.isMember || false;
                const isCommissioner = league.isCommissioner || league.commissioner.id === session?.user?.id;
                const currentUserRank = isMember
                  ? league.members.findIndex((m) => m.user.id === session?.user?.id) + 1
                  : null;
                const currentUserPoints = isMember
                  ? league.members.find((m) => m.user.id === session?.user?.id)?.points || 0
                  : 0;

                return (
                  <div
                    key={league.id}
                    className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                          {league.name}
                        </h3>
                        {league.commissioner.id === session?.user?.id && (
                          <Crown className="h-5 w-5 text-yellow-400" title="You are the commissioner" />
                        )}
                      </div>
                      <p className="text-gray-300 mb-4">
                        Commissioner: {league.commissioner.username}
                      </p>
                      {league.isPrivate && isCommissioner && league.inviteCode && (
                        <div className="mb-4 p-2 bg-blue-500/20 rounded-lg flex items-center justify-between">
                          <span className="text-blue-300 text-sm font-mono">{league.inviteCode}</span>
                          <button
                            onClick={() => copyInviteCode(league.inviteCode!)}
                            className="text-blue-300 hover:text-blue-200"
                          >
                            {copiedCode ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      )}
                      {isCommissioner && !isMember && (
                        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                          <p className="text-yellow-300 text-sm font-semibold mb-1">You are the commissioner</p>
                          <p className="text-yellow-300/70 text-xs">Join this league with a team to participate</p>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-gray-400 mb-6">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{league._count.members}/{league.maxMembers} members</span>
                        </div>
                        {league.match ? (
                        <span>Week {league.match.week} - {league.match.homeTeam?.abbreviation} vs {league.match.awayTeam?.abbreviation}</span>
                      ) : (
                        <span>Season {league.season || 'N/A'}</span>
                      )}
                      </div>

                      {/* Match Info */}
                      {league.match && (
                        <div className="border-t border-white/10 pt-4 mb-4">
                          <p className="text-sm font-semibold mb-2 text-gray-300">Match</p>
                          <p className="text-sm text-white">
                            Week {league.match.week} - {league.match.homeTeam?.abbreviation} vs {league.match.awayTeam?.abbreviation}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(league.match.scheduledAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {/* Mini Standings */}
                      {topMembers.length > 0 && (
                        <div className="border-t border-white/10 pt-4 mb-6">
                          <p className="text-sm font-semibold mb-3 text-gray-300">Top 3</p>
                          <div className="space-y-2 text-sm">
                            {topMembers.map((member, idx) => {
                              const isCurrentUser = member.user.id === session?.user?.id;
                              const rank = idx + 1;
                              return (
                                <div
                                  key={member.user.id}
                                  className={`flex justify-between items-center p-2 rounded-lg ${
                                    rank === 1
                                      ? 'bg-yellow-500/10'
                                      : rank === 2
                                      ? 'bg-gray-500/10'
                                      : 'bg-amber-400/10'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    {rank === 1 ? (
                                      <Star className="h-4 w-4 text-yellow-400" />
                                    ) : (
                                      <span className={isCurrentUser ? 'text-amber-400' : 'text-gray-400'}>
                                        {rank}.
                                      </span>
                                    )}
                                    <span
                                      className={`font-medium ${isCurrentUser ? 'text-amber-400' : 'text-white'}`}
                                    >
                                      {member.user.username}
                                      {isCurrentUser && ' (You)'}
                                    </span>
                                  </div>
                                  <span
                                    className={`font-bold ${rank === 1 ? 'text-yellow-400' : isCurrentUser ? 'text-amber-400' : 'text-white'}`}
                                  >
                                    {member.points} pts
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Link
                          href={`/dashboard/leagues/${league.id}`}
                          className="group/link block w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-center rounded-xl hover:from-blue-400 hover:to-cyan-500 font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                        >
                          <span>View League</span>
                          <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                        
                        {/* Delete Button - Only show for commissioner */}
                        {isCommissioner && (
                          <button
                            onClick={() => {
                              setLeagueToDelete(league);
                              setShowDeleteConfirm(true);
                            }}
                            className="w-full py-2 bg-red-500/20 text-red-400 text-center rounded-xl hover:bg-red-500/30 font-medium border border-red-500/30 hover:border-red-500/50 transition-all duration-200 flex items-center justify-center space-x-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete League</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Join League Card */}
              <div
                onClick={() => setShowJoinModal(true)}
                className="bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center hover:border-white/40 hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                <div className="text-center p-6">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl w-fit mx-auto mb-4">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-gray-300 mb-4 font-medium">Join a new league</p>
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-400 hover:to-cyan-500 font-semibold transform hover:scale-105 transition-all duration-200">
                    Enter Code
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Public Leagues */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <Users className="h-6 w-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-white">Public Leagues</h2>
          </div>
          {publicLeagues.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No public leagues available</p>
              <p className="text-gray-500 text-sm mt-2">Admins will create public leagues here</p>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        League Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Commissioner
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Members
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Prize Pool
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {publicLeagues.map((league) => {
                      const isMember = league.isMember || false;
                      const canJoin = league.canJoin !== false && !isMember;
                      const memberPercentage = (league._count.members / league.maxMembers) * 100;

                      return (
                        <tr key={league.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                                <Users className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <span className="text-white font-medium">{league.name}</span>
                                {league.description && (
                                  <p className="text-gray-400 text-xs mt-1">{league.description}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-300">{league.commissioner.username}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-600 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                                  style={{ width: `${Math.min(memberPercentage, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-gray-300 text-sm">
                                {league._count.members}/{league.maxMembers}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-green-400 font-semibold">
                                {((league.entryFee || 0) * league.maxMembers + (league.basePrizePool || 0)).toFixed(0)} credits
                              </span>
                              <span className="text-gray-400 text-xs">
                                Entry: {league.entryFee || 0} credits
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <Link
                                href={`/dashboard/leagues/${league.id}`}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-400 hover:to-cyan-500 font-semibold transform hover:scale-105 transition-all duration-200"
                              >
                                View
                              </Link>
                              {isMember ? (
                                <span className="px-4 py-2 bg-gray-500/50 text-gray-300 rounded-lg font-semibold">
                                  Joined
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setViewedLeague(league);
                                    setSelectedTeamId('');
                                    setUserTeams([]);
                                    if (league.match?.id) {
                                      fetchUserTeamsForMatch(league.match.id);
                                    }
                                    setShowViewModal(true);
                                  }}
                                  disabled={!canJoin}
                                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-400 hover:to-emerald-500 font-semibold transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Join
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create League Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 w-full max-w-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create Private League</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({ 
                    name: '', 
                    description: '', 
                    matchId: '',
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
            <form onSubmit={handleCreateLeague} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">League Name</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter league name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Describe your league"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Match * <span className="text-xs text-gray-500">(Upcoming games from ESPN)</span>
                </label>
                <select
                  required
                  value={createForm.matchId}
                  onChange={(e) => setCreateForm({ ...createForm, matchId: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select a match</option>
                  {matches.length === 0 ? (
                    <option value="" disabled>No upcoming matches available</option>
                  ) : (
                    matches.map((match) => {
                      const matchDate = new Date(match.scheduledAt);
                      const dateStr = matchDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      return (
                        <option key={match.id} value={match.id}>
                          Week {match.week}, {match.season} • {match.awayTeam.abbreviation} @ {match.homeTeam.abbreviation} • {dateStr}
                        </option>
                      );
                    })
                  )}
                </select>
                {matches.length === 0 && (
                  <p className="text-xs text-yellow-400 mt-2">
                    ⚠️ No upcoming matches found. Run: npx tsx scripts/populate-matches.ts
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Members</label>
                  <input
                    type="number"
                    required
                    min="2"
                    max="100"
                    value={createForm.maxMembers}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, maxMembers: parseInt(e.target.value) })
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
                    value={createForm.entryFee}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, entryFee: parseFloat(e.target.value) || 0 })
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
                  value={createForm.basePrizePool}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, basePrizePool: parseFloat(e.target.value) || 0 })
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
                    onClick={addPrizeTier}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Prize</span>
                  </button>
                </div>
                {createForm.prizeDistribution.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {createForm.prizeDistribution.map((prize, index) => (
                      <div key={index} className="flex space-x-2 items-center">
                        <div className="flex-1">
                          <input
                            type="number"
                            min="1"
                            placeholder="Rank"
                            value={prize.rank || ''}
                            onChange={(e) =>
                              updatePrizeTier(index, 'rank', parseInt(e.target.value) || 0)
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
                              updatePrizeTier(index, 'amount', parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removePrizeTier(index)}
                          className="p-2 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="bg-slate-700/50 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Available Prize Pool:</span>
                    <span className="font-semibold">{calculateTotalAvailablePrizePool()} credits</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Total Prize Distribution:</span>
                    <span className={`font-semibold ${calculateTotalPrizeDistribution() > calculateTotalAvailablePrizePool() ? 'text-red-400' : 'text-green-400'}`}>
                      {calculateTotalPrizeDistribution()} credits
                    </span>
                  </div>
                  {calculateTotalPrizeDistribution() > calculateTotalAvailablePrizePool() && (
                    <p className="text-red-400 text-xs mt-1">
                      ⚠️ Prize distribution exceeds available prize pool
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm({ 
                      name: '', 
                      description: '', 
                      matchId: '',
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
                  disabled={calculateTotalPrizeDistribution() > calculateTotalAvailablePrizePool()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-400 hover:to-emerald-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create League
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enter Code Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Enter Invite Code</h2>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setInviteCode('');
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleViewPrivateLeague} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Invite Code</label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 font-mono text-center text-lg"
                  placeholder="ABC123XYZ"
                  maxLength={15}
                />
                <p className="text-xs text-gray-400 mt-2">
                  Enter the invite code provided by the league commissioner
                </p>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setInviteCode('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-400 hover:to-cyan-500 font-semibold"
                >
                  View League
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Private League Modal */}
      {showViewModal && viewedLeague && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 w-full max-w-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{viewedLeague.name}</h2>
                {viewedLeague.description && (
                  <p className="text-gray-400 text-sm mt-1">{viewedLeague.description}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewedLeague(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Match Info */}
              {viewedLeague.match && (
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                  <p className="text-blue-300 text-sm font-semibold mb-2">Match</p>
                  <p className="text-white font-medium">
                    Week {viewedLeague.match.week} - {viewedLeague.match.homeTeam?.abbreviation} vs {viewedLeague.match.awayTeam?.abbreviation}
                  </p>
                  <p className="text-gray-300 text-sm mt-1">
                    {new Date(viewedLeague.match.scheduledAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Commissioner</p>
                  <p className="text-white font-semibold">{viewedLeague.commissioner.username}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Members</p>
                  <p className="text-white font-semibold">
                    {viewedLeague._count.members}/{viewedLeague.maxMembers}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Entry Fee</p>
                  <p className="text-white font-semibold">{viewedLeague.entryFee || 0} credits</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Prize Pool</p>
                  <p className="text-green-400 font-semibold">
                    {((viewedLeague.entryFee || 0) * viewedLeague.maxMembers + (viewedLeague.basePrizePool || 0)).toFixed(0)} credits
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Members</h3>
                <div className="bg-white/5 rounded-lg overflow-hidden">
                  <div className="divide-y divide-white/10">
                    {viewedLeague.members.map((member, idx) => {
                      const rank = idx + 1;
                      const isCurrentUser = member.user.id === session?.user?.id;
                      return (
                        <div
                          key={member.user.id}
                          className={`p-4 flex justify-between items-center ${
                            isCurrentUser ? 'bg-amber-400/10' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-400 font-semibold w-8">{rank}.</span>
                            <span className={`text-white font-medium ${isCurrentUser ? 'text-amber-400' : ''}`}>
                              {member.user.username}
                              {isCurrentUser && ' (You)'}
                            </span>
                          </div>
                          <span className="text-white font-bold">{member.points} pts</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {viewedLeague.canJoin && !viewedLeague.isMember && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  {/* Credit Balance */}
                  <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-300 text-sm">Your Credits:</span>
                      <span className="text-white font-bold text-lg">{userCredits}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-amber-300 text-sm">Entry Fee:</span>
                      <span className="text-white font-semibold">{viewedLeague.entryFee || 0} credits</span>
                    </div>
                    {userCredits < (viewedLeague.entryFee || 0) && (
                      <p className="text-red-400 text-xs mt-2">
                        ⚠️ You do not have enough credits to join this league
                      </p>
                    )}
                  </div>

                  {/* Team Selection */}
                  {viewedLeague.match && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select Your Team for This Match *
                      </label>
                      {loadingTeams ? (
                        <div className="text-center py-4">
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-amber-400 border-r-transparent"></div>
                        </div>
                      ) : userTeams.length === 0 ? (
                        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                          <p className="text-yellow-300 text-sm">
                            You don't have a team for this match yet.
                          </p>
                          <Link
                            href={`/dashboard/team-builder/${viewedLeague.match.id}`}
                            className="text-blue-400 hover:text-blue-300 text-sm underline mt-2 inline-block"
                          >
                            Create a team first
                          </Link>
                        </div>
                      ) : (
                        <select
                          value={selectedTeamId}
                          onChange={(e) => setSelectedTeamId(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          {userTeams.map((team) => (
                            <option key={team.id} value={team.id}>
                              {team.teamName || `Team ${team.id.slice(0, 8)}`} - {Math.round(team.totalPoints || 0)} pts
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-4 pt-2">
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setViewedLeague(null);
                        setSelectedTeamId('');
                        setUserTeams([]);
                      }}
                      className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (viewedLeague.isPrivate) {
                          handleJoinPrivateLeague();
                        } else {
                          handleJoinLeague(viewedLeague.id);
                        }
                      }}
                      disabled={
                        !selectedTeamId || 
                        userTeams.length === 0 || 
                        userCredits < (viewedLeague.entryFee || 0) ||
                        loadingTeams
                      }
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-400 hover:to-emerald-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Join League ({viewedLeague.entryFee || 0} credits)
                    </button>
                  </div>
                </div>
              )}

              {viewedLeague.isMember && (
                <Link
                  href={`/dashboard/leagues/${viewedLeague.id}`}
                  className="block w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-center rounded-lg hover:from-blue-400 hover:to-cyan-500 font-semibold"
                >
                  View Full Details
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && leagueToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-slate-800 border border-red-500/30 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <Trash2 className="h-6 w-6 text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Delete League?</h2>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setLeagueToDelete(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  Are you sure you want to delete the league <span className="font-bold text-white">"{leagueToDelete.name}"</span>?
                </p>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-300 text-sm font-semibold mb-2">⚠️ This action cannot be undone!</p>
                  <ul className="text-red-200 text-sm space-y-1">
                    <li>• All league data will be permanently deleted</li>
                    <li>• Members will be removed from the league</li>
                    <li>• League standings will be lost</li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setLeagueToDelete(null);
                  }}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteLeague}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Delete League</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
