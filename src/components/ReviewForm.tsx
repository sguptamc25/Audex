'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ReviewFormProps {
  apiItemId: string;
  type: 'album' | 'song';
}

export default function ReviewForm({ apiItemId, type }: ReviewFormProps) {
  const [user, setUser] = useState<any>(null);
  const [content, setContent] = useState('');
  const [score, setScore] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingReview, setExistingReview] = useState<any>(null);
  const [existingRating, setExistingRating] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setCheckingAuth(false);
      if (data.user) {
        // Check for existing review
        supabase.from('reviews')
          .select('*')
          .eq('user_id', data.user.id)
          .eq('api_item_id', apiItemId)
          .eq('type', type)
          .maybeSingle()
          .then(({ data: review }) => {
            if (review) setExistingReview(review);
          });
        // Check for existing rating
        supabase.from('ratings')
          .select('*')
          .eq('user_id', data.user.id)
          .eq('api_item_id', apiItemId)
          .eq('type', type)
          .maybeSingle()
          .then(({ data: rating }) => {
            if (rating) {
              setExistingRating(rating);
              setScore(rating.score);
            }
          });
      }
    });
  }, [apiItemId, type]);

  if (checkingAuth || !user) return null;

  // User has already reviewed — show their review with edit/delete
  if (existingReview && !editing) {
    return (
      <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">Your Review</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setContent(existingReview.content);
                if (existingRating) setScore(existingRating.score);
                setEditing(true);
              }}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-blue-400 transition cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={async () => {
                if (!confirm('Delete your review?')) return;
                setLoading(true);
                await supabase.from('reviews').delete().eq('id', existingReview.id);
                if (existingRating) {
                  await supabase.from('ratings').delete().eq('id', existingRating.id);
                }
                setExistingReview(null);
                setExistingRating(null);
                setContent('');
                setScore(4);
                setLoading(false);
                router.refresh();
              }}
              disabled={loading}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-400 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 text-yellow-400 text-sm">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < (existingRating?.score || 0) ? 'text-yellow-400' : 'text-zinc-700'}>★</span>
          ))}
          <span className="text-zinc-500 ml-1">({existingRating?.score || '?'}/5)</span>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed">{existingReview.content}</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Please write a review.');
      return;
    }
    if (content.trim().length < 10) {
      setError('Review must be at least 10 characters.');
      return;
    }

    setLoading(true);

    try {
      if (editing && existingReview) {
        // UPDATE existing review
        await supabase.from('reviews').update({ content: content.trim() }).eq('id', existingReview.id);
        if (existingRating) {
          await supabase.from('ratings').update({ score }).eq('id', existingRating.id);
        }
        setExistingReview({ ...existingReview, content: content.trim() });
        setExistingRating(existingRating ? { ...existingRating, score } : null);
        setEditing(false);
      } else {
        // INSERT new review + rating
        const { error: ratingError, data: newRating } = await supabase.from('ratings').insert({
          user_id: user.id,
          api_item_id: apiItemId,
          type,
          score,
        }).select().single();

        if (ratingError && !ratingError.message.includes('duplicate')) {
          console.warn('Rating insert issue:', ratingError.message);
        }

        const { error: reviewError, data: newReview } = await supabase.from('reviews').insert({
          user_id: user.id,
          api_item_id: apiItemId,
          type,
          content: content.trim(),
        }).select().single();

        if (reviewError) {
          setError(reviewError.message);
        } else {
          setExistingReview(newReview);
          if (newRating) setExistingRating(newRating);
        }
      }
      router.refresh();
    } catch (err) {
      setError('Something went wrong.');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">{editing ? 'Edit Your Review' : 'Write a Review'}</h3>
        {editing && (
          <button type="button" onClick={() => setEditing(false)} className="text-xs text-zinc-500 hover:text-white transition cursor-pointer">
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm border border-red-500/50">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-400">Rating:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setScore(star)}
              className={`text-2xl cursor-pointer transition ${star <= score ? 'text-yellow-400' : 'text-zinc-700 hover:text-zinc-500'}`}
            >
              ★
            </button>
          ))}
        </div>
        <span className="text-sm text-zinc-500">({score}/5)</span>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`Share your thoughts about this ${type}...`}
        rows={3}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Saving...' : editing ? 'Save Changes' : 'Post Review'}
      </button>
    </form>
  );
}
