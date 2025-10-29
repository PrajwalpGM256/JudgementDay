import Link from "next/link";
import sampleData from "@/data/sample-data.json";
import { Scale, Home, Trophy, Target, LogOut, User, Plus, Users, Crown, Star, ArrowRight } from "lucide-react";

export default function LeaguesPage() {
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
                <Link href="/dashboard/leagues" className="flex items-center space-x-2 text-amber-400 font-semibold">
                  <Trophy className="h-4 w-4" />
                  <span>Leagues</span>
                </Link>
                <Link href="/dashboard/picks" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
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
            <h1 className="text-4xl font-bold text-white mb-2">Leagues</h1>
            <p className="text-gray-300">Join competitive leagues and prove your prediction skills</p>
          </div>
          <div className="flex space-x-4">
            <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-400 hover:to-emerald-500 font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg">
              <Plus className="h-4 w-4" />
              <span>Create League</span>
            </button>
            <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-400 hover:to-cyan-500 font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg">
              <Users className="h-4 w-4" />
              <span>Join League</span>
            </button>
          </div>
        </div>

        {/* My Leagues */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Trophy className="h-6 w-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-white">My Leagues</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {sampleData.sampleLeagues.map(league => (
              <div key={league.id} className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">{league.name}</h3>
                    <Crown className="h-5 w-5 text-yellow-400" />
                  </div>
                  <p className="text-gray-300 mb-4">Commissioner: {league.commissioner}</p>
                  <div className="flex justify-between text-sm text-gray-400 mb-6">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{league.members} members</span>
                    </div>
                    <span>Week 10</span>
                  </div>
                  
                  {/* Mini Standings */}
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-sm font-semibold mb-3 text-gray-300">Top 3</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center p-2 bg-yellow-500/10 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-white font-medium">AlphaPicker</span>
                        </div>
                        <span className="font-bold text-yellow-400">156 pts</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-500/10 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">2.</span>
                          <span className="text-white font-medium">GridironGuru</span>
                        </div>
                        <span className="font-bold text-white">143 pts</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-amber-400/10 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-amber-400">3.</span>
                          <span className="text-amber-400 font-semibold">You</span>
                        </div>
                        <span className="font-bold text-amber-400">132 pts</span>
                      </div>
                    </div>
                  </div>

                  <Link 
                    href={`/dashboard/leagues/${league.id}`}
                    className="group/link block mt-6 w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-center rounded-xl hover:from-blue-400 hover:to-cyan-500 font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span>View League</span>
                    <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}

            {/* Join League Card */}
            <div className="bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center hover:border-white/40 hover:bg-white/10 transition-all duration-300">
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
        </div>

        {/* Public Leagues */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <Users className="h-6 w-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-white">Public Leagues</h2>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">League Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Members</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Entry</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-white font-medium">Reddit r/NFL League</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-600 rounded-full h-2">
                          <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{width: '84.7%'}}></div>
                        </div>
                        <span className="text-gray-300 text-sm">847/1000</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">Free</span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-400 hover:to-cyan-500 font-semibold transform hover:scale-105 transition-all duration-200">
                        Join
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                          <Star className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-white font-medium">Beginners League</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-600 rounded-full h-2">
                          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2 rounded-full" style={{width: '78%'}}></div>
                        </div>
                        <span className="text-gray-300 text-sm">156/200</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">Free</span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-400 hover:to-cyan-500 font-semibold transform hover:scale-105 transition-all duration-200">
                        Join
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}