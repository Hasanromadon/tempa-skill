"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseReviews, useCourseReviewSummary } from "@/hooks/use-reviews";
import type { ReviewListQuery } from "@/types/api";
import { useState } from "react";
import { ReviewCard } from "./review-card";
import { RatingDisplay } from "./star-rating";

interface ReviewListProps {
  courseId: number;
  showSummary?: boolean;
  className?: string;
}

export function ReviewList({
  courseId,
  showSummary = true,
  className,
}: ReviewListProps) {
  const [params, setParams] = useState<ReviewListQuery>({
    page: 1,
    limit: 10,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const {
    data: reviewsData,
    isLoading,
    error,
  } = useCourseReviews(courseId, params);
  const { data: summaryData } = useCourseReviewSummary(courseId);

  const handleSortChange = (sortBy: string) => {
    const [field, order] = sortBy.split("-");
    setParams((prev) => ({
      ...prev,
      sort_by: field as ReviewListQuery["sort_by"],
      sort_order: order as ReviewListQuery["sort_order"],
      page: 1, // Reset to first page
    }));
  };

  const handleRatingFilter = (rating: string) => {
    setParams((prev) => ({
      ...prev,
      rating: rating === "all" ? undefined : parseInt(rating),
      page: 1, // Reset to first page
    }));
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Gagal memuat ulasan. Silakan coba lagi.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={className}>
      {/* Summary */}
      {showSummary && summaryData && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Ringkasan Ulasan</h3>
                <RatingDisplay
                  rating={summaryData.average_rating}
                  totalReviews={summaryData.total_reviews}
                  size="lg"
                />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  {summaryData.average_rating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">
                  dari {summaryData.total_reviews} ulasan
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="mt-4 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count =
                  summaryData.rating_distribution[
                    rating as keyof typeof summaryData.rating_distribution
                  ];
                const percentage =
                  summaryData.total_reviews > 0
                    ? (count / summaryData.total_reviews) * 100
                    : 0;

                return (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Sort */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Select
            value={`${params.sort_by}-${params.sort_order}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Urutkan berdasarkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at-desc">Terbaru</SelectItem>
              <SelectItem value="created_at-asc">Terlama</SelectItem>
              <SelectItem value="rating-desc">Rating Tertinggi</SelectItem>
              <SelectItem value="rating-asc">Rating Terendah</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={params.rating?.toString() || "all"}
            onValueChange={handleRatingFilter}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Rating</SelectItem>
              <SelectItem value="5">5 Bintang</SelectItem>
              <SelectItem value="4">4 Bintang</SelectItem>
              <SelectItem value="3">3 Bintang</SelectItem>
              <SelectItem value="2">2 Bintang</SelectItem>
              <SelectItem value="1">1 Bintang</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-gray-600">
          {reviewsData?.pagination.total || 0} ulasan
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }, (_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : reviewsData?.items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">
                Belum ada ulasan untuk kursus ini.
              </p>
            </CardContent>
          </Card>
        ) : (
          reviewsData?.items.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </div>

      {/* Pagination */}
      {reviewsData && reviewsData.pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(params.page! - 1)}
            disabled={params.page === 1}
          >
            Sebelumnya
          </Button>

          <span className="text-sm text-gray-600">
            Halaman {reviewsData.pagination.page} dari{" "}
            {reviewsData.pagination.total_pages}
          </span>

          <Button
            variant="outline"
            onClick={() => handlePageChange(params.page! + 1)}
            disabled={params.page === reviewsData.pagination.total_pages}
          >
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  );
}
