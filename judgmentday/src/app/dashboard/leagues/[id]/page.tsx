'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { ArrowLeft, Trophy, Users, Crown, Medal, Copy, Check, Lock, Globe, X, Coins } from 'lucide-react';
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
  canJoin?: boolean;
}

export default function LeagueDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const leagueId = params?.id as string;

  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && leagueId) {
      fetchLeague();
      fetchUserCredits();
    }
  }, [status, router, leagueId]);

  useEffect(() => {
    if (league?.match?.id) {
      const isMember = league.isMember !== false;
      const canJoin = league.canJoin !== false && !isMember;
      if (canJoin || showJoinModal) {
        fetchUserTeamsForMatch(league.match.id);
      }
    }
  }, [league, showJoinModal]);

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

  const fetchLeague = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leagues/${leagueId}`);
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('This is a private league. Please use invite code to view.');
          router.push('/dashboard/leagues');
          return;
        }
        throw new Error('Failed to fetch league');
      }
      const data = await response.json();
      setLeague(data.league);
    } catch (error: any) {
      console.error('Error fetching league:', error);
      toast.error(error.message || 'Failed to load league');
      router.push('/dashboard/leagues');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeague = async () => {
    if (!league) return;

    if (!selectedTeamId) {
      toast.error('Please select a team to join this league');
      return;
    }

    try {
      const response = await fetch('/api/leagues', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          leagueId: league.isPrivate ? undefined : league.id,
          inviteCode: league.isPrivate ? league.inviteCode : undefined,
          userTeamId: selectedTeamId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join league');
      }

      const data = await response.json();
      toast.success('Successfully joined league!');
      setShowJoinModal(false);
      setSelectedTeamId('');
      setUserTeams([]);
      await fetchLeague();
      await fetchUserCredits();
      window.dispatchEvent(new Event('creditsUpdated'));
    } catch (error: any) {
      toast.error(error.message || 'Failed to join league');
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success('Invite code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-400 border-r-transparent"></div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">League not found</p>
            <Link
              href="/dashboard/leagues"
              className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-400 hover:to-cyan-500 font-semibold"
            >
              Back to Leagues
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCommissioner = league.commissioner.id === session?.user?.id;
  const isMember = league.isMember !== false;
  const canJoin = league.canJoin !== false && !isMember;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        <Link
          href="/dashboard/leagues"
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Leagues</span>
        </Link>

        {/* League Header */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-4xl font-bold text-white">{league.name}</h1>
                {league.isPrivate ? (
                  <Lock className="h-6 w-6 text-blue-400" title="Private League" />
                ) : (
                  <Globe className="h-6 w-6 text-green-400" title="Public League" />
                )}
                {isCommissioner && (
                  <Crown className="h-6 w-6 text-yellow-400" title="You are the commissioner" />
                )}
              </div>
              {league.description && (
                <p className="text-gray-300 text-lg mb-4">{league.description}</p>
              )}
            </div>
          </div>

          {/* Match Info */}
          {league.match && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
              <p className="text-blue-300 text-sm font-semibold mb-2">Match</p>
              <p className="text-white font-medium">
                Week {league.match.week} - {league.match.homeTeam?.abbreviation} vs {league.match.awayTeam?.abbreviation}
              </p>
              <p className="text-gray-300 text-sm mt-1">
                {new Date(league.match.scheduledAt).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Commissioner</p>
              <p className="text-white font-semibold">{league.commissioner.username}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Members</p>
              <p className="text-white font-semibold">
                {league._count.members}/{league.maxMembers}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Entry Fee</p>
              <p className="text-white font-semibold">{league.entryFee || 0} credits</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Prize Pool</p>
              <p className="text-green-400 font-semibold">
                {((league.entryFee || 0) * league.maxMembers + (league.basePrizePool || 0)).toFixed(0)} credits
              </p>
            </div>
          </div>

          {/* Invite Code (only for commissioner of private leagues) */}
          {league.isPrivate && isCommissioner && league.inviteCode && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-semibold mb-1">Invite Code</p>
                <p className="text-blue-100 font-mono text-lg">{league.inviteCode}</p>
              </div>
              <button
                onClick={() => copyInviteCode(league.inviteCode!)}
                className="px-4 py-2 bg-blue-500/50 hover:bg-blue-500/70 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Join Button for non-members */}
          {canJoin && (
            <div className="mt-6">
              <button
                onClick={() => setShowJoinModal(true)}
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-400 hover:to-emerald-500 font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Join League
              </button>
            </div>
          )}
        </div>

        {/* Standings */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Trophy className="h-6 w-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-white">Standings</h2>
          </div>

          {league.members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No members yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {league.members.map((member, index) => {
                    const rank = index + 1;
                    const isCurrentUser = member.user.id === session?.user?.id;
                    const getRankIcon = () => {
                      if (rank === 1) return <Medal className="h-5 w-5 text-yellow-400" />;
                      if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
                      if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
                      return null;
                    };

                    return (
                      <tr
                        key={member.user.id}
                        className={`hover:bg-white/5 transition-colors ${
                          isCurrentUser ? 'bg-amber-400/10' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getRankIcon()}
                            <span
                              className={`font-bold ${
                                rank === 1
                                  ? 'text-yellow-400'
                                  : rank === 2
                                  ? 'text-gray-400'
                                  : rank === 3
                                  ? 'text-amber-600'
                                  : isCurrentUser
                                  ? 'text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              {rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                                rank === 1
                                  ? 'bg-yellow-400'
                                  : rank === 2
                                  ? 'bg-gray-400'
                                  : rank === 3
                                  ? 'bg-amber-600'
                                  : 'bg-slate-600'
                              }`}
                            >
                              {member.user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p
                                className={`font-semibold ${isCurrentUser ? 'text-amber-400' : 'text-white'}`}
                              >
                                {member.user.username}
                                {isCurrentUser && ' (You)'}
                              </p>
                              {isCommissioner && member.user.id === league.commissioner.id && (
                                <p className="text-xs text-yellow-400">Commissioner</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`font-bold text-lg ${
                              rank === 1
                                ? 'text-yellow-400'
                                : isCurrentUser
                                ? 'text-amber-400'
                                : 'text-white'
                            }`}
                          >
                            {member.points}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Join League Modal */}
        {showJoinModal && league && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Join League</h2>
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setSelectedTeamId('');
                    setUserTeams([]);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                  <p className="text-blue-300 font-semibold mb-2">{league.name}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-200">Entry Fee:</span>
                    <span className="text-blue-100 font-semibold flex items-center space-x-1">
                      <Coins className="h-4 w-4" />
                      <span>{league.entryFee || 0} credits</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-blue-200">Your Credits:</span>
                    <span className="text-blue-100 font-semibold flex items-center space-x-1">
                      <Coins className="h-4 w-4" />
                      <span>{userCredits} credits</span>
                    </span>
                  </div>
                  {userCredits < (league.entryFee || 0) && (
                    <p className="text-red-400 text-xs mt-2">
                      ⚠️ You do not have enough credits to join this league
                    </p>
                  )}
                </div>

                {league.match && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Your Team
                    </label>
                    {loadingTeams ? (
                      <div className="text-center py-4">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-amber-400 border-r-transparent"></div>
                      </div>
                    ) : userTeams.length === 0 ? (
                      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-center">
                        <p className="text-yellow-300 text-sm mb-2">
                          You don't have any teams for this match yet.
                        </p>
                        <Link
                          href={`/dashboard/team-builder/${league.match.id}`}
                          className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold underline"
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
                        <option value="">Select a team...</option>
                        {userTeams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.teamName || `Team ${team.id.slice(0, 8)}`} ({team.totalPoints} pts)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinModal(false);
                      setSelectedTeamId('');
                      setUserTeams([]);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinLeague}
                    disabled={
                      !selectedTeamId ||
                      userTeams.length === 0 ||
                      userCredits < (league.entryFee || 0) ||
                      loadingTeams
                    }
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-400 hover:to-emerald-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Join League
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

