import Link from "next/link";
import { Scale, User, Mail, Lock, ArrowRight, Eye, Check } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Back to Home Link */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
      >
        <ArrowRight className="h-4 w-4 rotate-180" />
        <span>Back to Home</span>
      </Link>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg">
              <Scale className="h-8 w-8 text-slate-900" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              JudgmentDay
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Join the Game</h1>
          <p className="text-gray-300">Create your account and start making NFL predictions</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:bg-white/15 transition-all duration-200"
                  placeholder="johndoe123"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:bg-white/15 transition-all duration-200"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:bg-white/15 transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="space-y-2">
              <p className="text-sm text-gray-300">Password must contain:</p>
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex items-center space-x-2">
                  <Check className="h-3 w-3 text-green-400" />
                  <span>At least 8 characters</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-3 w-3 text-green-400" />
                  <span>One uppercase letter</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-3 w-3 text-green-400" />
                  <span>One number</span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                className="w-4 h-4 text-amber-400 bg-white/10 border-white/20 rounded focus:ring-amber-400 focus:ring-2 mt-1"
              />
              <div className="text-sm text-gray-300">
                <span>I agree to the </span>
                <Link href="#" className="text-amber-400 hover:text-amber-300 transition-colors">
                  Terms of Service
                </Link>
                <span> and </span>
                <Link href="#" className="text-amber-400 hover:text-amber-300 transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
            
            <button
              type="button"
              className="group w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold rounded-xl hover:from-amber-300 hover:to-orange-400 transform hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-amber-500/25 flex items-center justify-center space-x-2"
            >
              <span>Create Account</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-gray-400">Already have an account?</span>
              </div>
            </div>
            <Link 
              href="/auth/login" 
              className="mt-4 inline-flex items-center space-x-2 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              <span>Sign in instead</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}