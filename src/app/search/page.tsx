import { searchAlbums, searchArtists, searchSongs } from '@/lib/spotify';
import Link from 'next/link';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: query } = await searchParams;
  
  if (!query) {
    return <div className="max-w-5xl mx-auto p-6 mt-10 text-zinc-400">Please enter a search term.</div>;
  }

  const [artistResult, albumResult, songResult] = await Promise.all([
    searchArtists(query),
    searchAlbums(query),
    searchSongs(query),
  ]);

  const artists = artistResult?.results || [];
  const albums = albumResult?.results || [];
  const songs = songResult?.results || [];

  return (
    <div className="max-w-5xl mx-auto p-6 mt-4">
      <h1 className="text-3xl font-bold mb-8">Results for &quot;{query}&quot;</h1>

      {/* ARTISTS SECTION */}
      <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Artists</h2>
      <div className="space-y-2 mb-10">
        {artists.length === 0 ? (
          <p className="text-zinc-600 text-sm py-2">No artists found.</p>
        ) : (
          artists.map((artist: any) => (
            <Link 
              href={`/artist/${artist.artistId}`} 
              key={artist.artistId} 
              className="flex items-center justify-between bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 rounded-lg px-5 py-4 transition group"
            >
              <span className="font-semibold text-white group-hover:text-blue-400 transition">{artist.artistName}</span>
              <span className="text-sm text-zinc-500">{artist.primaryGenreName}</span>
            </Link>
          ))
        )}
      </div>

      {/* ALBUMS SECTION */}
      <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Albums</h2>
      <div className="space-y-2 mb-10">
        {albums.length === 0 ? (
          <p className="text-zinc-600 text-sm py-2">No albums found.</p>
        ) : (
          albums.map((album: any) => {
            const coverUrl = album.artworkUrl100?.replace('100x100bb', '200x200bb') || "https://placehold.co/100x100/18181b/3f3f46?text=No+Cover";
            return (
              <Link 
                href={`/album/${album.collectionId}`} 
                key={album.collectionId} 
                className="flex items-center gap-4 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 rounded-lg px-5 py-3 transition group"
              >
                <img 
                  src={coverUrl} 
                  alt={album.collectionName} 
                  width={48} height={48} 
                  className="rounded-md object-cover"
                />
                <div>
                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition">{album.collectionName}</h3>
                  <p className="text-sm text-zinc-400">{album.artistName}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* SONGS SECTION */}
      <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Songs</h2>
      <div className="space-y-2">
        {songs.length === 0 ? (
          <p className="text-zinc-600 text-sm py-2">No songs found.</p>
        ) : (
          songs.map((song: any) => {
            const coverUrl = song.artworkUrl100?.replace('100x100bb', '200x200bb') || "https://placehold.co/100x100/18181b/3f3f46?text=No+Cover";
            return (
              <Link 
                href={`/song/${song.trackId}`} 
                key={song.trackId} 
                className="flex items-center gap-4 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 rounded-lg px-5 py-3 transition group"
              >
                <img 
                  src={coverUrl} 
                  alt={song.trackName} 
                  width={48} height={48} 
                  className="rounded-md object-cover"
                />
                <div>
                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition">{song.trackName}</h3>
                  <p className="text-sm text-zinc-400">{song.artistName}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
