
"use client";

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type StarRatingProps = {
  count?: number;
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  disabled?: boolean;
};

export function StarRating({ count = 5, rating, onRatingChange, size = 24, disabled = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleRating = (rate: number) => {
    if (disabled) return;
    onRatingChange(rate);
  };

  const handleMouseEnter = (rate: number) => {
    if (disabled) return;
    setHoverRating(rate);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverRating(0);
  };

  return (
    <div className={cn("flex items-center gap-1", disabled && "opacity-50")}>
      {[...Array(count)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            className={cn("focus:outline-none transition-transform duration-150 ease-in-out", !disabled && "hover:scale-110")}
            onClick={() => handleRating(ratingValue)}
            onMouseEnter={() => handleMouseEnter(ratingValue)}
            onMouseLeave={handleMouseLeave}
            aria-label={`Rate ${ratingValue} out of ${count}`}
            disabled={disabled}
          >
            <Star
              size={size}
              className={cn(
                disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                ratingValue <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
              )}
              fill={ratingValue <= (hoverRating || rating) ? 'currentColor' : 'transparent'}
            />
          </button>
        );
      })}
    </div>
  );
}
