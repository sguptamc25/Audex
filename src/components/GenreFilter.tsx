'use client';
import { useRouter, useSearchParams } from 'next/navigation';

const GENRES = ['All', 'Alternative', 'Rock', 'Pop', 'Hip-Hop/Rap', 'Electronic', 'R&B/Soul', 'Country', 'Jazz', 'Classical'];

export default function GenreFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentGenre = searchParams.get('genre') || 'All';
  const currentYear = searchParams.get('year');

  const handleClick = (genre: string) => {
    const params = new URLSearchParams();
    if (currentYear) params.set('year', currentYear);
    if (genre !== 'All') params.set('genre', genre);
    const qs = params.toString();
    router.push('/charts' + (qs ? '?' + qs : ''));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {GENRES.map((genre) => {
        const isActive = currentGenre === genre || (genre === 'All' && !currentGenre);
        return (
          <button
            key={genre}
            onClick={() => handleClick(genre)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer border ${
              isActive
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-white'
            }`}
          >
            {genre === 'Hip-Hop/Rap' ? 'Hip-Hop' : genre}
          </button>
        );
      })}
    </div>
  );
}
