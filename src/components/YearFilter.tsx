'use client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function YearFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => (currentYear - i).toString());
  const selectedYear = searchParams.get('year') || 'all';
  const currentGenre = searchParams.get('genre');

  return (
    <div className="flex items-center gap-2">
      <span className="text-zinc-400 font-medium text-sm">Year:</span>
      <select 
        className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 cursor-pointer"
        value={selectedYear}
        onChange={(e) => {
          const val = e.target.value;
          const params = new URLSearchParams();
          if (val !== 'all') params.set('year', val);
          if (currentGenre) params.set('genre', currentGenre);
          const qs = params.toString();
          router.push('/charts' + (qs ? '?' + qs : ''));
        }}
      >
        <option value="all">All Time</option>
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}
