import Link from "next/link";
import sampleData from "@/data/sample-data.json";

export default function DashboardPage() {
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
                <Link href="/dashboard" className="text-blue-600 font-medium">
                  Dashboard
                </Link>
                <Link href="/dashboard/leagues" className="text-gray-600 hover:text-blue-600">
                  Leagues
                </Link>
                <Link href="/dashboard/picks" className="text-gray-600 hover:text-blue-600">
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Points</p>
            <p className="text-3xl font-bold text-blue-600">156</p>
            <p className="text-xs text-gray-500 mt-1">Rank #3 of 12</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">This Week</p>
            <p className="text-3xl font-bold text-green-600">12-4</p>
            <p className="text-xs text-gray-500 mt-1">75% accuracy</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Current Streak</p>
            <p className="text-3xl font-bold text-yellow-600">W3</p>
            <p className="text-xs text-gray-500 mt-1">3 wins in a row</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Best Week</p>
            <p className="text-3xl font-bold text-purple-600">14</p>
            <p className="text-xs text-gray-500 mt-1">Week 7 performance</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* My Leagues */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">My Leagues</h2>
            </div>
            <div className="p-6">
              {sampleData.sampleLeagues.map(league => (
                <Link 
                  key={league.id}
                  href={`/dashboard/leagues/${league.id}`}
                  className="block p-4 hover:bg-gray-50 rounded-lg transition mb-2"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{league.name}</p>
                      <p className="text-sm text-gray-600">{league.members} members</p>
                    </div>
                    <span className="text-blue-600">View →</span>
                  </div>
                </Link>
              ))}
              <Link 
                href="/dashboard/leagues"
                className="block mt-4 text-center py-2 text-blue-600 hover:text-blue-700"
              >
                + Join New League
              </Link>
            </div>
          </div>

          {/* This Week's Picks */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Week 10 Picks Status</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span>Cowboys vs Eagles</span>
                  <span className="text-green-600 font-semibold">W (+16)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <span>Packers vs Bears</span>
                  <span className="text-red-600 font-semibold">L (0)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>49ers vs Seahawks</span>
                  <span className="text-gray-600">Sun 4:25 PM</span>
                </div>
              </div>
              <Link 
                href="/dashboard/picks"
                className="block mt-6 w-full py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700"
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