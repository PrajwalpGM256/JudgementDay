'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { DollarSign, Users, TrendingUp, AlertCircle, CheckCircle, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

interface Player {
  id: string;
  name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
  price: number;
  avgPoints: number;
  jerseyNumber: number;
  team: {
    name: string;
    abbreviation: string;
  };
}

interface SelectedPlayer extends Player {
  slotPosition: string;
}

const POSITION_REQUIREMENTS = {
  QB: { required: 1, label: 'Quarterback' },
  RB: { required: 2, label: 'Running Back' },
  WR: { required: 2, label: 'Wide Receiver' },
  TE: { required: 1, label: 'Tight End' },
  K: { required: 1, label: 'Kicker' },
  DEF: { required: 1, label: 'Defense' },
};

const BUDGET_LIMIT = 75;
const MAX_PLAYERS_PER_TEAM = 4;

export default function TeamBuilderPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    fetchPlayers();
  }, [filterPosition]);

  const fetchPlayers = async () => {
    try {
      const positionParam = filterPosition !== 'all' ? `?position=${filterPosition}` : '';
      const response = await fetch(`/api/players${positionParam}`);
      const data = await response.json();
      setPlayers(data.players || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const getTotalCost = () => {
    return selectedPlayers.reduce((sum, player) => sum + player.price, 0);
  };

  const getRemainingBudget = () => {
    return BUDGET_LIMIT - getTotalCost();
  };

  const getPositionCount = (position: string) => {
    return selectedPlayers.filter((p) => p.position === position).length;
  };

  const getTeamCount = (teamId: string) => {
    return selectedPlayers.filter((p) => p.team.abbreviation === teamId).length;
  };

  const canAddPlayer = (player: Player): { canAdd: boolean; reason?: string } => {
    // Check if already selected
    if (selectedPlayers.find((p) => p.id === player.id)) {
      return { canAdd: false, reason: 'Player already selected' };
    }

    // Check budget
    if (getTotalCost() + player.price > BUDGET_LIMIT) {
      return { canAdd: false, reason: 'Exceeds budget limit' };
    }

    // Check position limit
    const positionReq = POSITION_REQUIREMENTS[player.position];
    if (getPositionCount(player.position) >= positionReq.required) {
      return { canAdd: false, reason: `Already have ${positionReq.required} ${player.position}(s)` };
    }

    // Check team limit
    if (getTeamCount(player.team.abbreviation) >= MAX_PLAYERS_PER_TEAM) {
      return {
        canAdd: false,
        reason: `Max ${MAX_PLAYERS_PER_TEAM} players from same team`,
      };
    }

    return { canAdd: true };
  };

  const addPlayer = (player: Player) => {
    const check = canAddPlayer(player);
    if (!check.canAdd) {
      toast.error(check.reason || 'Cannot add player');
      return;
    }

    const slotPosition = `${player.position}-${getPositionCount(player.position) + 1}`;
    setSelectedPlayers([...selectedPlayers, { ...player, slotPosition }]);
    toast.success(`Added ${player.name}`);
  };

  const removePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter((p) => p.id !== playerId));
    toast.success('Player removed');
  };

  const isTeamValid = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check if all positions are filled
    Object.entries(POSITION_REQUIREMENTS).forEach(([position, req]) => {
      const count = getPositionCount(position);
      if (count < req.required) {
        errors.push(`Need ${req.required - count} more ${position}(s)`);
      }
    });

    if (selectedPlayers.length === 0) {
      errors.push('No players selected');
    }

    return { valid: errors.length === 0, errors };
  };

  const handleSubmit = async () => {
    const validation = isTeamValid();
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/user-teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: matchId,
          teamName: teamName || 'My Team',
          players: selectedPlayers.map((p) => ({
            playerId: p.id,
            position: p.position,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create team');
      }

      toast.success('Team created successfully!');
      router.push('/dashboard/matches');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Navbar />
      
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 py-6">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold text-white mb-2">Build Your Team</h1>
          <p className="text-gray-300">Select your fantasy lineup within budget</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Players List */}
          <div className="lg:col-span-2">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['all', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setFilterPosition(pos)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    filterPosition === pos
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {pos === 'all' ? 'All Players' : pos}
                </button>
              ))}
            </div>

            {/* Players Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-400 border-r-transparent"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {players.map((player) => {
                  const check = canAddPlayer(player);
                  const isSelected = selectedPlayers.find((p) => p.id === player.id);

                  return (
                    <div
                      key={player.id}
                      className={`bg-white/5 backdrop-blur-sm border rounded-xl p-4 transition-all duration-200 ${
                        isSelected
                          ? 'border-green-500/50 bg-green-500/10'
                          : 'border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              #{player.jerseyNumber}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">{player.name}</p>
                            <p className="text-sm text-gray-400">
                              {player.position} • {player.team.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-amber-400 font-bold">${player.price.toFixed(1)}</p>
                            <p className="text-xs text-gray-400">{player.avgPoints.toFixed(1)} pts</p>
                          </div>

                          {isSelected ? (
                            <button
                              onClick={() => removePlayer(player.id)}
                              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => addPlayer(player)}
                              disabled={!check.canAdd}
                              className={`px-4 py-2 rounded-lg transition-colors ${
                                check.canAdd
                                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:from-amber-300 hover:to-orange-400'
                                  : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                              }`}
                              title={check.reason}
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Team Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Budget Card */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <DollarSign className="h-6 w-6 text-amber-400" />
                  <h3 className="text-xl font-bold text-white">Budget</h3>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Cost:</span>
                    <span className="text-white font-bold">${getTotalCost().toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Remaining:</span>
                    <span
                      className={`font-bold ${
                        getRemainingBudget() < 0 ? 'text-red-400' : 'text-green-400'
                      }`}
                    >
                      ${getRemainingBudget().toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      getTotalCost() > BUDGET_LIMIT
                        ? 'bg-red-500'
                        : 'bg-gradient-to-r from-amber-400 to-orange-500'
                    }`}
                    style={{ width: `${Math.min((getTotalCost() / BUDGET_LIMIT) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Selected Team */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="h-6 w-6 text-amber-400" />
                  <h3 className="text-xl font-bold text-white">Your Team</h3>
                </div>

                <input
                  type="text"
                  placeholder="Team Name (optional)"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 mb-4"
                />

                <div className="space-y-3 mb-6">
                  {Object.entries(POSITION_REQUIREMENTS).map(([position, req]) => {
                    const posPlayers = selectedPlayers.filter((p) => p.position === position);
                    const filled = posPlayers.length >= req.required;

                    return (
                      <div key={position} className="border-b border-white/10 pb-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-300">{req.label}</span>
                          <span className="text-xs text-gray-400">
                            {posPlayers.length}/{req.required}
                          </span>
                        </div>
                        {posPlayers.map((player) => (
                          <div
                            key={player.id}
                            className="flex justify-between items-center text-sm py-1"
                          >
                            <span className="text-white">{player.name}</span>
                            <span className="text-amber-400">${player.price.toFixed(1)}</span>
                          </div>
                        ))}
                        {posPlayers.length < req.required && (
                          <p className="text-xs text-gray-500 italic">
                            Select {req.required - posPlayers.length} more
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!isTeamValid().valid || submitting}
                  className={`w-full py-3 rounded-xl font-bold transition-all duration-200 ${
                    isTeamValid().valid && !submitting
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:from-amber-300 hover:to-orange-400 transform hover:scale-105'
                      : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'Creating Team...' : 'Create Team'}
                </button>

                {!isTeamValid().valid && selectedPlayers.length > 0 && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-400">
                        {isTeamValid().errors.map((error, i) => (
                          <div key={i}>• {error}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

