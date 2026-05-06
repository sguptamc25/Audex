import { getAlbumWithTracks, formatDuration } from '@/lib/spotify';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import ReviewForm from '@/components/ReviewForm';
import LoginToReviewLink from '@/components/LoginToReviewLink';

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getAlbumWithTracks(id);
  const supabase = createClient();

  if (result.error) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 bg-red-950 border border-red-800 rounded-xl">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Music API Error</h2>
        <p className="text-red-200">{result.message || "Failed to load album."}</p>
      </div>
    );
  }

  const { album, tracks } = result;

  // Get album average rating from our DB
  const { data: albumStats } = await supabase
    .from('item_stats')
    .select('*')
    .eq('api_item_id', id)
    .eq('type', 'album')
    .single();

  // Get ratings for each track
  const trackIds = tracks.map((t: any) => String(t.trackId));
  const { data: trackRatings } = await supabase
    .from('item_stats')
    .select('*')
    .in('api_item_id', trackIds)
    .eq('type', 'song');

  const trackRatingMap: Record<string, any> = {};
  (trackRatings || []).forEach((r: any) => { trackRatingMap[r.api_item_id] = r; });

  // Get album reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(username, avatar_url)')
    .eq('api_item_id', id)
    .eq('type', 'album')
    .order('created_at', { ascending: false })
    .limit(12);

  const coverUrl = album.cover_xl || "https://placehold.co/400x400/18181b/3f3f46?text=No+Cover";
  const avgRating = albumStats?.average_rating || '—';
  const ratingCount = albumStats?.rating_count || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
        <img 
          src={coverUrl} 
          alt={album.collectionName} 
          className="w-48 md:w-56 rounded-xl shadow-2xl border border-zinc-800 shrink-0"
        />
        <div className="flex flex-col justify-end">
          <Link href={`/artist/${album.artistId}`} className="text-blue-400 hover:text-blue-300 transition text-sm font-semibold uppercase tracking-wider mb-1">
            {album.artistName}
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">{album.collectionName}</h1>
          <div className="flex items-center gap-3 text-zinc-400 text-sm">
            <span>{album.releaseDate?.substring(0, 4)}</span>
            <span>•</span>
            <span>{album.primaryGenreName}</span>
            <span>•</span>
            <span>{album.trackCount} tracks</span>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-yellow-400 text-2xl">★</span>
            <span className="text-3xl font-bold text-white">{avgRating}</span>
            <span className="text-zinc-500 text-sm ml-1">({ratingCount} ratings)</span>
          </div>
        </div>
      </div>

      {/* TRACKLIST */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Tracklist</h2>
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          {tracks.map((track: any, i: number) => {
            const stats = trackRatingMap[String(track.trackId)];
            const trackRating = stats?.average_rating;
            const duration = formatDuration(track.trackTimeMillis);
            
            return (
              <Link 
                href={`/song/${track.trackId}`} 
                key={track.trackId}
                className={`flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/50 transition group ${i !== tracks.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
              >
                <span className="text-zinc-500 text-sm font-mono w-6 text-right">{track.trackNumber}</span>
                <span className="flex-1 font-medium text-zinc-200 group-hover:text-white transition">{track.trackName}</span>
                {trackRating ? (
                  <span className="text-yellow-400 text-sm font-semibold flex items-center gap-1">
                    <span>★</span> {trackRating}
                  </span>
                ) : (
                  <span className="text-zinc-600 text-sm">—</span>
                )}
                <span className="text-zinc-500 text-sm font-mono w-12 text-right">{duration}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* COMMUNITY REVIEWS */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Community Reviews</h2>
          <LoginToReviewLink />
        </div>
        
        {(!reviews || reviews.length === 0) ? (
          <div className="space-y-4">
            <ReviewForm apiItemId={id} type="album" />
            <p className="text-zinc-500 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 text-center">No reviews yet. Be the first to review this album!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <ReviewForm apiItemId={id} type="album" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((review: any) => {
              const initials = (review.profiles?.username || 'A').substring(0, 2).toUpperCase();
              const colors = ['bg-purple-600', 'bg-blue-600', 'bg-green-600', 'bg-orange-600', 'bg-pink-600', 'bg-cyan-600'];
              const bgColor = colors[review.user_id?.charCodeAt(0) % colors.length] || 'bg-zinc-600';
              
              return (
                <div key={review.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${bgColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {initials}
                    </div>
                    <Link href={`/user/${review.user_id}`} className="font-semibold text-sm hover:text-blue-400 transition truncate">
                      {review.profiles?.username || 'Anonymous'}
                    </Link>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed line-clamp-3">{review.content}</p>
                  <p className="text-zinc-600 text-xs mt-auto">
                    {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
