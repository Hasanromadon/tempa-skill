"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Review } from "@/types/api";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CheckCircle, User } from "lucide-react";
import { StarRating } from "./star-rating";

interface ReviewCardProps {
  review: Review;
  showCourseInfo?: boolean;
  className?: string;
}

export function ReviewCard({
  review,
  showCourseInfo = false,
  className,
}: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: id });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* User Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={review.user?.avatar_url}
              alt={review.user?.name || "User"}
            />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-900">
                  {review.user?.name || "Anonymous"}
                </span>
                {review.is_verified_purchase && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Pembelian Terverifikasi
                  </Badge>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {formatDate(review.created_at)}
              </span>
            </div>

            {/* Rating */}
            <StarRating rating={review.rating} size="sm" />

            {/* Comment */}
            {review.comment && (
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            )}

            {/* Course Info (if needed) */}
            {showCourseInfo && (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  Kursus ID: {review.course_id}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
