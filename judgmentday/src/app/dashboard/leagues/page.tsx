import Link from "next/link";
import sampleData from "@/data/sample-data.json";

export default function LeaguesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Reuse Navigation from Dashboard */}
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
                <Link href="/dashboard/leagues" className="text-blue-600 font-medium">
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

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Leagues</h1>
          <div className="space-x-4">
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Create League
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Join League
            </button>
          </div>
        </div>

        {/* My Leagues */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4">My Leagues</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {sampleData.sampleLeagues.map(league => (
              <div key={league.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{league.name}</h3>
                  <p className="text-gray-600 mb-4">Commissioner: {league.commissioner}</p>
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>{league.members} members</span>
                    <span>Week 10</span>
                  </div>
                  
                  {/* Mini Standings */}
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-2">Top 3</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>1. AlphaPicker</span>
                        <span className="font-semibold">156 pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2. GridironGuru</span>
                        <span className="font-semibold">143 pts</span>
                      </div>
                      <div className="flex justify-between text-blue-600 font-semibold">
                        <span>3. You</span>
                        <span>132 pts</span>
                      </div>
                    </div>
                  </div>

                  <Link 
                    href={`/dashboard/leagues/${league.id}`}
                    className="block mt-4 w-full py-2 bg-blue-600 text-white text-center rounded hover:bg-blue-700"
                  >
                    View League
                  </Link>
                </div>
              </div>
            ))}

            {/* Join League Card */}
            <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-4xl mb-4">➕</div>
                <p className="text-gray-600 mb-4">Join a new league</p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Enter Code
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Public Leagues */}
        <div>
          <h2 className="text-xl font-bold mb-4">Public Leagues</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">League Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4">Reddit r/NFL League</td>
                  <td className="px-6 py-4">847/1000</td>
                  <td className="px-6 py-4">Free</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800">Join</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4">Beginners League</td>
                  <td className="px-6 py-4">156/200</td>
                  <td className="px-6 py-4">Free</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800">Join</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}