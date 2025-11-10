"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number; // 1-5
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starRating = i + 1;
        const isFilled = starRating <= rating;

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleStarClick(starRating)}
            disabled={!interactive}
            className={cn(
              "transition-colors",
              interactive && "hover:text-orange-400 cursor-pointer",
              !interactive && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled
                  ? "fill-orange-400 text-orange-400"
                  : "fill-none text-gray-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

// Display component for showing rating with text
interface RatingDisplayProps {
  rating: number;
  totalReviews?: number;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RatingDisplay({
  rating,
  totalReviews,
  showText = true,
  size = "md",
  className,
}: RatingDisplayProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <StarRating rating={rating} size={size} />
      {showText && (
        <span className="text-sm text-gray-600">
          {rating.toFixed(1)}
          {totalReviews !== undefined && ` (${totalReviews} ulasan)`}
        </span>
      )}
    </div>
  );
}
