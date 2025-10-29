import Link from "next/link";
import sampleData from "@/data/sample-data.json";
import Navbar from "@/components/layout/Navbar";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  // Get user's standing from sample data
  const userStanding = sampleData.sampleStandings[2]; // TouchdownTom
  const totalLeagueMembers = sampleData.sampleLeagues.reduce((sum, league) => sum + league.members, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar userName={userStanding.user} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            label="Total Points"
            value={userStanding.points}
            subtitle={`Rank #${userStanding.rank} of ${totalLeagueMembers}`}
            color="blue"
          />
          <StatCard 
            label="This Week"
            value={`${userStanding.wins}-${userStanding.losses}`}
            subtitle={`${Math.round((userStanding.wins / (userStanding.wins + userStanding.losses)) * 100)}% accuracy`}
            color="green"
          />
          <StatCard 
            label="Current Streak"
            value="W3"
            subtitle="3 wins in a row"
            color="yellow"
          />
          <StatCard 
            label="Best Week"
            value={14}
            subtitle="Week 7 performance"
            color="purple"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* My Leagues */}
          <Card padding={false}>
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">My Leagues</h2>
            </div>
            <div className="p-6">
              {sampleData.sampleLeagues.map(league => (
                <Link 
                  key={league.id}
                  href={`/dashboard/leagues/${league.id}`}
                  className="block p-4 hover:bg-slate-700/50 rounded-lg transition mb-2"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white">{league.name}</p>
                      <p className="text-sm text-gray-400">{league.members} members</p>
                    </div>
                    <span className="text-yellow-400 font-medium">View →</span>
                  </div>
                </Link>
              ))}
              <Link 
                href="/dashboard/leagues"
                className="block mt-4 text-center py-2 text-yellow-400 hover:text-yellow-300 font-medium"
              >
                + Join New League
              </Link>
            </div>
          </Card>

          {/* This Week's Picks */}
          <Card padding={false}>
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Week {sampleData.weeks[0].week} Picks Status</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {sampleData.weeks[0].games.slice(0, 3).map((game, index) => {
                  const statuses = [
                    { bg: "bg-green-900/30", text: "text-green-400", result: "W (+16)" },
                    { bg: "bg-red-900/30", text: "text-red-400", result: "L (0)" },
                    { bg: "bg-slate-700/30", text: "text-gray-400", result: game.time }
                  ];
                  const status = statuses[index];
                  
                  return (
                    <div key={game.id} className={`flex justify-between items-center p-3 ${status.bg} rounded border border-slate-700`}>
                      <span className="text-white font-medium">{game.away} vs {game.home}</span>
                      <span className={`${status.text} font-semibold`}>{status.result}</span>
                    </div>
                  );
                })}
              </div>
              <Link href="/dashboard/picks">
                <Button variant="primary" className="w-full mt-6 bg-yellow-500 text-black hover:bg-yellow-400">
                  Update Picks for Week {sampleData.weeks[0].week + 1}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}