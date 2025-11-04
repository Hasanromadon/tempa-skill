"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Lesson {
  id: number;
  title: string;
  order_index: number;
  duration?: number;
  is_published: boolean;
}

interface DraggableLessonListProps {
  lessons: Lesson[];
  onReorder?: (lessons: Lesson[]) => void;
}

interface SortableItemProps {
  lesson: Lesson;
  index: number;
}

function SortableItem({ lesson, index }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <Card
        className={`p-4 cursor-move hover:border-orange-300 transition-colors ${
          isDragging ? "shadow-lg border-orange-500" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Order Number */}
          <div className="shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-sm">
            {index + 1}
          </div>

          {/* Lesson Icon & Info */}
          <FileText className="h-5 w-5 text-gray-400 shrink-0" />
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">
              {lesson.title}
            </h4>
            {lesson.duration && (
              <p className="text-xs text-gray-500">{lesson.duration} menit</p>
            )}
          </div>

          {/* Published Badge */}
          {lesson.is_published ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              Diterbitkan
            </Badge>
          ) : (
            <Badge variant="outline" className="text-gray-600">
              Draft
            </Badge>
          )}
        </div>
      </Card>
    </div>
  );
}

export function DraggableLessonList({
  lessons: initialLessons,
  onReorder,
}: DraggableLessonListProps) {
  const [lessons, setLessons] = useState(initialLessons);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = lessons.findIndex((lesson) => lesson.id === active.id);
    const newIndex = lessons.findIndex((lesson) => lesson.id === over.id);

    // Optimistically update UI
    const reorderedLessons = arrayMove(lessons, oldIndex, newIndex).map(
      (lesson, index) => ({
        ...lesson,
        order_index: index,
      })
    );

    setLessons(reorderedLessons);

    // Call parent callback if provided
    if (onReorder) {
      onReorder(reorderedLessons);
    }

    // Save to backend
    try {
      setIsSaving(true);
      setError(null);

      const updates = reorderedLessons.map((lesson) => ({
        lesson_id: lesson.id,
        order_index: lesson.order_index,
      }));

      await apiClient.patch(API_ENDPOINTS.LESSONS.REORDER, { updates });
    } catch (err) {
      console.error("Failed to reorder lessons:", err);
      setError("Gagal menyimpan urutan. Silakan coba lagi.");
      
      // Revert on error
      setLessons(initialLessons);
      if (onReorder) {
        onReorder(initialLessons);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSaving && (
        <Alert className="mb-4 bg-orange-50 border-orange-200">
          <AlertDescription className="text-orange-800">
            Menyimpan urutan pelajaran...
          </AlertDescription>
        </Alert>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={lessons.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {lessons.map((lesson, index) => (
            <SortableItem key={lesson.id} lesson={lesson} index={index} />
          ))}
        </SortableContext>
      </DndContext>

      {lessons.length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Belum ada pelajaran</p>
        </Card>
      )}
    </div>
  );
}
