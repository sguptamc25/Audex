'use client';
import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Client-side validation
    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (authError) {
        setError(authError.message);
      } else if (data.user) {
        // Create profile
        await supabase.from('profiles').upsert({
          id: data.user.id,
          username: username,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        });
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-white mb-2">Create Account</h1>
        <p className="text-zinc-400 text-center mb-8">Join the Audex community.</p>
        
        {success ? (
          <div className="bg-green-500/20 text-green-400 p-4 rounded-lg mb-6 border border-green-500/50 text-center">
            Account created successfully! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm border border-red-500/50">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="musicnerd99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-zinc-200 text-lg py-3 mt-4 font-semibold rounded-lg disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition font-medium">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
