"use client";

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type StarRatingProps = {
  count?: number;
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
};

export function StarRating({ count = 5, rating, onRatingChange, size = 24 }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleRating = (rate: number) => {
    onRatingChange(rate);
  };

  const handleMouseEnter = (rate: number) => {
    setHoverRating(rate);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(count)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            className="focus:outline-none transition-transform duration-150 ease-in-out hover:scale-110"
            onClick={() => handleRating(ratingValue)}
            onMouseEnter={() => handleMouseEnter(ratingValue)}
            onMouseLeave={handleMouseLeave}
            aria-label={`Rate ${ratingValue} out of ${count}`}
          >
            <Star
              size={size}
              className={cn(
                'cursor-pointer',
                ratingValue <= (hoverRating || rating) ? 'text-accent' : 'text-gray-300'
              )}
              fill={ratingValue <= (hoverRating || rating) ? 'currentColor' : 'transparent'}
            />
          </button>
        );
      })}
    </div>
  );
}
