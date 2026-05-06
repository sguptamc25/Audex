import { createClient } from '@/lib/supabase/server';
import { getAlbum, getTrack } from '@/lib/spotify';
import Link from 'next/link';

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile) {
    return <div className="p-6 mt-10 text-center text-zinc-400">User not found.</div>;
  }

  // Get album reviews
  const { data: albumReviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', id)
    .eq('type', 'album')
    .order('created_at', { ascending: false });

  // Get song reviews
  const { data: songReviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', id)
    .eq('type', 'song')
    .order('created_at', { ascending: false });

  // Hydrate album reviews
  const hydratedAlbumReviews = await Promise.all(
    (albumReviews || []).slice(0, 20).map(async (review) => {
      const musicData = await getAlbum(review.api_item_id);
      return { ...review, musicData };
    })
  );

  // Hydrate song reviews
  const hydratedSongReviews = await Promise.all(
    (songReviews || []).slice(0, 20).map(async (review) => {
      const musicData = await getTrack(review.api_item_id);
      return { ...review, musicData };
    })
  );

  const initials = (profile.username || 'U').substring(0, 2).toUpperCase();
  const totalReviews = (albumReviews?.length || 0) + (songReviews?.length || 0);

  return (
    <div className="max-w-5xl mx-auto p-6 mt-6">
      {/* PROFILE HEADER */}
      <div className="flex items-center gap-6 mb-12 pb-8 border-b border-zinc-800">
        <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{profile.username}</h1>
          <p className="text-zinc-400">Joined {new Date(profile.created_at).getFullYear()}</p>
          <p className="text-zinc-500 text-sm mt-1">{totalReviews} reviews</p>
        </div>
      </div>

      {/* ALBUM REVIEWS */}
      <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Album Reviews</h2>
      <div className="space-y-3 mb-12">
        {hydratedAlbumReviews.length === 0 ? (
          <p className="text-zinc-600 text-sm py-2">No album reviews yet.</p>
        ) : (
          hydratedAlbumReviews.map((review) => {
            const coverUrl = review.musicData?.artworkUrl100?.replace('100x100bb', '200x200bb') || "https://placehold.co/100x100/18181b/3f3f46?text=No+Cover";
            const name = review.musicData?.collectionName || 'Unknown Album';
            const artist = review.musicData?.artistName || '';
            return (
              <div key={review.id} className="flex items-start gap-4 bg-zinc-900/60 border border-zinc-800 rounded-lg px-5 py-4">
                <Link href={`/album/${review.api_item_id}`} className="shrink-0">
                  <img src={coverUrl} className="w-14 h-14 rounded-md object-cover hover:opacity-80 transition" alt={name} />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/album/${review.api_item_id}`}>
                    <h3 className="font-semibold text-white hover:text-blue-400 transition truncate">{name}</h3>
                  </Link>
                  <p className="text-sm text-zinc-400 truncate">{artist}</p>
                  <p className="text-sm text-zinc-300 mt-2 line-clamp-2">&ldquo;{review.content}&rdquo;</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SONG REVIEWS */}
      <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Song Reviews</h2>
      <div className="space-y-3">
        {hydratedSongReviews.length === 0 ? (
          <p className="text-zinc-600 text-sm py-2">No song reviews yet.</p>
        ) : (
          hydratedSongReviews.map((review) => {
            const coverUrl = review.musicData?.artworkUrl100?.replace('100x100bb', '200x200bb') || "https://placehold.co/100x100/18181b/3f3f46?text=No+Cover";
            const name = review.musicData?.trackName || 'Unknown Song';
            const artist = review.musicData?.artistName || '';
            return (
              <div key={review.id} className="flex items-start gap-4 bg-zinc-900/60 border border-zinc-800 rounded-lg px-5 py-4">
                <Link href={`/song/${review.api_item_id}`} className="shrink-0">
                  <img src={coverUrl} className="w-14 h-14 rounded-md object-cover hover:opacity-80 transition" alt={name} />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/song/${review.api_item_id}`}>
                    <h3 className="font-semibold text-white hover:text-blue-400 transition truncate">{name}</h3>
                  </Link>
                  <p className="text-sm text-zinc-400 truncate">{artist}</p>
                  <p className="text-sm text-zinc-300 mt-2 line-clamp-2">&ldquo;{review.content}&rdquo;</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
