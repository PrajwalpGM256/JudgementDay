import sampleData from "@/data/sample-data.json";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import LeagueCard from "@/components/ui/LeagueCard";
import Card from "@/components/ui/Card";

export default function LeaguesPage() {
  const userStanding = sampleData.sampleStandings[2]; // TouchdownTom
  const currentWeek = sampleData.weeks[0].week;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar userName={userStanding.user} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Leagues</h1>
          <div className="space-x-4">
            <Button variant="success">
              Create League
            </Button>
            <Button variant="primary" className="bg-yellow-500 text-black hover:bg-yellow-400">
              Join League
            </Button>
          </div>
        </div>

        {/* My Leagues */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4 text-white">My Leagues</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {sampleData.sampleLeagues.map(league => (
              <LeagueCard
                key={league.id}
                id={league.id}
                name={league.name}
                commissioner={league.commissioner}
                members={league.members}
                currentWeek={currentWeek}
                standings={sampleData.sampleStandings.map((standing) => ({
                  rank: standing.rank,
                  name: standing.user === userStanding.user ? "You" : standing.user,
                  points: standing.points,
                  isCurrentUser: standing.user === userStanding.user
                }))}
              />
            ))}

            {/* Join League Card */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center hover:border-yellow-500/50 transition">
              <div className="text-center p-6">
                <div className="text-4xl mb-4">➕</div>
                <p className="text-gray-300 mb-4">Join a new league</p>
                <Button variant="primary" className="bg-yellow-500 text-black hover:bg-yellow-400">
                  Enter Code
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Public Leagues */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-white">Public Leagues</h2>
          <Card padding={false} className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">League Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Entry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr className="hover:bg-slate-700/30 transition">
                  <td className="px-6 py-4 text-white font-medium">Reddit r/NFL League</td>
                  <td className="px-6 py-4 text-gray-300">847/1000</td>
                  <td className="px-6 py-4 text-gray-300">Free</td>
                  <td className="px-6 py-4">
                    <button className="text-yellow-400 hover:text-yellow-300 font-medium">Join</button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-700/30 transition">
                  <td className="px-6 py-4 text-white font-medium">Beginners League</td>
                  <td className="px-6 py-4 text-gray-300">156/200</td>
                  <td className="px-6 py-4 text-gray-300">Free</td>
                  <td className="px-6 py-4">
                    <button className="text-yellow-400 hover:text-yellow-300 font-medium">Join</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}