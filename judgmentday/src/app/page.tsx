import Link from "next/link";
import { Scale, Target, Trophy, MessageCircle, ArrowRight, Star, Users, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md fixed w-full z-50 border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-lg">
              <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-slate-900" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              JudgmentDay
            </span>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-6">
            <Link 
              href="/auth/login" 
              className="text-gray-300 hover:text-white font-medium transition-colors duration-200 text-sm sm:text-base"
            >
              Login
            </Link>
            <Link 
              href="/auth/register" 
              className="px-4 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold rounded-lg hover:from-amber-300 hover:to-orange-400 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-32 md:pt-40 pb-12 sm:pb-16 md:pb-20 relative">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-6 sm:mb-8">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-medium text-gray-300">Trusted by 10,000+ NFL fans</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 sm:mb-8 leading-tight px-2">
            Your Picks Face{" "}
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Judgment
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            Make your NFL predictions with confidence points. Watch them succeed or fail in real-time. 
            Face judgment day every Sunday with the most competitive prediction platform.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 px-4">
            <Link 
              href="/auth/register" 
              className="group w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 text-base sm:text-lg font-bold rounded-xl hover:from-amber-300 hover:to-orange-400 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-amber-500/25 flex items-center justify-center space-x-2"
            >
              <span>Start Playing Free</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#how-it-works" 
              className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-base sm:text-lg font-semibold rounded-xl hover:bg-white/20 hover:border-white/30 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>How It Works</span>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-12 sm:mt-16 md:mt-20 max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">10K+</div>
            <div className="text-gray-400 text-xs sm:text-sm md:text-base">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">$50K+</div>
            <div className="text-gray-400 text-xs sm:text-sm md:text-base">In Prizes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">95%</div>
            <div className="text-gray-400 text-xs sm:text-sm md:text-base">Accuracy Rate</div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-16 sm:mt-20 md:mt-24 px-4">
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Strategic Picks</h3>
            <p className="text-gray-300 leading-relaxed">
              Assign confidence points 1-16 to each game. Most confident = most points. 
              Strategic thinking meets competitive spirit.
            </p>
          </div>
          
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">League Competition</h3>
            <p className="text-gray-300 leading-relaxed">
              Create or join leagues. Compete weekly for ultimate bragging rights and 
              real prizes in our competitive ecosystem.
            </p>
          </div>
          
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Live Game Threads</h3>
            <p className="text-gray-300 leading-relaxed">
              Chat during games with your picks on display. No hiding from bad calls! 
              Real-time community engagement.
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-16 sm:mt-20 md:mt-24 text-center px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8 sm:mb-12">Why Choose JudgmentDay?</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
            <div className="flex flex-col items-center p-4 sm:p-6">
              <Users className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-amber-400 mb-3 sm:mb-4" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-1 sm:mb-2">Community</h3>
              <p className="text-gray-400 text-xs sm:text-sm text-center">Join thousands of passionate NFL fans</p>
            </div>
            <div className="flex flex-col items-center p-4 sm:p-6">
              <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-amber-400 mb-3 sm:mb-4" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-1 sm:mb-2">Real-time</h3>
              <p className="text-gray-400 text-xs sm:text-sm text-center">Live updates and instant results</p>
            </div>
            <div className="flex flex-col items-center p-4 sm:p-6">
              <Target className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-amber-400 mb-3 sm:mb-4" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-1 sm:mb-2">Strategy</h3>
              <p className="text-gray-400 text-xs sm:text-sm text-center">Test your prediction skills</p>
            </div>
            <div className="flex flex-col items-center p-4 sm:p-6">
              <Trophy className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-amber-400 mb-3 sm:mb-4" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-1 sm:mb-2">Prizes</h3>
              <p className="text-gray-400 text-xs sm:text-sm text-center">Win real rewards weekly</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}