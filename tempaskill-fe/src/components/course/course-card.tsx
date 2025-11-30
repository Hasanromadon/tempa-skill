import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { BookOpen, Users } from "lucide-react";
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
  const content = (
    <Card
      className={`h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden ${className} pt-0`}
      role="article"
      aria-label={`Kursus: ${course.title}`}
    >
      {/* Course Thumbnail */}
      <div className="relative w-full h-48 bg-gray-200">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={`Gambar kursus ${course.title}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600"
            aria-hidden="true"
          >
            <BookOpen className="h-16 w-16 text-white opacity-50" />
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge
            className={
              DIFFICULTY_COLORS[
                course.difficulty as keyof typeof DIFFICULTY_COLORS
              ] || DIFFICULTY_COLORS.beginner
            }
          >
            {DIFFICULTY_LABELS[
              course.difficulty as keyof typeof DIFFICULTY_LABELS
            ] || course.difficulty}
          </Badge>
          {course.is_enrolled && <Badge variant="outline">Terdaftar</Badge>}
        </div>
        <CardTitle className="text-xl line-clamp-2">{course.title}</CardTitle>
        {course.description && (
          <CardDescription className="line-clamp-2">
            {course.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        {showProgress && progress ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {progress.completed_lessons} dari {progress.total_lessons}{" "}
                pelajaran selesai
              </span>
              <span className="font-medium">
                {progress.progress_percentage}%
              </span>
            </div>
            <Progress value={progress.progress_percentage} />
            {progress.is_completed && (
              <p className="text-sm text-green-600 font-medium mt-2">
                ✓ Selesai
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{course.lesson_count} pelajaran</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.enrolled_count} siswa</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500 capitalize">
                {course.category}
              </span>
              <span className="text-lg font-bold text-orange-600">
                {formatCurrency(course.price)}
              </span>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className={
            course.is_enrolled
              ? "w-full border-orange-600 text-orange-600 hover:bg-orange-50"
              : "w-full bg-orange-600 hover:bg-orange-700 text-white"
          }
          variant={course.is_enrolled ? "outline" : "default"}
          aria-label={
            course.is_enrolled
              ? `Lanjutkan belajar kursus ${course.title}`
              : `Lihat detail kursus ${course.title}`
          }
        >
          {course.is_enrolled ? "Lanjutkan Belajar" : "Lihat Kursus"}
        </Button>
      </CardFooter>
    </Card>
  );

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
        aria-label={`Pilih kursus ${course.title}`}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/courses/${course.slug}`}
      aria-label={`Buka halaman kursus ${course.title}`}
    >
      {content}
    </Link>
  );
});
