import Link from "next/link";
import sampleData from "@/data/sample-data.json";
import { Scale, Home, Trophy, Target, LogOut, User, TrendingUp, Award, Calendar, Users } from "lucide-react";

export default function DashboardPage() {
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
                <Link href="/dashboard" className="flex items-center space-x-2 text-amber-400 font-semibold">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/dashboard/leagues" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
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

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-300">Welcome back! Here's your NFL prediction overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                <Award className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-gray-300 text-sm mb-1">Total Points</p>
            <p className="text-3xl font-bold text-white mb-1">156</p>
            <p className="text-xs text-gray-400">Rank #3 of 12</p>
          </div>
          
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="text-green-400 text-sm font-semibold">+12.5%</span>
            </div>
            <p className="text-gray-300 text-sm mb-1">This Week</p>
            <p className="text-3xl font-bold text-white mb-1">12-4</p>
            <p className="text-xs text-gray-400">75% accuracy</p>
          </div>
          
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-yellow-400 text-sm font-semibold">Hot!</span>
            </div>
            <p className="text-gray-300 text-sm mb-1">Current Streak</p>
            <p className="text-3xl font-bold text-white mb-1">W3</p>
            <p className="text-xs text-gray-400">3 wins in a row</p>
          </div>
          
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <span className="text-purple-400 text-sm font-semibold">Best!</span>
            </div>
            <p className="text-gray-300 text-sm mb-1">Best Week</p>
            <p className="text-3xl font-bold text-white mb-1">14</p>
            <p className="text-xs text-gray-400">Week 7 performance</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* My Leagues */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <Trophy className="h-6 w-6 text-amber-400" />
                <h2 className="text-xl font-bold text-white">My Leagues</h2>
              </div>
            </div>
            <div className="p-6">
              {sampleData.sampleLeagues.map(league => (
                <Link 
                  key={league.id}
                  href={`/dashboard/leagues/${league.id}`}
                  className="group block p-4 hover:bg-white/5 rounded-xl transition-all duration-200 mb-3 border border-white/5 hover:border-white/20"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white group-hover:text-amber-400 transition-colors">{league.name}</p>
                      <p className="text-sm text-gray-400">{league.members} members</p>
                    </div>
                    <span className="text-amber-400 group-hover:translate-x-1 transition-transform">View →</span>
                  </div>
                </Link>
              ))}
              <Link 
                href="/dashboard/leagues"
                className="block mt-4 text-center py-3 text-amber-400 hover:text-amber-300 font-semibold border border-amber-400/20 rounded-xl hover:border-amber-400/40 hover:bg-amber-400/5 transition-all duration-200"
              >
                + Join New League
              </Link>
            </div>
          </div>

          {/* This Week's Picks */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <Target className="h-6 w-6 text-amber-400" />
                <h2 className="text-xl font-bold text-white">Week 10 Picks Status</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <span className="text-white font-medium">Cowboys vs Eagles</span>
                  <span className="text-green-400 font-bold">W (+16)</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <span className="text-white font-medium">Packers vs Bears</span>
                  <span className="text-red-400 font-bold">L (0)</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-500/10 border border-gray-500/20 rounded-xl">
                  <span className="text-white font-medium">49ers vs Seahawks</span>
                  <span className="text-gray-400">Sun 4:25 PM</span>
                </div>
              </div>
              <Link 
                href="/dashboard/picks"
                className="block mt-6 w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold text-center rounded-xl hover:from-amber-300 hover:to-orange-400 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Update Picks for Week 11
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}