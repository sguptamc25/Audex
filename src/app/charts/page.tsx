import { createClient } from '@/lib/supabase/server';
import { getAlbum, getTrack } from '@/lib/spotify';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';
import YearFilter from '@/components/YearFilter';
import GenreFilter from '@/components/GenreFilter';

export default async function ChartsPage({ searchParams }: { searchParams: Promise<{ year?: string; genre?: string }> }) {
  const { year, genre } = await searchParams;
  const supabase = createClient();
  
  const { data: topAlbumsStats } = await supabase
    .from('item_stats')
    .select('*')
    .eq('type', 'album')
    .order('average_rating', { ascending: false })
    .order('rating_count', { ascending: false })
    .limit(100);

  const { data: topSongsStats } = await supabase
    .from('item_stats')
    .select('*')
    .eq('type', 'song')
    .order('average_rating', { ascending: false })
    .order('rating_count', { ascending: false })
    .limit(100);

  const topAlbumsRaw = await Promise.all(
    (topAlbumsStats || []).map(async (stat) => {
      const musicData = await getAlbum(stat.api_item_id);
      if (musicData.error) return null;
      return { ...stat, ...musicData };
    })
  );

  const topSongsRaw = await Promise.all(
    (topSongsStats || []).map(async (stat) => {
      const musicData = await getTrack(stat.api_item_id);
      if (musicData.error) return null;
      return { ...stat, ...musicData };
    })
  );

  // Filter out nulls and apply year + genre filters
  const topAlbums = topAlbumsRaw.filter((album: any) => {
    if (!album) return false;
    if (year && album.releaseDate && !album.releaseDate.startsWith(year)) return false;
    if (genre && album.primaryGenreName && album.primaryGenreName !== genre) return false;
    return true;
  }).slice(0, 50);

  const topSongs = topSongsRaw.filter((song: any) => {
    if (!song) return false;
    if (year && song.releaseDate && !song.releaseDate.startsWith(year)) return false;
    if (genre && song.primaryGenreName && song.primaryGenreName !== genre) return false;
    return true;
  }).slice(0, 50);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Top Rated Albums</h1>
      
      <Tabs defaultValue="albums">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <TabsList>
            <TabsTrigger value="albums">Albums</TabsTrigger>
            <TabsTrigger value="songs">Songs</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-4">
            <GenreFilter />
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <YearFilter />
        </div>
        
        <TabsContent value="albums" className="mt-2 space-y-3">
          {topAlbums.length === 0 ? (
            <p className="text-zinc-500 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 text-center">No albums found for this criteria.</p>
          ) : (
            topAlbums.map((album: any, index) => {
              const coverUrl = album.artworkUrl100?.replace('100x100bb', '200x200bb') || "https://placehold.co/64x64/18181b/3f3f46?text=No+Cover";
              return (
                <Link href={`/album/${album.api_item_id}`} key={album.api_item_id || index} className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition group">
                  <div className="text-2xl font-bold text-zinc-500 w-8 text-center">{index + 1}</div>
                  <img src={coverUrl} alt={album.collectionName} width={64} height={64} className="rounded-md object-cover" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition truncate">{album.collectionName || "Unknown Album"}</h3>
                    <p className="text-sm text-zinc-400 truncate">
                      {album.artistName}
                      {album.primaryGenreName && (
                        <span className="text-zinc-600"> • {album.primaryGenreName}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-yellow-400">★</span>
                      <span className="text-2xl font-bold text-yellow-400">{album.average_rating}</span>
                    </div>
                    <div className="text-xs text-zinc-500">{album.rating_count} ratings</div>
                  </div>
                </Link>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="songs" className="mt-2 space-y-3">
          {topSongs.length === 0 ? (
            <p className="text-zinc-500 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 text-center">No songs found for this criteria.</p>
          ) : (
            topSongs.map((song: any, index) => {
              const coverUrl = song.artworkUrl100?.replace('100x100bb', '200x200bb') || "https://placehold.co/48x48/18181b/3f3f46?text=No+Cover";
              return (
                <Link href={`/song/${song.api_item_id}`} key={song.api_item_id || index} className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition group">
                  <div className="text-2xl font-bold text-zinc-500 w-8 text-center">{index + 1}</div>
                  <img src={coverUrl} alt={song.trackName} width={48} height={48} className="rounded-full object-cover shadow-lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition truncate">{song.trackName || "Unknown Song"}</h3>
                    <p className="text-sm text-zinc-400 truncate">
                      {song.artistName} • {song.collectionName}
                      {song.primaryGenreName && (
                        <span className="text-zinc-600"> • {song.primaryGenreName}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-yellow-400">★</span>
                      <span className="text-2xl font-bold text-yellow-400">{song.average_rating}</span>
                    </div>
                    <div className="text-xs text-zinc-500">{song.rating_count} ratings</div>
                  </div>
                </Link>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
