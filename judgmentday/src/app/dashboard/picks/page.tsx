"use client";
import { useState } from "react";
import Link from "next/link";
import sampleData from "@/data/sample-data.json";
import { Scale, Home, Trophy, Target, LogOut, User, Clock, CheckCircle, AlertCircle, Save } from "lucide-react";

export default function PicksPage() {
  const [selectedPicks, setSelectedPicks] = useState<Record<string, string>>({});
  const [confidencePoints, setConfidencePoints] = useState<Record<string, number>>({});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-lg">
                  <Scale className="h-6 w-6 text-slate-900" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  JudgmentDay
                </span>
              </Link>
              <div className="flex space-x-8">
                <Link href="/dashboard" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/dashboard/leagues" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <Trophy className="h-4 w-4" />
                  <span>Leagues</span>
                </Link>
                <Link href="/dashboard/picks" className="flex items-center space-x-2 text-amber-400 font-semibold">
                  <Target className="h-4 w-4" />
                  <span>Make Picks</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-white/5 rounded-lg">
                <User className="h-4 w-4 text-gray-300" />
                <span className="text-gray-300">John Doe</span>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Week 11 Picks</h1>
            <p className="text-gray-300">Deadline: Sunday, Nov 17 at 1:00 PM EST</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-gray-300 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Time Remaining</span>
            </div>
            <p className="text-2xl font-bold text-red-400">2d 14h 32m</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Games List */}
          <div className="md:col-span-2 space-y-6">
            {sampleData.weeks[0].games.map((game, index) => (
              <div key={game.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{game.time}</span>
                  </div>
                  <select 
                    className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl text-sm focus:outline-none focus:border-amber-400 transition-colors"
                    value={confidencePoints[game.id] || ''}
                    onChange={(e) => setConfidencePoints({
                      ...confidencePoints,
                      [game.id]: parseInt(e.target.value)
                    })}
                  >
                    <option value="" className="bg-slate-800">Confidence</option>
                    {Array.from({length: 16}, (_, i) => i + 1).map(num => (
                      <option key={num} value={num} className="bg-slate-800">{num} points</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedPicks({...selectedPicks, [game.id]: game.away})}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      selectedPicks[game.id] === game.away 
                        ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/20' 
                        : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    }`}
                  >
                    <p className="font-bold text-white text-lg">{game.away}</p>
                    <p className="text-sm text-gray-400">@ {game.home}</p>
                  </button>
                  
                  <button
                    onClick={() => setSelectedPicks({...selectedPicks, [game.id]: game.home})}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      selectedPicks[game.id] === game.home 
                        ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/20' 
                        : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    }`}
                  >
                    <p className="font-bold text-white text-lg">{game.home}</p>
                    <p className="text-sm text-gray-400">vs {game.away}</p>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Picks Summary */}
          <div className="md:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sticky top-4">
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle className="h-6 w-6 text-amber-400" />
                <h2 className="text-xl font-bold text-white">Your Picks Summary</h2>
              </div>
              
              <div className="space-y-3 mb-6">
                {Object.entries(selectedPicks).map(([gameId, team]) => {
                  const game = sampleData.weeks[0].games.find(g => g.id === gameId);
                  const points = confidencePoints[gameId];
                  return (
                    <div key={gameId} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <span className="text-white font-medium">{team}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        points ? "bg-amber-400/20 text-amber-400" : "bg-gray-500/20 text-gray-400"
                      }`}>
                        {points || "-"} pts
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/10 pt-4 mb-6">
                <div className="flex justify-between mb-3">
                  <span className="text-gray-300">Games Picked:</span>
                  <span className="font-bold text-white">{Object.keys(selectedPicks).length}/16</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Points Assigned:</span>
                  <span className="font-bold text-white">
                    {Object.values(confidencePoints).reduce((a, b) => a + b, 0)}/136
                  </span>
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-400 hover:to-emerald-500 font-bold transform hover:scale-105 transition-all duration-200 shadow-lg mb-3">
                Submit Picks
              </button>
              
              <button className="w-full py-3 text-gray-300 hover:text-white border border-white/20 rounded-xl hover:border-white/40 hover:bg-white/5 transition-all duration-200 flex items-center justify-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save Draft</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}