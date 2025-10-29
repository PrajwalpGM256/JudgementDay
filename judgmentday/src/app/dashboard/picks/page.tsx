"use client";
import { useState } from "react";
import sampleData from "@/data/sample-data.json";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function PicksPage() {
  const [selectedPicks, setSelectedPicks] = useState<Record<string, string>>({});
  const [confidencePoints, setConfidencePoints] = useState<Record<string, number>>({});
  
  const currentWeek = sampleData.weeks[0];
  const userStanding = sampleData.sampleStandings[2]; // TouchdownTom
  const totalGames = currentWeek.games.length;
  const maxPoints = (totalGames * (totalGames + 1)) / 2; // Sum of 1 to n

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar userName={userStanding.user} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Week {currentWeek.week} Picks</h1>
            <p className="text-gray-400 mt-2">Deadline: Sunday, Nov 17 at 1:00 PM EST</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Time Remaining</p>
            <p className="text-2xl font-bold text-red-400">2d 14h 32m</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Games List */}
          <div className="md:col-span-2 space-y-4">
            {currentWeek.games.map((game) => (
              <Card key={game.id}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-400">{game.time}</span>
                  <select 
                    className="px-3 py-1 border border-slate-600 bg-slate-700 rounded-lg text-sm text-white font-medium focus:outline-none focus:border-yellow-500"
                    value={confidencePoints[game.id] || ''}
                    onChange={(e) => setConfidencePoints({
                      ...confidencePoints,
                      [game.id]: parseInt(e.target.value)
                    })}
                  >
                    <option value="">Confidence</option>
                    {Array.from({length: totalGames}, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} points</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedPicks({...selectedPicks, [game.id]: game.away})}
                    className={`p-4 rounded-lg border-2 transition ${
                      selectedPicks[game.id] === game.away 
                        ? 'border-yellow-500 bg-yellow-500/10' 
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <p className="font-bold text-white">{game.away}</p>
                    <p className="text-sm text-gray-400">@ {game.home}</p>
                  </button>
                  
                  <button
                    onClick={() => setSelectedPicks({...selectedPicks, [game.id]: game.home})}
                    className={`p-4 rounded-lg border-2 transition ${
                      selectedPicks[game.id] === game.home 
                        ? 'border-yellow-500 bg-yellow-500/10' 
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <p className="font-bold text-white">{game.home}</p>
                    <p className="text-sm text-gray-400">vs {game.away}</p>
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Picks Summary */}
          <div className="md:col-span-1">
            <Card className="sticky top-4">
              <h2 className="text-xl font-bold mb-4 text-white">Your Picks Summary</h2>
              
              <div className="space-y-2 mb-6">
                {Object.entries(selectedPicks).map(([gameId, team]) => {
                  const points = confidencePoints[gameId];
                  return (
                    <div key={gameId} className="flex justify-between text-sm">
                      <span className="text-gray-200 font-medium">{team}</span>
                      <span className={points ? "font-semibold text-white" : "text-gray-500"}>
                        {points || "-"} pts
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-700 pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Games Picked:</span>
                  <span className="font-semibold text-white">{Object.keys(selectedPicks).length}/{totalGames}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Points Assigned:</span>
                  <span className="font-semibold text-white">
                    {Object.values(confidencePoints).reduce((a, b) => a + b, 0)}/{maxPoints}
                  </span>
                </div>
              </div>

              <Button variant="success" className="w-full bg-green-600 hover:bg-green-700">
                Submit Picks
              </Button>
              
              <button className="w-full py-2 mt-2 text-gray-400 hover:text-gray-200">
                Save Draft
              </button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}