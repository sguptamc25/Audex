'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginToReviewLink() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setLoggedIn(true);
    });
  }, []);

  if (loggedIn) return null;

  return (
    <Link href="/login" className="text-sm text-zinc-500 hover:text-blue-400 transition">
      Log in to review
    </Link>
  );
}
