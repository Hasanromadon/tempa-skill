import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock, Lock } from "lucide-react";
import { memo } from "react";

export interface Lesson {
  id: number;
  title: string;
  duration: number;
  order?: number;
}

export interface LessonListProps {
  lessons: Lesson[];
  currentLessonId?: number;
  completedLessonIds?: number[];
  canAccess: boolean;
  isLoading?: boolean;
  onLessonClick?: (lessonId: number) => void;
  emptyMessage?: string;
  className?: string;
}

export const LessonList = memo(function LessonList({
  lessons,
  currentLessonId,
  completedLessonIds = [],
  canAccess,
  isLoading = false,
  onLessonClick,
  emptyMessage = "Belum ada pelajaran tersedia. Periksa kembali nanti!",
  className = "",
}: LessonListProps) {
  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!lessons || lessons.length === 0) {
    return <p className="text-gray-500 text-center py-8">{emptyMessage}</p>;
  }

  return (
    <div className={`space-y-2 ${className}`} role="list" aria-label="Daftar pelajaran">
      {lessons.map((lesson, index) => {
        const isCompleted = completedLessonIds.includes(lesson.id);
        const isCurrent = lesson.id === currentLessonId;

        return (
          <div
            key={lesson.id}
            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
              canAccess ? "hover:bg-gray-50 cursor-pointer" : "bg-gray-50"
            } ${isCurrent ? "border-orange-500 bg-orange-50" : ""}`}
            onClick={() => {
              if (canAccess && onLessonClick) {
                onLessonClick(lesson.id);
              }
            }}
            onKeyDown={(e) => {
              if (canAccess && onLessonClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onLessonClick(lesson.id);
              }
            }}
            role="listitem"
            tabIndex={canAccess ? 0 : -1}
            aria-label={`Pelajaran ${index + 1}: ${lesson.title}${
              isCompleted ? ', selesai' : ''
            }${isCurrent ? ', sedang dipelajari' : ''}${
              !canAccess ? ', terkunci' : ''
            }`}
          >
            <div className="flex items-start gap-3 flex-1">
              <div
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted
                    ? "bg-green-100 text-green-700"
                    : isCurrent
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-600"
                }`}
                aria-hidden="true"
              >
                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
              </div>
              <div className="flex-1">
                <h4
                  className={`font-medium ${
                    isCurrent ? "text-orange-900" : "text-gray-900"
                  }`}
                >
                  {lesson.title}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {lesson.duration} menit
                  </span>
                  {isCompleted && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      ✓ Selesai
                    </Badge>
                  )}
                  {isCurrent && (
                    <Badge
                      variant="outline"
                      className="bg-orange-50 text-orange-700 border-orange-200"
                    >
                      Sedang Dipelajari
                    </Badge>
                  )}
                  {!canAccess && (
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-500 border-gray-300"
                    >
                      🔒 Terkunci
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {!canAccess && <Lock className="h-5 w-5 text-gray-400" />}
          </div>
        );
      })}
    </div>
  );
});
