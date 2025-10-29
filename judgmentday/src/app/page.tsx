import Link from "next/link";
import Button from "@/components/ui/Button";
import FeatureCard from "@/components/ui/FeatureCard";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="bg-black/50 backdrop-blur-sm fixed w-full z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">⚖️ JudgmentDay</div>
          <div className="space-x-4 flex items-center">
            <Link href="/auth/login" className="text-white hover:text-yellow-400">Login</Link>
            <Link href="/auth/register">
              <Button variant="primary" className="bg-yellow-500 text-black hover:bg-yellow-400">
                Sign Up
              </Button>
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
            <Link href="/auth/register">
              <Button variant="primary" size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400 transform hover:scale-105">
                Start Playing Free
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg">
                How It Works
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <FeatureCard 
            icon="🎯"
            title="Strategic Picks"
            description="Assign confidence points 1-16 to each game. Most confident = most points."
          />
          <FeatureCard 
            icon="🏆"
            title="League Competition"
            description="Create or join leagues. Compete weekly for ultimate bragging rights."
          />
          <FeatureCard 
            icon="💬"
            title="Live Game Threads"
            description="Chat during games with your picks on display. No hiding from bad calls!"
          />
        </div>
      </div>
    </main>
  );
}