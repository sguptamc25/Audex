import { getTrack, formatDuration } from '@/lib/spotify';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import ReviewForm from '@/components/ReviewForm';
import LoginToReviewLink from '@/components/LoginToReviewLink';

export default async function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = await getTrack(id);
  const supabase = createClient();

  if (track.error) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 bg-red-950 border border-red-800 rounded-xl">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Track Not Found</h2>
        <p className="text-red-200">{track.message || "Failed to load track."}</p>
      </div>
    );
  }

  // Get song stats
  const { data: songStats } = await supabase
    .from('item_stats')
    .select('*')
    .eq('api_item_id', id)
    .eq('type', 'song')
    .single();

  // Get song reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(username, avatar_url)')
    .eq('api_item_id', id)
    .eq('type', 'song')
    .order('created_at', { ascending: false })
    .limit(12);

  const coverUrl = track.cover_xl || "https://placehold.co/400x400/18181b/3f3f46?text=No+Cover";
  const avgRating = songStats?.average_rating || '—';
  const ratingCount = songStats?.rating_count || 0;
  const duration = track.trackTimeMillis ? formatDuration(track.trackTimeMillis) : '';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
        <img 
          src={coverUrl} 
          alt={track.trackName} 
          className="w-48 md:w-56 rounded-xl shadow-2xl border border-zinc-800 shrink-0"
        />
        <div className="flex flex-col justify-end">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{track.trackName}</h1>
          <Link href={`/artist/${track.artistId}`} className="text-blue-400 hover:text-blue-300 transition text-lg font-semibold mb-3">
            {track.artistName}
          </Link>
          <div className="flex items-center gap-2 text-zinc-400 text-sm flex-wrap">
            <Link href={`/album/${track.collectionId}`} className="hover:text-blue-400 transition">
              {track.collectionName}
            </Link>
            <span>•</span>
            <span>{track.releaseDate?.substring(0, 4)}</span>
            <span>•</span>
            <span>{track.primaryGenreName}</span>
            {duration && (
              <>
                <span>•</span>
                <span>{duration}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-2xl">★</span>
              <span className="text-3xl font-bold text-white">{avgRating}</span>
              <span className="text-zinc-500 text-sm">({ratingCount} ratings)</span>
            </div>
            
            {track.previewUrl && (
              <a 
                href={track.previewUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition shadow-lg shadow-blue-600/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Preview
              </a>
            )}
          </div>
        </div>
      </div>

      {/* COMMUNITY REVIEWS */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Community Reviews</h2>
          <LoginToReviewLink />
        </div>
        
        {(!reviews || reviews.length === 0) ? (
          <div className="space-y-4">
            <ReviewForm apiItemId={id} type="song" />
            <p className="text-zinc-500 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 text-center">No reviews yet. Be the first to review this track!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <ReviewForm apiItemId={id} type="song" />
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
