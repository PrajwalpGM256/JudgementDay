"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  userName?: string;
  onLogout?: () => void;
}

export default function Navbar({ userName, onLogout }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-slate-900 shadow-lg border-b border-slate-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-2xl font-bold text-white">
              ⚖️ JudgmentDay
            </Link>
            <div className="flex space-x-6">
              <Link 
                href="/dashboard" 
                className={isActive("/dashboard") ? "text-yellow-400 font-semibold" : "text-gray-300 hover:text-yellow-400 font-medium"}
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/leagues" 
                className={isActive("/dashboard/leagues") ? "text-yellow-400 font-semibold" : "text-gray-300 hover:text-yellow-400 font-medium"}
              >
                Leagues
              </Link>
              <Link 
                href="/dashboard/picks" 
                className={isActive("/dashboard/picks") ? "text-yellow-400 font-semibold" : "text-gray-300 hover:text-yellow-400 font-medium"}
              >
                Make Picks
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {userName && <span className="text-gray-200 font-medium">{userName}</span>}
            <button 
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
