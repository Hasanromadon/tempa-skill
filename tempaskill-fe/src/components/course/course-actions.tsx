import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCoursePermissions } from "@/hooks";
import type { Course } from "@/types/api";
import { Edit, Eye, EyeOff, MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";

interface CourseActionsProps {
  course: Course;
  onTogglePublish: (id: number, currentStatus: boolean, title: string) => void;
  onDelete: (id: number, title: string) => void;
  isToggling?: boolean;
  basePath?: string; // "/admin" or "/instructor"
}

export function CourseActions({
  course,
  onTogglePublish,
  onDelete,
  isToggling = false,
  basePath = "/admin",
}: CourseActionsProps) {
  // For /instructor route: all courses are guaranteed to be owned by current user (JWT auto-filter)
  // For /admin route: need to check permissions (admin can see all courses)
  const permissions = basePath === "/instructor"
    ? { canEdit: true, canDelete: true, isOwner: true, isAdmin: false }
    : useCoursePermissions(course.instructor_id);

  const { canEdit, canDelete, isOwner, isAdmin } = permissions;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Aksi untuk ${course.title}`}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Edit - Only if can edit */}
        <DropdownMenuItem asChild disabled={!canEdit}>
          <Link href={`${basePath}/courses/${course.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
            {!canEdit && (
              <span className="ml-auto text-xs text-gray-400">(Locked)</span>
            )}
          </Link>
        </DropdownMenuItem>

        {/* Manage Lessons - Only if can edit */}
        <DropdownMenuItem asChild disabled={!canEdit}>
          <Link href={`${basePath}/courses/${course.id}/lessons`}>
            <Eye className="h-4 w-4 mr-2" />
            Kelola Pelajaran
            {!canEdit && (
              <span className="ml-auto text-xs text-gray-400">(Locked)</span>
            )}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Publish/Unpublish - Only if can edit */}
        <DropdownMenuItem
          onClick={() =>
            onTogglePublish(course.id, course.is_published, course.title)
          }
          disabled={!canEdit || isToggling}
        >
          {course.is_published ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Unpublish
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Publish
            </>
          )}
          {!canEdit && (
            <span className="ml-auto text-xs text-gray-400">(Locked)</span>
          )}
        </DropdownMenuItem>

        {/* Delete - Only if can delete */}
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => onDelete(course.id, course.title)}
          disabled={!canDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Hapus
          {!canDelete && (
            <span className="ml-auto text-xs text-gray-400">(Locked)</span>
          )}
        </DropdownMenuItem>

        {/* Info footer */}
        {!isAdmin && !isOwner && (
          <div className="px-2 py-1.5 text-xs text-gray-500 border-t">
            ℹ️ Hanya pemilik yang dapat mengedit
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
