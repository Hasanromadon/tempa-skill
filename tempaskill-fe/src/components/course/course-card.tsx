import { cn } from "@/app/utils/cn-classes";
import { formatCurrency } from "@/app/utils/format-currency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from "@/lib/constants";
import { ArrowRight, BookOpen, CheckCircle2, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

export interface CourseCardProps {
  course: {
    id: number;
    title: string;
    description?: string;
    slug: string;
    thumbnail_url?: string;
    difficulty: string;
    category: string;
    price: number;
    lesson_count: number;
    enrolled_count: number;
    is_enrolled?: boolean;
  };
  showProgress?: boolean;
  progress?: {
    completed_lessons: number;
    total_lessons: number;
    progress_percentage: number;
    is_completed?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const CourseCard = memo(function CourseCard({
  course,
  showProgress = false,
  progress,
  onClick,
  className = "",
}: CourseCardProps) {
  const CardBody = (
    <div
      className={cn(
        "h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative group",
        className
      )}
    >
      {/* --- IMAGE SECTION --- */}
      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-400 to-orange-600">
            <BookOpen className="h-12 w-12 text-white/50" />
          </div>
        )}

        {/* Overlay linears (for text readability if needed) */}
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Top Right: Difficulty Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge
            className={cn(
              "backdrop-blur-md shadow-sm border-none px-2.5 py-0.5 font-medium",
              DIFFICULTY_COLORS[
                course.difficulty as keyof typeof DIFFICULTY_COLORS
              ] || "bg-white/90 text-gray-700"
            )}
          >
            {DIFFICULTY_LABELS[
              course.difficulty as keyof typeof DIFFICULTY_LABELS
            ] || course.difficulty}
          </Badge>
        </div>

        {/* Top Left: Enrolled/Completed Status */}
        {showProgress && progress?.is_completed ? (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-green-500 text-white border-none shadow-sm flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Selesai
            </Badge>
          </div>
        ) : course.is_enrolled ? (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-blue-600 text-white border-none shadow-sm flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Terdaftar
            </Badge>
          </div>
        ) : null}
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="p-5 flex flex-col grow">
        {/* Category */}
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold tracking-wide text-orange-600 uppercase">
            {course.category}
          </span>
          {/* Metadata Icon Row (Lesson Count) */}
          <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
            <BookOpen className="w-3 h-3" />
            <span>{course.lesson_count} Modul</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {course.title}
        </h3>

        {/* Description (Only show if NOT showing progress to save space) */}
        {!showProgress && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 grow">
            {course.description}
          </p>
        )}

        {/* Footer Area: Switch between Price/Action or Progress Bar */}
        <div className="mt-auto pt-4 border-t border-gray-50">
          {showProgress && progress ? (
            // --- PROGRESS VIEW (Dashboard) ---
            <div className="space-y-3">
              <div className="flex justify-between items-end text-sm">
                <span className="text-gray-500 text-xs font-medium">
                  Progress Belajar
                </span>
                <span className="font-bold text-orange-600">
                  {Math.round(progress.progress_percentage)}%
                </span>
              </div>
              <Progress
                value={progress.progress_percentage}
                className="h-2 bg-gray-100"
              />
              <Button
                size="sm"
                className={cn(
                  "w-full mt-2 font-medium shadow-sm",
                  progress.is_completed
                    ? "bg-white text-green-600 border border-green-200 hover:bg-green-50"
                    : "bg-orange-600 text-white hover:bg-orange-700"
                )}
              >
                {progress.is_completed ? "Lihat Sertifikat" : "Lanjutkan"}
                {!progress.is_completed && (
                  <ArrowRight className="ml-1 w-4 h-4" />
                )}
              </Button>
            </div>
          ) : (
            // --- STANDARD VIEW (Marketplace) ---
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-gray-900 tracking-tight">
                  {formatCurrency(course.price)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-semibold p-0 h-auto"
              >
                {course.is_enrolled ? "Buka Kursus" : "Detail"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Wrapper Logic
  if (onClick) {
    return (
      <div
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className="block h-full focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded-2xl"
      >
        {CardBody}
      </div>
    );
  }

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="block h-full focus:outline-none"
    >
      {CardBody}
    </Link>
  );
});
