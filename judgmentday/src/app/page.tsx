import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="bg-black/50 backdrop-blur-sm fixed w-full z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">⚖️ JudgmentDay</div>
          <div className="space-x-4">
            <Link href="/auth/login" className="text-white hover:text-yellow-400">Login</Link>
            <Link href="/auth/register" className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-white mb-6">
            Your Picks Face <span className="text-yellow-500">Judgment</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Make your NFL predictions with confidence points. Watch them succeed or fail in real-time. 
            Face judgment day every Sunday.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Link href="/auth/register" className="px-8 py-4 bg-yellow-500 text-black text-lg font-semibold rounded-lg hover:bg-yellow-400 transform hover:scale-105 transition">
              Start Playing Free
            </Link>
            <Link href="#how-it-works" className="px-8 py-4 bg-transparent border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-black transition">
              How It Works
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white/10 backdrop-blur rounded-xl p-8 text-white">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-4">Strategic Picks</h3>
            <p className="text-gray-300">
              Assign confidence points 1-16 to each game. Most confident = most points.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-8 text-white">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold mb-4">League Competition</h3>
            <p className="text-gray-300">
              Create or join leagues. Compete weekly for ultimate bragging rights.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-8 text-white">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-2xl font-bold mb-4">Live Game Threads</h3>
            <p className="text-gray-300">
              Chat during games with your picks on display. No hiding from bad calls!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}