"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReview, useUpdateReview } from "@/hooks/use-reviews";
import type { Review } from "@/types/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { StarRating } from "./star-rating";

const reviewSchema = z.object({
  rating: z.number().min(1, "Rating minimal 1").max(5, "Rating maksimal 5"),
  comment: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  courseId: number;
  existingReview?: Review;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function ReviewForm({
  courseId,
  existingReview,
  onSuccess,
  onCancel,
  className,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const isEditing = !!existingReview;

  const createReview = useCreateReview();
  const updateReview = useUpdateReview();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      comment: existingReview?.comment || "",
    },
  });

  const comment = watch("comment");

  const onSubmit = async (data: ReviewFormData) => {
    if (rating === 0) {
      return; // Rating is required
    }

    try {
      if (isEditing && existingReview) {
        await updateReview.mutateAsync({
          reviewId: existingReview.id,
          data: {
            rating,
            comment: data.comment,
          },
        });
      } else {
        await createReview.mutateAsync({
          course_id: courseId,
          rating,
          comment: data.comment,
        });
      }

      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setValue("rating", newRating);
  };

  const isLoading = createReview.isPending || updateReview.isPending;
  const error = createReview.error || updateReview.error;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">
          {isEditing ? "Edit Ulasan" : "Tulis Ulasan"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <StarRating
                rating={rating}
                interactive
                onRatingChange={handleRatingChange}
                size="lg"
              />
              <span className="text-sm text-gray-600">
                {rating > 0 && `${rating} bintang`}
              </span>
            </div>
            {errors.rating && (
              <p className="text-sm text-red-500">{errors.rating.message}</p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Komentar (Opsional)
            </label>
            <Textarea
              id="comment"
              placeholder="Bagikan pengalaman Anda dengan kursus ini..."
              className="min-h-[100px]"
              {...register("comment")}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{comment?.length || 0}/500 karakter</span>
            </div>
            {errors.comment && (
              <p className="text-sm text-red-500">{errors.comment.message}</p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error.message || "Terjadi kesalahan. Silakan coba lagi."}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Batal
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || rating === 0}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading
                ? "Menyimpan..."
                : isEditing
                ? "Update Ulasan"
                : "Kirim Ulasan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
