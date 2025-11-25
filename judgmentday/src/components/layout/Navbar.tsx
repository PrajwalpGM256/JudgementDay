"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Scale, Home, Trophy, Calendar, LogOut, User, Coins } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [credits, setCredits] = useState<number>(0);
  const [creditsLoading, setCreditsLoading] = useState(true);

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
    <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-lg">
                <Scale className="h-6 w-6 text-slate-900" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                JudgmentDay
              </span>
            </Link>
            <div className="flex space-x-8">
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
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {session && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                <Coins className="h-4 w-4 text-amber-400" />
                {creditsLoading ? (
                  <span className="text-amber-400/70 text-sm">...</span>
                ) : (
                  <>
                    <span className="text-amber-400 font-semibold">
                      {credits.toLocaleString()}
                    </span>
                    <span className="text-amber-300/70 text-sm">credits</span>
                  </>
                )}
              </div>
            )}
            <div className="flex items-center space-x-3 px-4 py-2 bg-white/5 rounded-lg">
              <User className="h-4 w-4 text-gray-300" />
              <span className="text-gray-300">{session?.user?.name || 'User'}</span>
            </div>
            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
              >
                <Trophy className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
            <button 
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
