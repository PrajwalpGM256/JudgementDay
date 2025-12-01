"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Scale, Home, Trophy, Calendar, LogOut, User, Coins, Shield, Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [credits, setCredits] = useState<number>(0);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const fetchCredits = async () => {
    if (!session?.user) {
      setCreditsLoading(false);
      return;
    }
    
    try {
      setCreditsLoading(true);
      const response = await fetch('/api/user/credits', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (response.ok) {
        const data = await response.json();
        const creditsValue = data.credits !== undefined && data.credits !== null 
          ? Number(data.credits) 
          : 1000; // Default to 1000 if not set
        setCredits(creditsValue);
      } else {
        console.error('Failed to fetch credits:', response.status);
        setCredits(1000); // Default fallback
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      setCredits(1000); // Default fallback
    } finally {
      setCreditsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchCredits();
    } else if (status === 'unauthenticated') {
      setCredits(0);
      setCreditsLoading(false);
    }
  }, [status, session?.user?.id]);

  // Listen for credit update events
  useEffect(() => {
    const handleCreditsUpdate = () => {
      fetchCredits();
    };

    window.addEventListener('creditsUpdated', handleCreditsUpdate);
    return () => window.removeEventListener('creditsUpdated', handleCreditsUpdate);
  }, [session]);

  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-lg">
              <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-slate-900" />
            </div>
            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent hidden xs:block">
              JudgmentDay
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link 
              href="/dashboard" 
              className={`flex items-center space-x-2 transition-colors ${
                isActive("/dashboard") 
                  ? "text-amber-400 font-semibold" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/dashboard/matches" 
              className={`flex items-center space-x-2 transition-colors ${
                isActive("/dashboard/matches") 
                  ? "text-amber-400 font-semibold" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Matches</span>
            </Link>
            <Link 
              href="/dashboard/leagues" 
              className={`flex items-center space-x-2 transition-colors ${
                isActive("/dashboard/leagues") 
                  ? "text-amber-400 font-semibold" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Trophy className="h-4 w-4" />
              <span>Leagues</span>
            </Link>
            <Link 
              href="/dashboard/teams" 
              className={`flex items-center space-x-2 transition-colors ${
                isActive("/dashboard/teams") 
                  ? "text-amber-400 font-semibold" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Teams</span>
            </Link>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center space-x-3">
            {session && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                <Coins className="h-4 w-4 text-amber-400" />
                {creditsLoading ? (
                  <span className="text-amber-400/70 text-sm">...</span>
                ) : (
                  <>
                    <span className="text-amber-400 font-semibold text-sm">
                      {credits.toLocaleString()}
                    </span>
                    <span className="text-amber-300/70 text-xs hidden xl:inline">credits</span>
                  </>
                )}
              </div>
            )}
            <div className="flex items-center space-x-2 px-3 py-2 bg-white/5 rounded-lg">
              <User className="h-4 w-4 text-gray-300" />
              <span className="text-gray-300 text-sm">{session?.user?.name || 'User'}</span>
            </div>
            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="flex items-center space-x-2 px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
              >
                <Trophy className="h-4 w-4" />
                <span className="text-sm">Admin</span>
              </Link>
            )}
            <button 
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-3">
            {/* Credits Display Mobile */}
            {session && (
              <div className="flex items-center justify-between px-4 py-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-amber-400" />
                  <span className="text-amber-300 text-sm">Credits</span>
                </div>
                {creditsLoading ? (
                  <span className="text-amber-400/70">...</span>
                ) : (
                  <span className="text-amber-400 font-bold">{credits.toLocaleString()}</span>
                )}
              </div>
            )}

            {/* User Info Mobile */}
            <div className="flex items-center space-x-3 px-4 py-3 bg-white/5 rounded-lg">
              <User className="h-5 w-5 text-gray-300" />
              <span className="text-gray-300">{session?.user?.name || 'User'}</span>
            </div>

            {/* Navigation Links */}
            <Link 
              href="/dashboard" 
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive("/dashboard") 
                  ? "bg-amber-400/20 text-amber-400 font-semibold" 
                  : "text-gray-300 hover:bg-white/5"
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/dashboard/matches" 
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive("/dashboard/matches") 
                  ? "bg-amber-400/20 text-amber-400 font-semibold" 
                  : "text-gray-300 hover:bg-white/5"
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span>Matches</span>
            </Link>
            <Link 
              href="/dashboard/leagues" 
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive("/dashboard/leagues") 
                  ? "bg-amber-400/20 text-amber-400 font-semibold" 
                  : "text-gray-300 hover:bg-white/5"
              }`}
            >
              <Trophy className="h-5 w-5" />
              <span>Leagues</span>
            </Link>
            <Link 
              href="/dashboard/teams" 
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive("/dashboard/teams") 
                  ? "bg-amber-400/20 text-amber-400 font-semibold" 
                  : "text-gray-300 hover:bg-white/5"
              }`}
            >
              <Shield className="h-5 w-5" />
              <span>Teams</span>
            </Link>

            {/* Admin Link Mobile */}
            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
              >
                <Trophy className="h-5 w-5" />
                <span>Admin Panel</span>
              </Link>
            )}

            {/* Logout Button Mobile */}
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                handleSignOut();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
