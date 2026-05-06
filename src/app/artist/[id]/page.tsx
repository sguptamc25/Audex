import { getArtist } from '@/lib/spotify';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { artist, albums, error, message } = await getArtist(id);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 bg-red-950 border border-red-800 rounded-xl">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Artist Not Found</h2>
        <p className="text-red-200">{message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col items-center text-center py-12 border-b border-zinc-800 mb-12">
        <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent mb-4">{artist.artistName}</h1>
        <p className="text-zinc-400 text-lg">{artist.primaryGenreName}</p>
      </div>

      <h2 className="text-3xl font-bold mb-8">Discography</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {albums.map((album: any) => (
          <Link href={`/album/${album.collectionId}`} key={album.collectionId} className="group flex flex-col gap-3">
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 aspect-square shadow-lg">
              <img 
                src={album.cover_xl || "https://placehold.co/400x400/18181b/3f3f46?text=No+Cover"} 
                alt={album.collectionName} 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-blue-400 transition truncate">{album.collectionName}</h3>
              <p className="text-sm text-zinc-400 truncate">{album.releaseDate?.substring(0, 4)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
