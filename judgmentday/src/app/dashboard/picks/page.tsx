"use client";
import { useState } from "react";
import Link from "next/link";
import sampleData from "@/data/sample-data.json";

export default function PicksPage() {
  const [selectedPicks, setSelectedPicks] = useState<Record<string, string>>({});
  const [confidencePoints, setConfidencePoints] = useState<Record<string, number>>({});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-2xl font-bold">
                ⚖️ JudgmentDay
              </Link>
              <div className="flex space-x-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/dashboard/leagues" className="text-gray-600 hover:text-blue-600">
                  Leagues
                </Link>
                <Link href="/dashboard/picks" className="text-blue-600 font-medium">
                  Make Picks
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">John Doe</span>
              <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Week 11 Picks</h1>
            <p className="text-gray-600 mt-2">Deadline: Sunday, Nov 17 at 1:00 PM EST</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Time Remaining</p>
            <p className="text-2xl font-bold text-red-600">2d 14h 32m</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Games List */}
          <div className="md:col-span-2 space-y-4">
            {sampleData.weeks[0].games.map((game, index) => (
              <div key={game.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">{game.time}</span>
                  <select 
                    className="px-3 py-1 border rounded-lg text-sm"
                    value={confidencePoints[game.id] || ''}
                    onChange={(e) => setConfidencePoints({
                      ...confidencePoints,
                      [game.id]: parseInt(e.target.value)
                    })}
                  >
                    <option value="">Confidence</option>
                    {Array.from({length: 16}, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} points</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedPicks({...selectedPicks, [game.id]: game.away})}
                    className={`p-4 rounded-lg border-2 transition ${
                      selectedPicks[game.id] === game.away 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold">{game.away}</p>
                    <p className="text-sm text-gray-600">@ {game.home}</p>
                  </button>
                  
                  <button
                    onClick={() => setSelectedPicks({...selectedPicks, [game.id]: game.home})}
                    className={`p-4 rounded-lg border-2 transition ${
                      selectedPicks[game.id] === game.home 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold">{game.home}</p>
                    <p className="text-sm text-gray-600">vs {game.away}</p>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Picks Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Your Picks Summary</h2>
              
              <div className="space-y-2 mb-6">
                {Object.entries(selectedPicks).map(([gameId, team]) => {
                  const game = sampleData.weeks[0].games.find(g => g.id === gameId);
                  const points = confidencePoints[gameId];
                  return (
                    <div key={gameId} className="flex justify-between text-sm">
                      <span>{team}</span>
                      <span className={points ? "font-semibold" : "text-gray-400"}>
                        {points || "-"} pts
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span>Games Picked:</span>
                  <span className="font-semibold">{Object.keys(selectedPicks).length}/16</span>
                </div>
                <div className="flex justify-between">
                  <span>Points Assigned:</span>
                  <span className="font-semibold">
                    {Object.values(confidencePoints).reduce((a, b) => a + b, 0)}/136
                  </span>
                </div>
              </div>

              <button className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                Submit Picks
              </button>
              
              <button className="w-full py-2 mt-2 text-gray-600 hover:text-gray-800">
                Save Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}