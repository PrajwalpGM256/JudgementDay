import Link from "next/link";

interface LeagueCardProps {
  id: string;
  name: string;
  commissioner: string;
  members: number;
  currentWeek?: number;
  standings?: {
    rank: number;
    name: string;
    points: number;
    isCurrentUser?: boolean;
  }[];
}

export default function LeagueCard({ id, name, commissioner, members, currentWeek = 1, standings }: LeagueCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 hover:shadow-2xl hover:border-yellow-500/50 transition">
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-white">{name}</h3>
        <p className="text-gray-400 mb-4">Commissioner: {commissioner}</p>
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>{members} members</span>
          <span>Week {currentWeek}</span>
        </div>
        
        {standings && standings.length > 0 && (
          <div className="border-t border-slate-700 pt-4">
            <p className="text-sm font-semibold mb-2 text-gray-300">Top 3</p>
            <div className="space-y-1 text-sm">
              {standings.map((standing) => (
                <div 
                  key={standing.rank} 
                  className={`flex justify-between ${standing.isCurrentUser ? 'text-yellow-400 font-semibold' : 'text-gray-300'}`}
                >
                  <span>{standing.rank}. {standing.name}</span>
                  <span className="font-semibold">{standing.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link 
          href={`/dashboard/leagues/${id}`}
          className="block mt-4 w-full py-2 bg-yellow-500 text-black text-center rounded hover:bg-yellow-400 font-medium"
        >
          View League
        </Link>
      </div>
    </div>
  );
}
