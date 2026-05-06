'use client';
import Link from 'next/link';
import { Search, Music, LogOut, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        supabase.from('profiles').select('*').eq('id', data.user.id).single().then(({ data: p }) => {
          setProfile(p);
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data: p }) => {
          setProfile(p);
        });
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setDropdownOpen(false);
    router.push('/');
    router.refresh();
  };

  const initials = (profile?.username || user?.email || 'U').substring(0, 2).toUpperCase();

  return (
    <nav className="w-full border-b border-zinc-800 bg-zinc-950 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition">
            <Music className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-xl tracking-tight">Audex</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <Link href="/charts" className="hover:text-white transition">Charts</Link>
            <Link href="/new-releases" className="hover:text-white transition">New Releases</Link>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-6">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search albums, artists, songs..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </form>
        </div>

        {/* AUTH SECTION */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-4 py-2 border-b border-zinc-800">
                  <p className="text-sm font-semibold text-white truncate">{profile?.username || 'User'}</p>
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                </div>
                <Link
                  href={`/user/${user.id}`}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition"
                >
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 transition w-full text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition">Log In</Link>
            <Link href="/signup" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
