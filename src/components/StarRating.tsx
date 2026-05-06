'use client';
import { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ initialScore = 0, onRate }: { initialScore?: number, onRate?: (score: number) => void }) {
  const [hoverScore, setHoverScore] = useState<number | null>(null);
  const currentScore = hoverScore !== null ? hoverScore : initialScore;

  return (
    <div className="flex space-x-1" onMouseLeave={() => setHoverScore(null)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isHalf = currentScore + 0.5 === star;
        const isFull = currentScore >= star;
        
        return (
          <div key={star} className="relative cursor-pointer" onClick={() => onRate?.(isHalf ? star - 0.5 : star)}>
            {/* Invisible hitboxes for half-star targeting */}
            <div className="absolute left-0 w-1/2 h-full z-10" onMouseEnter={() => setHoverScore(star - 0.5)} onClick={(e) => { e.stopPropagation(); onRate?.(star - 0.5); }} />
            <div className="absolute right-0 w-1/2 h-full z-10" onMouseEnter={() => setHoverScore(star)} onClick={(e) => { e.stopPropagation(); onRate?.(star); }} />
            
            <Star
              className={`w-6 h-6 transition-colors ${isFull || isHalf ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`}
              fill={isFull ? 'currentColor' : 'none'}
            />
            {isHalf && (
              <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
